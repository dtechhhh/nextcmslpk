"use server";

import { z } from "zod";

import { auth } from "@/auth";
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
      select: { id: true, key: true, label: true },
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

    return {
      ok: true,
      values: values.map((value) => ({
        id: value.id,
        value: value.value,
        label: value.label,
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        createdAt: value.createdAt.toISOString(),
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
      select: { id: true, key: true },
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
        label: ["Value sudah ada (sluq konflik)."],
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

    return {
      ok: true,
      value: {
        ...created,
        createdAt: created.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Value gagal ditambahkan.");
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
      select: { id: true, value: true, label: true, optionSetId: true },
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

    return {
      ok: true,
      value: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Status value gagal diubah.");
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
