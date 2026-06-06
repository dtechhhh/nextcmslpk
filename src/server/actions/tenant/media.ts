"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import {
  cleanupMedia as cleanupStorageMedia,
  createCroppedImage as createStorageCroppedImage,
  confirmUpload as confirmStorageUpload,
  deleteMedia as deleteStorageMedia,
  generatePresignedUploadUrl as generateStoragePresignedUploadUrl,
  getMediaReferences as getStorageMediaReferences,
  getPublicUrl,
  getTotalReferenceCount,
  MEDIA_CLEANUP_MAX_DELETE_ITEMS,
  scanMediaCleanup as scanStorageMediaCleanup,
  type MediaCleanupCandidate,
  type MediaCleanupDeletedItem,
  type MediaCleanupSkippedItem,
} from "@/server/services/storage";
import { verifySecurityStamp } from "@/server/services/security-stamp";

const tenantIdSchema = z.string().min(1);

const mediaIdInputSchema = z.union([
  z.string().cuid().transform((mediaId) => ({ mediaId })),
  z.object({
    mediaId: z.string().cuid(),
  }),
]);

const listFilterSchema = z
  .object({
    mediaType: z.enum(["IMAGE", "DOCUMENT", "VIDEO"]).optional(),
    status: z.enum(["UPLOADING", "ACTIVE"]).optional(),
    query: z.string().trim().max(100).optional(),
  })
  .optional();

const pageSchema = z
  .union([
    z.number().int().positive().transform((page) => ({ page, pageSize: 24 })),
    z
      .object({
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().positive().max(100).default(24),
      })
      .optional()
      .transform((page) => page ?? { page: 1, pageSize: 24 }),
  ])
  .optional()
  .transform((page) => page ?? { page: 1, pageSize: 24 });

const listOptionsSchema = z
  .object({
    includeUsage: z.boolean().default(false),
  })
  .optional()
  .transform((options) => options ?? { includeUsage: false });

const updateAltTextSchema = z.object({
  mediaId: z.string().cuid(),
  altText: z.string().trim().max(200).transform((val) => val || null),
});

const generateUploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
});

const cropImageSchema = z.object({
  mediaId: z.string().trim().min(1).max(128),
  cropPreset: z.enum(["thumbnail", "hero", "square", "portrait"]),
  crop: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0.01).max(1),
    height: z.number().min(0.01).max(1),
  }),
});

const cleanupMediaSchema = z
  .object({
    tenantId: z.string().min(1),
    mediaIds: z.array(z.string().cuid()).max(MEDIA_CLEANUP_MAX_DELETE_ITEMS).default([]),
    orphanStoragePaths: z
      .array(z.string().trim().min(1).max(500))
      .max(MEDIA_CLEANUP_MAX_DELETE_ITEMS)
      .default([]),
  })
  .refine(
    (value) => value.mediaIds.length > 0 || value.orphanStoragePaths.length > 0,
    {
      message: "Pilih minimal satu media untuk cleanup.",
      path: ["mediaIds"],
    },
  )
  .refine(
    (value) =>
      value.mediaIds.length + value.orphanStoragePaths.length <=
      MEDIA_CLEANUP_MAX_DELETE_ITEMS,
    {
      message: `Cleanup maksimal ${MEDIA_CLEANUP_MAX_DELETE_ITEMS} resource sekali jalan.`,
      path: ["mediaIds"],
    },
  );

export async function confirmUpload(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = mediaIdInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        mediaId: ["Media tidak valid."],
      });
    }

    const upload = await confirmStorageUpload(session.tenantId, parsed.data.mediaId);

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "media.upload",
      targetType: "MediaAsset",
      targetId: upload.mediaId,
      metadata: {
        storagePath: upload.storagePath,
        publicUrl: upload.publicUrl,
      },
      ipAddress: null,
    });

    return {
      ok: true,
      media: {
        ...upload,
        publicUrl: upload.publicUrl,
      },
    };
  } catch (error) {
    return toActionError(error, "Upload gagal dikonfirmasi.");
  }
}

export async function deleteMedia(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = mediaIdInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        mediaId: ["Media tidak valid."],
      });
    }

    const deleted = await deleteStorageMedia(session.tenantId, parsed.data.mediaId);

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "media.delete",
      targetType: "MediaAsset",
      targetId: deleted.mediaId,
      metadata: {
        storagePath: deleted.storagePath,
      },
      ipAddress: null,
    });

    return {
      ok: true,
      media: deleted,
    };
  } catch (error) {
    return toActionError(error, "Media gagal dihapus.");
  }
}

export async function scanMediaCleanup(tenantIdInput: unknown) {
  try {
    const parsed = tenantIdSchema.safeParse(tenantIdInput);

    if (!parsed.success) {
      throw new ValidationError({
        tenantId: ["Tenant tidak valid."],
      });
    }

    const session = await requireTenantSession(parsed.data);
    const result = await scanStorageMediaCleanup(session.tenantId);

    return {
      ok: true,
      candidates: result.candidates.map(serializeCleanupCandidate),
      summary: result.summary,
    };
  } catch (error) {
    return toActionError(error, "Scan cleanup media gagal.");
  }
}

export async function cleanupMedia(input: unknown) {
  try {
    const parsed = cleanupMediaSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        mediaIds: ["Pilih minimal satu media untuk cleanup."],
      });
    }

    const session = await requireTenantSession(parsed.data.tenantId);
    const result = await cleanupStorageMedia(session.tenantId, {
      mediaIds: parsed.data.mediaIds,
      orphanStoragePaths: parsed.data.orphanStoragePaths,
    });

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "media.cleanup",
      targetType: "MediaAsset",
      targetId: null,
      metadata: {
        deletedCount: result.deleted.length,
        skippedCount: result.skipped.length,
        totalBytes: result.totalBytes,
        deleted: result.deleted.map((item) => ({
          mediaId: item.mediaId,
          storagePath: item.storagePath,
          reason: item.reason,
          fileSize: item.fileSize,
        })),
        skipped: result.skipped.map((item) => ({
          candidateId: item.candidateId,
          storagePath: item.storagePath,
          reason: item.reason,
        })),
      },
      ipAddress: null,
    });

    return {
      ok: true,
      deleted: result.deleted.map(serializeCleanupDeletedItem),
      skipped: result.skipped.map(serializeCleanupSkippedItem),
      totalBytes: result.totalBytes,
    };
  } catch (error) {
    return toActionError(error, "Cleanup media gagal.");
  }
}

export async function createCroppedImage(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = cropImageSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        crop: ["Data crop tidak valid."],
      });
    }

    const cropped = await createStorageCroppedImage(
      session.tenantId,
      parsed.data.mediaId,
      parsed.data.crop,
      parsed.data.cropPreset,
    );

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "media.crop",
      targetType: "MediaAsset",
      targetId: cropped.mediaId,
      metadata: {
        sourceMediaId: cropped.sourceMediaId,
        cropPreset: cropped.cropPreset,
        crop: cropped.crop,
        storagePath: cropped.storagePath,
        publicUrl: cropped.publicUrl,
      },
      ipAddress: null,
    });

    return {
      ok: true,
      media: {
        ...cropped,
        publicUrl: cropped.publicUrl,
      },
    };
  } catch (error) {
    return toActionError(error, "Crop gambar gagal.");
  }
}

export async function listMedia(
  tenantId: string,
  filter: unknown = {},
  page: unknown = {},
  options: unknown = {},
) {
  try {
    const session = await requireTenantSession(tenantId);
    const parsedFilter = listFilterSchema.safeParse(filter);
    const parsedPage = pageSchema.safeParse(page);
    const parsedOptions = listOptionsSchema.safeParse(options);

    if (!parsedFilter.success || !parsedPage.success || !parsedOptions.success) {
      throw new ValidationError({
        filter: ["Filter media tidak valid."],
      });
    }

    const db = tenantDb(session.session);
    const where: Prisma.MediaAssetWhereInput = {};
    const normalizedFilter = parsedFilter.data ?? {};
    const normalizedPage = parsedPage.data;
    const normalizedOptions = parsedOptions.data;

    if (normalizedFilter.mediaType) {
      where.mediaType = normalizedFilter.mediaType;
    }

    if (normalizedFilter.status) {
      where.status = normalizedFilter.status;
    }

    if (normalizedFilter.query) {
      where.OR = [
        {
          fileName: {
            contains: normalizedFilter.query,
            mode: "insensitive",
          },
        },
        {
          mimeType: {
            contains: normalizedFilter.query,
            mode: "insensitive",
          },
        },
      ];
    }

    const skip = (normalizedPage.page - 1) * normalizedPage.pageSize;
    const [items, total] = await Promise.all([
      db.mediaAsset.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: normalizedPage.pageSize,
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          mediaType: true,
          status: true,
          storagePath: true,
          altText: true,
          width: true,
          height: true,
          createdAt: true,
        },
      }),
      db.mediaAsset.count({ where }),
    ]);

    const itemsWithUsage = normalizedOptions.includeUsage
      ? await Promise.all(
          items.map(async (item) => {
            const references = await getStorageMediaReferences(session.tenantId, item.id);

            return {
              ...item,
              publicUrl: getPublicUrl(item.storagePath),
              usageCount: getTotalReferenceCount(references),
            };
          }),
        )
      : items.map((item) => ({
          ...item,
          publicUrl: getPublicUrl(item.storagePath),
          usageCount: 0,
        }));

    return {
      ok: true,
      items: itemsWithUsage,
      total,
      page: normalizedPage.page,
      pageSize: normalizedPage.pageSize,
      totalPages: Math.ceil(total / normalizedPage.pageSize),
    };
  } catch (error) {
    return toActionError(error, "Media gagal dimuat.");
  }
}

export async function getMediaReferences(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = mediaIdInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        mediaId: ["Media tidak valid."],
      });
    }

    const references = await getStorageMediaReferences(session.tenantId, parsed.data.mediaId);

    return {
      ok: true,
      totalReferences: getTotalReferenceCount(references),
      references,
    };
  } catch (error) {
    return toActionError(error, "Referensi media gagal dimuat.");
  }
}

export async function updateMediaAltText(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = updateAltTextSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        altText: ["Alt text maksimal 200 karakter."],
      });
    }

    const db = tenantDb(session.session);
    const media = await db.mediaAsset.findFirst({
      where: { id: parsed.data.mediaId },
      select: { id: true },
    });

    if (!media) {
      throw new ValidationError({
        mediaId: ["Media tidak ditemukan."],
      });
    }

    const updated = await db.mediaAsset.update({
      where: { id: parsed.data.mediaId },
      data: { altText: parsed.data.altText },
      select: { id: true, altText: true },
    });

    return {
      ok: true,
      media: updated,
    };
  } catch (error) {
    return toActionError(error, "Alt text gagal diubah.");
  }
}

export async function generatePresignedUploadUrl(input: unknown) {
  try {
    const session = await requireTenantSession();
    const parsed = generateUploadUrlSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Data upload tidak valid."],
      });
    }

    const result = await generateStoragePresignedUploadUrl(
      session.tenantId,
      parsed.data.fileName,
      parsed.data.contentType,
      parsed.data.fileSize,
    );

    return {
      ok: true,
      mediaId: result.mediaId,
      presignedUrl: result.presignedUrl,
      publicUrl: result.publicUrl,
      storagePath: result.storagePath,
      expiresAt: result.expiresAt.toISOString(),
    };
  } catch (error) {
    return toActionError(error, "Presigned URL gagal dibuat.");
  }
}

function serializeCleanupCandidate(candidate: MediaCleanupCandidate) {
  return {
    ...candidate,
    createdAt: candidate.createdAt?.toISOString() ?? null,
    lastModified: candidate.lastModified?.toISOString() ?? null,
  };
}

function serializeCleanupDeletedItem(item: MediaCleanupDeletedItem) {
  return item;
}

function serializeCleanupSkippedItem(item: MediaCleanupSkippedItem) {
  return item;
}

async function requireTenantSession(expectedTenantId?: string) {
  const session = await auth();
  const user = session?.user;

  if (!session || !user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (user.role !== "TENANT_ADMIN" || !user.tenantId) {
    throw new ForbiddenError("Akses tenant diperlukan.");
  }

  if (expectedTenantId && expectedTenantId !== user.tenantId) {
    throw new ForbiddenError("Tenant tidak sesuai sesi.");
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
