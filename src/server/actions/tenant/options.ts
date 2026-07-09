"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { COLLECTION_DEFINITIONS, type CollectionField, type CollectionKey } from "@/lib/collection-definitions";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import { verifySecurityStamp } from "@/server/services/security-stamp";
import { generateSlug } from "@/lib/slugify";

const variantIdSchema = z.string().min(1);
const optionSetIdSchema = z.string().min(1);

const addValueSchema = z.object({
  optionSetId: z.string().min(1),
  label: z.string().trim().min(1).max(200),
});

const updateLabelSchema = z.object({
  valueId: z.string().min(1),
  label: z.string().trim().min(1).max(200),
});

const deleteValueSchema = z.object({
  valueId: z.string().min(1),
});

const mergeValueSchema = z.object({
  sourceValueId: z.string().min(1),
  targetValueId: z.string().min(1),
});

const toggleActiveSchema = z.object({
  valueId: z.string().min(1),
  isActive: z.boolean(),
});

const updateSortSchema = z.object({
  values: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export async function listOptionSets(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = variantIdSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        variantId: ["Variant tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await db.variant.findFirst({
      where: { id: parsed.data },
      select: { id: true },
    });

    if (!variant) {
      throw new ValidationError({
        variantId: ["Variant tidak ditemukan."],
      });
    }

    const optionSets = await db.optionSet.findMany({
      where: { variantId: parsed.data },
      orderBy: { key: "asc" },
      select: {
        id: true,
        key: true,
        label: true,
        _count: {
          select: { values: true },
        },
      },
    });

    return {
      ok: true,
      optionSets: optionSets.map((optionSet) => ({
        id: optionSet.id,
        key: optionSet.key,
        label: optionSet.label,
        valuesCount: optionSet._count.values,
      })),
    };
  } catch (error) {
    return toActionError(error, "Option sets gagal dimuat.");
  }
}

export async function getOptionSetValues(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = optionSetIdSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        optionSetId: ["Option set tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const optionSet = await db.optionSet.findFirst({
      where: { id: parsed.data },
      select: { id: true, key: true, label: true, variantId: true },
    });

    if (!optionSet) {
      throw new ValidationError({
        optionSetId: ["Option set tidak ditemukan."],
      });
    }

    const values = await db.optionValue.findMany({
      where: { optionSetId: parsed.data },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        value: true,
        label: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      },
    });

    const usageCounts = await countOptionUsagesForValues(
      db,
      optionSet.variantId,
      optionSet.key,
      values,
    );

    return {
      ok: true,
      values: values.map((value) => ({
        id: value.id,
        value: value.value,
        label: value.label,
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        createdAt: value.createdAt.toISOString(),
        usageCount: usageCounts.get(value.id) ?? 0,
      })),
    };
  } catch (error) {
    return toActionError(error, "Values gagal dimuat.");
  }
}

export async function addOptionValue(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = addValueSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        label: ["Label tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const optionSet = await db.optionSet.findFirst({
      where: { id: parsed.data.optionSetId },
      select: { id: true, key: true, variantId: true },
    });

    if (!optionSet) {
      throw new ValidationError({
        optionSetId: ["Option set tidak ditemukan."],
      });
    }

    const autoValue = generateSlug(parsed.data.label);
    const existingValue = await db.optionValue.findFirst({
      where: {
        optionSetId: parsed.data.optionSetId,
        value: autoValue,
      },
      select: { id: true },
    });

    if (existingValue) {
      throw new ValidationError({
        label: ["Value sudah ada (slug konflik)."],
      });
    }

    const maxSortOrder = await db.optionValue.findFirst({
      where: { optionSetId: parsed.data.optionSetId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await db.optionValue.create({
      data: {
        optionSetId: parsed.data.optionSetId,
        value: autoValue,
        label: parsed.data.label,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
        isActive: true,
      },
      select: {
        id: true,
        value: true,
        label: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "options.addValue",
      targetType: "OptionValue",
      targetId: created.id,
      metadata: {
        optionSetId: parsed.data.optionSetId,
        optionSetKey: optionSet.key,
        value: created.value,
        label: created.label,
      },
      ipAddress: null,
    });

    await revalidateTag(`variant:${optionSet.variantId}`, { expire: 0 });

    return {
      ok: true,
      value: serializeOptionValue(created, 0),
    };
  } catch (error) {
    return toActionError(error, "Value gagal ditambahkan.");
  }
}

export async function updateOptionValueLabel(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = updateLabelSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        label: ["Label tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const existing = await db.optionValue.findFirst({
      where: { id: parsed.data.valueId },
      select: {
        id: true,
        value: true,
        label: true,
        optionSetId: true,
        optionSet: {
          select: { variantId: true, key: true },
        },
      },
    });

    if (!existing) {
      throw new ValidationError({
        valueId: ["Value tidak ditemukan."],
      });
    }

    const duplicate = await db.optionValue.findFirst({
      where: {
        optionSetId: existing.optionSetId,
        label: parsed.data.label,
        NOT: { id: existing.id },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ValidationError({
        label: ["Label sudah dipakai. Gunakan merge untuk menggabungkan value."],
      });
    }

    const updated = await db.optionValue.update({
      where: { id: parsed.data.valueId },
      data: { label: parsed.data.label },
      select: {
        id: true,
        value: true,
        label: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      },
    });

    const usageCount = await countOptionUsage(
      db,
      existing.optionSet.variantId,
      existing.optionSet.key,
      updated,
    );

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "options.updateValueLabel",
      targetType: "OptionValue",
      targetId: updated.id,
      metadata: {
        optionSetId: existing.optionSetId,
        optionSetKey: existing.optionSet.key,
        value: existing.value,
        previousLabel: existing.label,
        nextLabel: updated.label,
      },
      ipAddress: null,
    });

    await revalidateTag(`variant:${existing.optionSet.variantId}`, { expire: 0 });

    return {
      ok: true,
      value: serializeOptionValue(updated, usageCount),
    };
  } catch (error) {
    return toActionError(error, "Label value gagal diubah.");
  }
}

export async function toggleOptionValue(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = toggleActiveSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        valueId: ["Value tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const existing = await db.optionValue.findFirst({
      where: { id: parsed.data.valueId },
      select: {
        id: true,
        value: true,
        label: true,
        optionSetId: true,
        optionSet: {
          select: { variantId: true, key: true },
        },
      },
    });

    if (!existing) {
      throw new ValidationError({
        valueId: ["Value tidak ditemukan."],
      });
    }

    const updated = await db.optionValue.update({
      where: { id: parsed.data.valueId },
      data: { isActive: parsed.data.isActive },
      select: {
        id: true,
        value: true,
        label: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      },
    });

    const usageCount = await countOptionUsage(
      db,
      existing.optionSet.variantId,
      existing.optionSet.key,
      updated,
    );

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "options.toggleValue",
      targetType: "OptionValue",
      targetId: updated.id,
      metadata: {
        optionSetId: existing.optionSetId,
        value: existing.value,
        isActive: updated.isActive,
      },
      ipAddress: null,
    });

    await revalidateTag(`variant:${existing.optionSet.variantId}`, { expire: 0 });

    return {
      ok: true,
      value: serializeOptionValue(updated, usageCount),
    };
  } catch (error) {
    return toActionError(error, "Status value gagal diubah.");
  }
}

export async function deleteOptionValue(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = deleteValueSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        valueId: ["Value tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const existing = await db.optionValue.findFirst({
      where: { id: parsed.data.valueId },
      select: {
        id: true,
        value: true,
        label: true,
        optionSetId: true,
        optionSet: {
          select: { variantId: true, key: true },
        },
      },
    });

    if (!existing) {
      throw new ValidationError({
        valueId: ["Value tidak ditemukan."],
      });
    }

    const usageCount = await countOptionUsage(
      db,
      existing.optionSet.variantId,
      existing.optionSet.key,
      existing,
    );

    if (usageCount > 0) {
      throw new ValidationError({
        valueId: [
          `Value masih dipakai di ${usageCount} konten. Gunakan merge atau lepas referensi sebelum hapus.`,
        ],
      });
    }

    await db.optionValue.delete({
      where: { id: parsed.data.valueId },
      select: { id: true },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "options.deleteValue",
      targetType: "OptionValue",
      targetId: existing.id,
      metadata: {
        optionSetId: existing.optionSetId,
        optionSetKey: existing.optionSet.key,
        value: existing.value,
        label: existing.label,
      },
      ipAddress: null,
    });

    await revalidateTag(`variant:${existing.optionSet.variantId}`, { expire: 0 });

    return {
      ok: true,
      valueId: existing.id,
    };
  } catch (error) {
    return toActionError(error, "Value gagal dihapus.");
  }
}

export async function mergeOptionValue(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = mergeValueSchema.safeParse(input);

    if (!parsed.success || parsed.data.sourceValueId === parsed.data.targetValueId) {
      throw new ValidationError({
        valueId: ["Value merge tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const values = await db.optionValue.findMany({
      where: {
        id: {
          in: [parsed.data.sourceValueId, parsed.data.targetValueId],
        },
      },
      select: {
        id: true,
        value: true,
        label: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        optionSetId: true,
        optionSet: {
          select: { variantId: true, key: true },
        },
      },
    });

    const source = values.find((value) => value.id === parsed.data.sourceValueId);
    const target = values.find((value) => value.id === parsed.data.targetValueId);

    if (!source || !target) {
      throw new ValidationError({
        valueId: ["Value tidak ditemukan."],
      });
    }

    if (source.optionSetId !== target.optionSetId) {
      throw new ValidationError({
        valueId: ["Value hanya bisa digabung dalam option set yang sama."],
      });
    }

    const replacement = await replaceOptionReferences(
      db,
      source.optionSet.variantId,
      source.optionSet.key,
      { id: source.id, value: source.value },
      target.id,
    );

    await db.optionValue.delete({
      where: { id: source.id },
      select: { id: true },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "options.mergeValue",
      targetType: "OptionValue",
      targetId: source.id,
      metadata: {
        optionSetId: source.optionSetId,
        optionSetKey: source.optionSet.key,
        sourceValue: source.value,
        sourceLabel: source.label,
        targetValueId: target.id,
        targetValue: target.value,
        targetLabel: target.label,
        affectedItems: replacement.affectedItems,
        replacedReferences: replacement.replacedReferences,
      },
      ipAddress: null,
    });

    await revalidateOptionUsage(
      source.optionSet.variantId,
      replacement.affectedItems.map((item) => ({
        collectionKey: item.collectionKey,
        slug: item.slug,
      })),
    );

    const targetUsageCount = await countOptionUsage(
      db,
      target.optionSet.variantId,
      target.optionSet.key,
      target,
    );

    return {
      ok: true,
      sourceValueId: source.id,
      targetValue: serializeOptionValue(target, targetUsageCount),
      affectedItems: replacement.affectedItems.length,
      replacedReferences: replacement.replacedReferences,
    };
  } catch (error) {
    return toActionError(error, "Value gagal digabung.");
  }
}

export async function updateOptionValueSort(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = updateSortSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        values: ["Data sort tidak valid."],
      });
    }

    const db = tenantDb(context.session);

    await Promise.all(
      parsed.data.values.map((item) =>
        db.optionValue.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
          select: { id: true },
        }),
      ),
    );

    return { ok: true };
  } catch (error) {
    return toActionError(error, "Sort gagal diubah.");
  }
}

type TenantDb = ReturnType<typeof tenantDb>;

type OptionValueIdentity = {
  id: string;
  value: string;
};

type OptionValueSerializable = OptionValueIdentity & {
  label: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
};

type OptionUsageItem = {
  id: string;
  title: string;
  slug: string;
  collectionKey: string;
  dataJson: unknown;
  publishedDataJson: unknown;
};

async function countOptionUsage(
  db: TenantDb,
  variantId: string,
  optionSetKey: string,
  value: OptionValueIdentity,
) {
  const usageCounts = await countOptionUsagesForValues(db, variantId, optionSetKey, [value]);
  return usageCounts.get(value.id) ?? 0;
}

async function countOptionUsagesForValues(
  db: TenantDb,
  variantId: string,
  optionSetKey: string,
  values: OptionValueIdentity[],
) {
  const usageCounts = new Map(values.map((value) => [value.id, 0]));

  if (values.length === 0) {
    return usageCounts;
  }

  const items = await findOptionUsageItems(db, variantId);

  for (const item of items) {
    const paths = getOptionReferencePaths(item.collectionKey, optionSetKey);

    if (paths.length === 0) {
      continue;
    }

    for (const value of values) {
      const needles = new Set([value.id, value.value]);
      const used =
        jsonUsesOptionAtPaths(item.dataJson, paths, needles) ||
        jsonUsesOptionAtPaths(item.publishedDataJson, paths, needles);

      if (used) {
        usageCounts.set(value.id, (usageCounts.get(value.id) ?? 0) + 1);
      }
    }
  }

  return usageCounts;
}

async function replaceOptionReferences(
  db: TenantDb,
  variantId: string,
  optionSetKey: string,
  source: OptionValueIdentity,
  targetId: string,
) {
  const items = await findOptionUsageItems(db, variantId);
  const affectedItems: Array<{ id: string; title: string; slug: string; collectionKey: string }> = [];
  let replacedReferences = 0;

  for (const item of items) {
    const paths = getOptionReferencePaths(item.collectionKey, optionSetKey);

    if (paths.length === 0) {
      continue;
    }

    const needles = new Set([source.id, source.value]);
    const dataJson = cloneJson(item.dataJson);
    const draftResult = replaceOptionAtPaths(dataJson, paths, needles, targetId);
    const publishedDataJson = item.publishedDataJson == null
      ? null
      : cloneJson(item.publishedDataJson);
    const publishedResult = publishedDataJson == null
      ? { changed: false, count: 0 }
      : replaceOptionAtPaths(publishedDataJson, paths, needles, targetId);

    if (!draftResult.changed && !publishedResult.changed) {
      continue;
    }

    const updateData: {
      dataJson?: Prisma.InputJsonValue;
      publishedDataJson?: Prisma.InputJsonValue;
    } = {};

    if (draftResult.changed) {
      updateData.dataJson = toPrismaJson(dataJson);
    }

    if (publishedResult.changed && publishedDataJson != null) {
      updateData.publishedDataJson = toPrismaJson(publishedDataJson);
    }

    await db.contentItem.update({
      where: { id: item.id },
      data: updateData,
      select: { id: true },
    });

    affectedItems.push({
      id: item.id,
      title: item.title,
      slug: item.slug,
      collectionKey: item.collectionKey,
    });
    replacedReferences += draftResult.count + publishedResult.count;
  }

  return { affectedItems, replacedReferences };
}

async function findOptionUsageItems(db: TenantDb, variantId: string): Promise<OptionUsageItem[]> {
  return db.contentItem.findMany({
    where: { variantId },
    select: {
      id: true,
      title: true,
      slug: true,
      collectionKey: true,
      dataJson: true,
      publishedDataJson: true,
    },
  });
}

function getOptionReferencePaths(collectionKey: string, optionSetKey: string) {
  const definition = COLLECTION_DEFINITIONS[collectionKey as CollectionKey];

  if (!definition) {
    return [];
  }

  const paths = new Set<string>();

  for (const filter of definition.optionFilters) {
    if (filter.optionSetKey === optionSetKey) {
      paths.add(filter.path);
    }
  }

  for (const section of definition.sections) {
    collectOptionReferencePaths(section.fields, optionSetKey, paths);
  }

  return [...paths];
}

function collectOptionReferencePaths(
  fields: CollectionField[],
  optionSetKey: string,
  paths: Set<string>,
) {
  for (const field of fields) {
    if (
      (field.kind === "select" || field.kind === "multiselect") &&
      field.optionSetKey === optionSetKey
    ) {
      paths.add(field.path);
    }

    if (field.kind === "array") {
      collectOptionReferencePaths(field.fields, optionSetKey, paths);
    }
  }
}

function jsonUsesOptionAtPaths(
  data: unknown,
  paths: string[],
  needles: Set<string>,
) {
  return paths.some((path) => selectionUsesOption(getAtPath(data, path), needles));
}

function selectionUsesOption(value: unknown, needles: Set<string>) {
  if (typeof value === "string") {
    return needles.has(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => typeof item === "string" && needles.has(item));
  }

  return false;
}

function replaceOptionAtPaths(
  data: unknown,
  paths: string[],
  needles: Set<string>,
  targetId: string,
) {
  let changed = false;
  let count = 0;

  for (const path of paths) {
    const current = getAtPath(data, path);
    const result = replaceSelectionValue(current, needles, targetId);

    if (result.changed) {
      setAtPath(data, path, result.value);
      changed = true;
      count += result.count;
    }
  }

  return { changed, count };
}

function replaceSelectionValue(
  value: unknown,
  needles: Set<string>,
  targetId: string,
) {
  if (typeof value === "string") {
    return needles.has(value)
      ? { changed: true, value: targetId, count: 1 }
      : { changed: false, value, count: 0 };
  }

  if (!Array.isArray(value)) {
    return { changed: false, value, count: 0 };
  }

  let changed = false;
  let count = 0;
  const next = value.map((item) => {
    if (typeof item === "string" && needles.has(item)) {
      changed = true;
      count += 1;
      return targetId;
    }

    return item;
  });

  return { changed, value: changed ? Array.from(new Set(next)) : value, count };
}

function getAtPath(data: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!isRecord(current)) {
      return undefined;
    }

    return current[part];
  }, data);
}

function setAtPath(data: unknown, path: string, value: unknown) {
  const parts = path.split(".");
  let current = data;

  for (const part of parts.slice(0, -1)) {
    if (!isRecord(current)) {
      return;
    }

    current = current[part];
  }

  if (isRecord(current)) {
    current[parts[parts.length - 1]] = value;
  }
}

async function revalidateOptionUsage(
  variantId: string,
  items: Array<{ collectionKey: string; slug: string }>,
) {
  await revalidateTag(`variant:${variantId}`, { expire: 0 });

  const collectionKeys = new Set(items.map((item) => item.collectionKey));
  await Promise.all(
    [...collectionKeys].map((collectionKey) =>
      revalidateTag(`collection:${variantId}:${collectionKey}`, { expire: 0 }),
    ),
  );

  await Promise.all(
    items.map((item) =>
      revalidateTag(`item:${variantId}:${item.collectionKey}:${item.slug}`, { expire: 0 }),
    ),
  );
}

function serializeOptionValue(value: OptionValueSerializable, usageCount: number) {
  return {
    id: value.id,
    value: value.value,
    label: value.label,
    sortOrder: value.sortOrder,
    isActive: value.isActive,
    createdAt: value.createdAt.toISOString(),
    usageCount,
  };
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function requireTenantActionContext() {
  const session = await auth();
  const user = session?.user;

  if (!session || !user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (user.role !== "TENANT_ADMIN" || !user.tenantId) {
    throw new ForbiddenError("Akses tenant diperlukan.");
  }

  await verifySecurityStamp(session);

  return {
    session,
    userId: user.userId,
    tenantId: user.tenantId,
  };
}

function toActionError(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      redirectTo: "/dashboard/login",
    };
  }

  if (error instanceof AppError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    ok: false,
    error: fallback,
  };
}
