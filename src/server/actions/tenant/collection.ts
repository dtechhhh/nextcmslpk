"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import {
  ALL_COLLECTION_KEYS,
  COLLECTION_DEFINITIONS,
  getCollectionDefinition,
  getPublicItemPath,
  isAllowedCollectionKey,
  type PublishStatus,
} from "@/lib/collection-definitions";
import type { CollectionKey } from "@/lib/constants";
import { AppError, AuthError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slugify";
import { getCollectionSchema } from "@/lib/validations/collections";
import { zodErrorToFieldErrors } from "@/lib/validations/global/_shared";
import { prisma } from "@/server/db/client";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import { signPreviewToken } from "@/server/services/preview-token";
import { getPublicUrl } from "@/server/services/storage";
import { verifySecurityStamp } from "@/server/services/security-stamp";
import type { VariantKey } from "@/types";

const collectionKeySchema = z.enum(ALL_COLLECTION_KEYS);
const statusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED", "FILLED"]);
const itemIdSchema = z.string().min(1);

const listItemsSchema = z.object({
  variantId: z.string().min(1),
  collectionKey: collectionKeySchema,
  status: statusSchema.or(z.literal("ALL")).optional(),
  page: z.coerce.number().int().min(1).default(1),
  filters: z.record(z.string(), z.string()).default({}),
});

const createItemSchema = z.object({
  variantId: z.string().min(1),
  collectionKey: collectionKeySchema,
  data: z.unknown(),
});

const updateItemSchema = z.object({
  itemId: z.string().min(1),
  data: z.unknown(),
});

const statusUpdateSchema = z.object({
  itemId: z.string().min(1),
  status: statusSchema,
});

const slugAvailabilitySchema = z.object({
  variantId: z.string().min(1),
  collectionKey: collectionKeySchema,
  slug: z.string().trim().max(120),
  itemId: z.string().min(1).optional(),
});

const PAGE_SIZE = 12;

type CompatibleOptionFilters = Record<string, string | string[]>;

export async function listItems(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = listItemsSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input filter tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const collectionKey = assertOwnedCollectionKey(
      variant.key,
      parsed.data.collectionKey,
    );

    const where: Prisma.ContentItemWhereInput = {
      variantId: variant.id,
      collectionKey,
    };

    if (parsed.data.status && parsed.data.status !== "ALL") {
      where.status = parsed.data.status;
    }

    const rows = await db.contentItem.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        excerpt: true,
        thumbnailImageId: true,
        isFeatured: true,
        publishedAt: true,
        startAt: true,
        expiredAt: true,
        sortOrder: true,
        collectionKey: true,
        dataJson: true,
        updatedAt: true,
        thumbnailImage: {
          select: {
            id: true,
            fileName: true,
            storagePath: true,
          },
        },
      },
    });

    const compatibleFilters = await resolveCompatibleOptionFilters(
      db,
      variant.id,
      collectionKey,
      parsed.data.filters,
    );

    const filteredRows = rows.filter((item) =>
      matchesOptionFilters(item.dataJson, compatibleFilters),
    );
    const total = filteredRows.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const start = (parsed.data.page - 1) * PAGE_SIZE;
    const pageRows = filteredRows.slice(start, start + PAGE_SIZE);

    return {
      ok: true,
      items: pageRows.map(normalizeListItem),
      total,
      page: parsed.data.page,
      pageSize: PAGE_SIZE,
      totalPages,
    };
  } catch (error) {
    return toActionError(error, "Data gagal dimuat.");
  }
}

export async function getItem(itemId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = itemIdSchema.safeParse(itemId);

    if (!parsed.success) {
      throw new ValidationError({
        itemId: ["ID tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItem(db, parsed.data);
    const variantKey = toVariantKey(item.variant.key);
    const collectionKey = assertOwnedCollectionKey(variantKey, item.collectionKey);

    return {
      ok: true,
      item: {
        id: item.id,
        tenantId: context.tenantId,
        variantId: item.variantId,
        variantKey,
        collectionKey,
        title: item.title,
        slug: item.slug,
        status: item.status,
        excerpt: item.excerpt,
        thumbnailImageId: item.thumbnailImageId,
        heroImageId: item.heroImageId,
        isFeatured: item.isFeatured,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        startAt: item.startAt?.toISOString() ?? null,
        expiredAt: item.expiredAt?.toISOString() ?? null,
        sortOrder: item.sortOrder,
        dataJson: normalizeItemData(item.dataJson),
        publishedDataJson: normalizeNullableItemData(item.publishedDataJson),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Item gagal dimuat.");
  }
}

export async function createItem(
  variantId: unknown,
  collectionKey: unknown,
  data: unknown,
) {
  try {
    const context = await requireTenantActionContext();
    const parsed = createItemSchema.safeParse({ variantId, collectionKey, data });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const normalizedCollectionKey = assertOwnedCollectionKey(
      variant.key,
      parsed.data.collectionKey,
    );
    const validatedData = validateCollectionData(
      normalizedCollectionKey,
      parsed.data.data,
    );
    const normalizedData = normalizeEditableData(
      normalizedCollectionKey,
      validatedData,
    );
    const scalarData = getScalarItemData(normalizedCollectionKey, normalizedData);

    await assertSlugAvailable(db, {
      variantId: variant.id,
      collectionKey: normalizedCollectionKey,
      slug: scalarData.slug,
    });

    const created = await db.contentItem.create({
      data: {
        tenantId: context.tenantId,
        variantId: variant.id,
        collectionKey: normalizedCollectionKey,
        ...scalarData,
        dataJson: toPrismaJson(normalizedData),
        updatedBy: context.userId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        collectionKey: true,
        dataJson: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.create",
      targetType: "ContentItem",
      targetId: created.id,
      metadata: {
        variantId: variant.id,
        variantKey: variant.key,
        collectionKey: normalizedCollectionKey,
      },
      ipAddress: null,
    });

    revalidatePath(getCollectionDefinition(normalizedCollectionKey).listPath);

    return {
      ok: true,
      item: {
        id: created.id,
        title: created.title,
        slug: created.slug,
        status: created.status,
        collectionKey: created.collectionKey,
        dataJson: normalizeItemData(created.dataJson),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Item gagal dibuat.");
  }
}

export async function updateItem(itemId: unknown, data: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = updateItemSchema.safeParse({ itemId, data });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItemForMutation(db, parsed.data.itemId);
    const validatedData = validateCollectionData(item.collectionKey, parsed.data.data);
    const normalizedData = normalizeEditableData(item.collectionKey, validatedData);
    const scalarData = getScalarItemData(item.collectionKey, normalizedData, item);

    await assertSlugAvailable(db, {
      variantId: item.variantId,
      collectionKey: item.collectionKey,
      slug: scalarData.slug,
      itemId: item.id,
    });

    const updated = await db.contentItem.update({
      where: { id: item.id },
      data: {
        ...scalarData,
        dataJson: toPrismaJson(normalizedData),
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.update",
      targetType: "ContentItem",
      targetId: item.id,
      metadata: {
        variantId: item.variantId,
        collectionKey: item.collectionKey,
        status: updated.status,
      },
      ipAddress: null,
    });

    revalidatePath(getCollectionDefinition(item.collectionKey).listPath);

    return {
      ok: true,
      item: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizeItemData(updated.dataJson),
        publishedDataJson: normalizeNullableItemData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Item gagal disimpan.");
  }
}

export async function publishItem(itemId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = itemIdSchema.safeParse(itemId);

    if (!parsed.success) {
      throw new ValidationError({
        itemId: ["ID tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItemForMutation(db, parsed.data);
    const validatedData = validateCollectionData(item.collectionKey, item.dataJson);
    const normalizedData = normalizeEditableData(item.collectionKey, validatedData);
    const scalarData = getScalarItemData(item.collectionKey, normalizedData, item);

    validatePublishRequirements(item.collectionKey, normalizedData);
    await assertSlugAvailable(db, {
      variantId: item.variantId,
      collectionKey: item.collectionKey,
      slug: scalarData.slug,
      itemId: item.id,
    });

    const publishedAt = new Date();
    const { updated, replacedOfferSlugs, replacedOfferIds } =
      await prisma.$transaction(async (tx) => {
        const existingPublishedOffers =
          item.collectionKey === "offer"
            ? await tx.contentItem.findMany({
                where: {
                  tenantId: context.tenantId,
                  variantId: item.variantId,
                  collectionKey: "offer",
                  status: "PUBLISHED",
                  NOT: { id: item.id },
                },
                select: {
                  id: true,
                  slug: true,
                },
              })
            : [];

        if (existingPublishedOffers.length > 0) {
          await tx.contentItem.updateMany({
            where: {
              tenantId: context.tenantId,
              variantId: item.variantId,
              collectionKey: "offer",
              status: "PUBLISHED",
              NOT: { id: item.id },
            },
            data: {
              status: "DRAFT",
              updatedBy: context.userId,
            },
          });
        }

        const updated = await tx.contentItem.update({
          where: { id: item.id },
          data: {
            ...scalarData,
            dataJson: toPrismaJson(normalizedData),
            publishedDataJson: toPrismaJson(normalizedData),
            status: "PUBLISHED",
            publishedAt,
            updatedBy: context.userId,
          },
          select: {
            id: true,
            status: true,
            dataJson: true,
            publishedDataJson: true,
            updatedAt: true,
          },
        });

        return {
          updated,
          replacedOfferIds: existingPublishedOffers.map((offer) => offer.id),
          replacedOfferSlugs: existingPublishedOffers.map((offer) => offer.slug),
        };
      });

    await revalidateTag(`collection:${item.variantId}:${item.collectionKey}`, {
      expire: 0,
    });
    await revalidateTag(
      `item:${item.variantId}:${item.collectionKey}:${scalarData.slug}`,
      { expire: 0 },
    );
    await revalidateTag(`page:${item.variantId}:homepage`, { expire: 0 });
    await Promise.all(
      replacedOfferSlugs.map((slug) =>
        revalidateTag(`item:${item.variantId}:${item.collectionKey}:${slug}`, {
          expire: 0,
        }),
      ),
    );

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.publish",
      targetType: "ContentItem",
      targetId: item.id,
      metadata: {
        variantId: item.variantId,
        collectionKey: item.collectionKey,
        oldStatus: item.status,
        newStatus: "PUBLISHED",
        replacedOfferIds,
      },
      ipAddress: null,
    });

    revalidateCollectionPaths(item.collectionKey, scalarData.slug);
    for (const slug of replacedOfferSlugs) {
      revalidateCollectionPaths(item.collectionKey, slug);
    }

    return {
      ok: true,
      item: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizeItemData(updated.dataJson),
        publishedDataJson: normalizeNullableItemData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Item gagal diterbitkan.");
  }
}

export async function unpublishItem(itemId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = itemIdSchema.safeParse(itemId);

    if (!parsed.success) {
      throw new ValidationError({
        itemId: ["ID tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItemForMutation(db, parsed.data);
    const updated = await db.contentItem.update({
      where: { id: item.id },
      data: {
        status: "DRAFT",
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await revalidateTag(`collection:${item.variantId}:${item.collectionKey}`, {
      expire: 0,
    });
    await revalidateTag(`item:${item.variantId}:${item.collectionKey}:${item.slug}`, {
      expire: 0,
    });
    await revalidateTag(`page:${item.variantId}:homepage`, { expire: 0 });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.unpublish",
      targetType: "ContentItem",
      targetId: item.id,
      metadata: {
        variantId: item.variantId,
        collectionKey: item.collectionKey,
        oldStatus: item.status,
        newStatus: "DRAFT",
      },
      ipAddress: null,
    });

    revalidateCollectionPaths(item.collectionKey, item.slug);

    return {
      ok: true,
      item: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizeItemData(updated.dataJson),
        publishedDataJson: normalizeNullableItemData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Item gagal dikembalikan ke draft.");
  }
}

export async function changeItemStatus(itemId: unknown, status: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = statusUpdateSchema.safeParse({ itemId, status });

    if (!parsed.success) {
      throw new ValidationError({
        status: ["Status tidak valid."],
      });
    }

    if (parsed.data.status === "PUBLISHED") {
      return publishItem(parsed.data.itemId);
    }

    if (parsed.data.status === "DRAFT") {
      return unpublishItem(parsed.data.itemId);
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItemForMutation(db, parsed.data.itemId);
    const definition = getCollectionDefinition(item.collectionKey);

    if (!definition.statuses.includes(parsed.data.status)) {
      throw new ValidationError({
        status: ["Status tidak tersedia untuk collection ini."],
      });
    }

    const updated = await db.contentItem.update({
      where: { id: item.id },
      data: {
        status: parsed.data.status,
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.status",
      targetType: "ContentItem",
      targetId: item.id,
      metadata: {
        variantId: item.variantId,
        collectionKey: item.collectionKey,
        oldStatus: item.status,
        newStatus: parsed.data.status,
      },
      ipAddress: null,
    });

    revalidateCollectionPaths(item.collectionKey, item.slug);

    return {
      ok: true,
      item: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizeItemData(updated.dataJson),
        publishedDataJson: normalizeNullableItemData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Status gagal diubah.");
  }
}

export async function deleteItem(itemId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = itemIdSchema.safeParse(itemId);

    if (!parsed.success) {
      throw new ValidationError({
        itemId: ["ID tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await getOwnedItem(db, parsed.data);
    const variantKey = toVariantKey(item.variant.key);
    const collectionKey = assertOwnedCollectionKey(variantKey, item.collectionKey);

    if (item.status !== "DRAFT") {
      throw new ValidationError({
        status: ["Kembalikan item ke draft terlebih dahulu sebelum dihapus."],
      });
    }

    await db.contentItem.delete({
      where: { id: item.id },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "collection.delete",
      targetType: "ContentItem",
      targetId: item.id,
      metadata: {
        variantId: item.variantId,
        collectionKey,
        title: item.title,
      },
      ipAddress: null,
    });

    revalidateCollectionPaths(collectionKey, item.slug);

    return { ok: true };
  } catch (error) {
    return toActionError(error, "Item gagal dihapus.");
  }
}

export async function checkItemSlugAvailability(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = slugAvailabilitySchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        slug: ["Slug tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const collectionKey = assertOwnedCollectionKey(
      variant.key,
      parsed.data.collectionKey,
    );
    const slug = parsed.data.slug || "untitled";
    const available = await isSlugAvailable(db, {
      variantId: variant.id,
      collectionKey,
      slug,
      itemId: parsed.data.itemId,
    });

    return {
      ok: true,
      available,
      slug,
    };
  } catch (error) {
    return toActionError(error, "Slug gagal dicek.");
  }
}

export async function generateItemPreviewToken(itemId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = itemIdSchema.safeParse(itemId);

    if (!parsed.success) {
      throw new ValidationError({
        itemId: ["ID tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const item = await db.contentItem.findFirst({
      where: {
        id: parsed.data,
      },
      select: {
        id: true,
        variantId: true,
        collectionKey: true,
        slug: true,
        variant: {
          select: {
            key: true,
            domains: {
              where: {
                status: "ACTIVE",
              },
              orderBy: [
                {
                  isPrimary: "desc",
                },
                {
                  createdAt: "asc",
                },
              ],
              select: {
                host: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError("ContentItem", parsed.data);
    }

    const variantKey = toVariantKey(item.variant.key);
    const collectionKey = assertOwnedCollectionKey(variantKey, item.collectionKey);
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60;
    const publicPath = getPublicItemPath(collectionKey, item.slug);
    const token = signPreviewToken({
      iss: "nextcmslpk",
      sub: item.id,
      type: "content_item",
      tenantId: context.tenantId,
      variantId: item.variantId,
      collectionKey,
      iat: issuedAt,
      exp: expiresAt,
    });
    const previewUrl = buildPreviewUrl({
      host: item.variant.domains[0]?.host,
      publicPath,
      token,
    });

    return {
      ok: true,
      token,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      previewUrl,
    };
  } catch (error) {
    return toActionError(error, "Preview token gagal dibuat.");
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

async function getOwnedVariant(
  db: ReturnType<typeof tenantDb>,
  variantId: string,
) {
  const variant = await db.variant.findFirst({
    where: { id: variantId },
    select: { id: true, key: true, label: true },
  });

  if (!variant) {
    throw new NotFoundError("Variant", variantId);
  }

  return {
    ...variant,
    key: toVariantKey(variant.key),
  };
}

async function getOwnedItem(
  db: ReturnType<typeof tenantDb>,
  itemId: string,
) {
  const item = await db.contentItem.findFirst({
    where: { id: itemId },
    select: {
      id: true,
      tenantId: true,
      variantId: true,
      collectionKey: true,
      title: true,
      slug: true,
      status: true,
      excerpt: true,
      thumbnailImageId: true,
      heroImageId: true,
      isFeatured: true,
      publishedAt: true,
      startAt: true,
      expiredAt: true,
      sortOrder: true,
      dataJson: true,
      publishedDataJson: true,
      createdAt: true,
      updatedAt: true,
      variant: {
        select: { key: true },
      },
    },
  });

  if (!item) {
    throw new NotFoundError("ContentItem", itemId);
  }

  return item;
}

async function getOwnedItemForMutation(
  db: ReturnType<typeof tenantDb>,
  itemId: string,
) {
  const item = await db.contentItem.findFirst({
    where: { id: itemId },
    select: {
      id: true,
      tenantId: true,
      variantId: true,
      collectionKey: true,
      title: true,
      slug: true,
      status: true,
      dataJson: true,
      sortOrder: true,
      variant: {
        select: { key: true },
      },
    },
  });

  if (!item) {
    throw new NotFoundError("ContentItem", itemId);
  }

  const variantKey = toVariantKey(item.variant.key);
  const collectionKey = assertOwnedCollectionKey(variantKey, item.collectionKey);

  return {
    id: item.id,
    tenantId: item.tenantId,
    variantId: item.variantId,
    collectionKey,
    title: item.title,
    slug: item.slug,
    status: item.status as PublishStatus,
    dataJson: normalizeItemData(item.dataJson),
    sortOrder: item.sortOrder,
    variantKey,
  };
}

function assertOwnedCollectionKey(
  variantKey: VariantKey,
  collectionKey: string,
): CollectionKey {
  if (!isAllowedCollectionKey(variantKey, collectionKey)) {
    throw new ValidationError({
      collectionKey: ["Collection key tidak valid untuk variant ini."],
    });
  }

  return collectionKey;
}

function validateCollectionData(collectionKey: CollectionKey, data: unknown) {
  const schema = getCollectionSchema(collectionKey);

  if (!schema) {
    throw new ValidationError({
      collectionKey: ["Jenis collection tidak tersedia."],
    });
  }

  const validated = schema.safeParse(data);

  if (!validated.success) {
    throw new ValidationError(zodErrorToFieldErrors(validated.error));
  }

  return validated.data as Record<string, unknown>;
}

function normalizeEditableData(
  collectionKey: CollectionKey,
  data: Record<string, unknown>,
) {
  const definition = getCollectionDefinition(collectionKey);
  const title = readString(data.title) || "Tanpa judul";
  const slug = normalizeSlug(readString(data.slug) || title);

  return {
    ...data,
    title,
    slug,
    status: data.status ?? "DRAFT",
    is_featured: Boolean(data.is_featured),
    sort_order: readNumber(data.sort_order) ?? 0,
    [definition.thumbnailPath]: readString(data[definition.thumbnailPath]),
  };
}

function getScalarItemData(
  collectionKey: CollectionKey,
  data: Record<string, unknown>,
  fallback?: {
    title: string;
    slug: string;
    sortOrder: number;
  },
) {
  const definition = COLLECTION_DEFINITIONS[collectionKey];
  const title = readString(data.title) || fallback?.title || "Tanpa judul";
  const slug = normalizeSlug(readString(data.slug) || fallback?.slug || title);
  const excerpt =
    readString(data.excerpt) ||
    readString(data.short_description) ||
    readString(data.subtitle) ||
    null;
  const thumbnailImageId =
    readString(data[definition.thumbnailPath]) ||
    readString(data.thumbnail_image_id) ||
    readString(data.cover_image_id) ||
    null;
  const heroImageId = definition.heroPath
    ? readString(data[definition.heroPath]) || null
    : null;
  const sortOrder = readNumber(data.sort_order) ?? fallback?.sortOrder ?? 0;

  return {
    title,
    slug,
    excerpt,
    thumbnailImageId,
    heroImageId,
    isFeatured: Boolean(data.is_featured),
    sortOrder,
    startAt: parseDateField(data.start_at),
    expiredAt: parseDateField(data.expired_at),
  };
}

function validatePublishRequirements(
  collectionKey: CollectionKey,
  data: Record<string, unknown>,
) {
  const definition = getCollectionDefinition(collectionKey);
  const errors: Record<string, string[]> = {};

  if (definition.hasStartAt && !readString(data.start_at)) {
    errors.start_at = ["Tanggal mulai wajib diisi sebelum terbit."];
  }

  if (definition.hasExpiry && !readString(data.expired_at)) {
    errors.expired_at = ["Tanggal berakhir wajib diisi sebelum terbit."];
  }

  if (!readString(data.title)) {
    errors.title = ["Judul wajib diisi sebelum terbit."];
  }

  if (!readString(data.slug)) {
    errors.slug = ["Slug wajib diisi sebelum terbit."];
  }

  if (
    definition.descriptionPath &&
    !readString(getAtPath(data, definition.descriptionPath))
  ) {
    errors[definition.descriptionPath] = [
      "Ringkasan/deskripsi wajib diisi sebelum terbit.",
    ];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

async function assertSlugAvailable(
  db: ReturnType<typeof tenantDb>,
  input: {
    variantId: string;
    collectionKey: CollectionKey;
    slug: string;
    itemId?: string;
  },
) {
  if (!(await isSlugAvailable(db, input))) {
    throw new ValidationError({
      slug: ["Slug sudah digunakan untuk collection ini."],
    });
  }
}

async function isSlugAvailable(
  db: ReturnType<typeof tenantDb>,
  input: {
    variantId: string;
    collectionKey: CollectionKey;
    slug: string;
    itemId?: string;
  },
) {
  const existing = await db.contentItem.findFirst({
    where: {
      variantId: input.variantId,
      collectionKey: input.collectionKey,
      slug: input.slug,
      ...(input.itemId
        ? {
            NOT: {
              id: input.itemId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  return !existing;
}

async function resolveCompatibleOptionFilters(
  db: ReturnType<typeof tenantDb>,
  variantId: string,
  collectionKey: CollectionKey,
  filters: Record<string, string>,
): Promise<CompatibleOptionFilters> {
  const definition = getCollectionDefinition(collectionKey);
  const next: CompatibleOptionFilters = { ...filters };

  for (const [path, value] of Object.entries(filters)) {
    if (!value || value === "ALL") {
      continue;
    }

    const filter = definition.optionFilters.find((item) => item.path === path);

    if (!filter) {
      continue;
    }

    const option = await db.optionValue.findFirst({
      where: {
        OR: [{ id: value }, { value }],
        optionSet: {
          variantId,
          key: filter.optionSetKey,
        },
      },
      select: { id: true, value: true },
    });

    if (option) {
      next[path] = Array.from(new Set([option.id, option.value]));
    }
  }

  return next;
}

function matchesOptionFilters(
  dataJson: unknown,
  filters: CompatibleOptionFilters,
) {
  const data = isRecord(dataJson) ? dataJson : {};

  for (const [path, expectedValue] of Object.entries(filters)) {
    const expectedValues = normalizeOptionFilterValues(expectedValue);

    if (expectedValues.length === 0 || expectedValues.includes("ALL")) {
      continue;
    }

    const actualValue = getAtPath(data, path);
    const actualValues = normalizeOptionFilterValues(actualValue);

    if (!actualValues.some((value) => expectedValues.includes(value))) {
      return false;
    }
  }

  return true;
}

function normalizeOptionFilterValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
  }

  return typeof value === "string" && value.trim() !== "" ? [value] : [];
}

function normalizeListItem(item: {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt: string | null;
  thumbnailImageId: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  startAt: Date | null;
  expiredAt: Date | null;
  sortOrder: number;
  collectionKey: string;
  dataJson: unknown;
  updatedAt: Date;
  thumbnailImage: {
    id: string;
    fileName: string;
    storagePath: string;
  } | null;
}) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status,
    excerpt: item.excerpt,
    thumbnailImageId: item.thumbnailImageId,
    isFeatured: item.isFeatured,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    startAt: item.startAt?.toISOString() ?? null,
    expiredAt: item.expiredAt?.toISOString() ?? null,
    sortOrder: item.sortOrder,
    collectionKey: item.collectionKey,
    dataJson: normalizeItemData(item.dataJson),
    updatedAt: item.updatedAt.toISOString(),
    thumbnailImage: item.thumbnailImage
      ? {
          id: item.thumbnailImage.id,
          fileName: item.thumbnailImage.fileName,
          publicUrl: getPublicUrl(item.thumbnailImage.storagePath),
        }
      : null,
  };
}

function revalidateCollectionPaths(collectionKey: CollectionKey, slug: string) {
  const definition = getCollectionDefinition(collectionKey);

  revalidatePath(definition.listPath);

  if (slug) {
    revalidatePath(getPublicItemPath(collectionKey, slug));
  }
}

function buildPreviewUrl({
  host,
  publicPath,
  token,
}: {
  host?: string;
  publicPath: string;
  token: string;
}) {
  const baseUrl = host
    ? `${getPreviewProtocol(host)}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL(publicPath, baseUrl);

  url.searchParams.set("preview", "true");
  url.searchParams.set("token", token);

  return url.toString();
}

function getPreviewProtocol(host: string) {
  if (
    (host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]") ||
      host.includes(".local"))
  ) {
    return "http";
  }

  return "https";
}

function normalizeSlug(value: string) {
  return generateSlug(value) || "untitled";
}

function parseDateField(value: unknown) {
  const rawValue = readString(value);

  if (!rawValue) {
    return null;
  }

  const date = new Date(rawValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
  }

  return null;
}

function getAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);

      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (isRecord(current)) {
      return current[segment];
    }

    return undefined;
  }, source);
}

function toVariantKey(value: string): VariantKey {
  if (value === "indonesia" || value === "japan") {
    return value;
  }

  throw new ForbiddenError("Variant tidak didukung.");
}

function normalizeItemData(value: unknown) {
  if (isRecord(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  return {};
}

function normalizeNullableItemData(value: unknown) {
  if (isRecord(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  return null;
}

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const lookupItemsSchema = z.object({
  variantId: z.string().min(1),
  collectionKey: collectionKeySchema,
  search: z.string().trim().max(120).optional(),
});

export async function lookupCollectionItems(input: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = lookupItemsSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const collectionKey = assertOwnedCollectionKey(
      variant.key,
      parsed.data.collectionKey,
    );

    const searchValue = parsed.data.search?.trim();
    const where: Prisma.ContentItemWhereInput = {
      variantId: variant.id,
      collectionKey,
      status: { in: ["PUBLISHED", "DRAFT"] },
    };

    if (searchValue) {
      where.AND = [
        {
          OR: [
            { title: { contains: searchValue } },
            { dataJson: { path: ["title"], string_contains: searchValue } },
          ],
        },
      ];
    }

    const rows = await db.contentItem.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      take: 50,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
      },
    });

    return {
      ok: true,
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        status: row.status,
      })),
    };
  } catch (error) {
    return toActionError(error, "Item gagal dimuat.");
  }
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
