"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import {
  confirmUpload as confirmStorageUpload,
  deleteMedia as deleteStorageMedia,
  generatePresignedUploadUrl as generateStoragePresignedUploadUrl,
  getMediaReferences as getStorageMediaReferences,
  getPublicUrl,
  getTotalReferenceCount,
} from "@/server/services/storage";
import { verifySecurityStamp } from "@/server/services/security-stamp";

const mediaIdInputSchema = z.union([
  z.string().cuid().transform((mediaId) => ({ mediaId })),
  z.object({
    mediaId: z.string().cuid(),
  }),
]);

const listFilterSchema = z
  .object({
    mediaType: z.enum(["IMAGE", "DOCUMENT"]).optional(),
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

const updateAltTextSchema = z.object({
  mediaId: z.string().cuid(),
  altText: z.string().trim().max(200).transform((val) => val || null),
});

const generateUploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
});

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
      media: upload,
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

export async function listMedia(tenantId: string, filter: unknown = {}, page: unknown = {}) {
  try {
    const session = await requireTenantSession(tenantId);
    const parsedFilter = listFilterSchema.safeParse(filter);
    const parsedPage = pageSchema.safeParse(page);

    if (!parsedFilter.success || !parsedPage.success) {
      throw new ValidationError({
        filter: ["Filter media tidak valid."],
      });
    }

    const db = tenantDb(session.session);
    const where: Prisma.MediaAssetWhereInput = {};
    const normalizedFilter = parsedFilter.data ?? {};
    const normalizedPage = parsedPage.data;

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

    const itemsWithUsage = await Promise.all(
      items.map(async (item) => {
        const references = await getStorageMediaReferences(session.tenantId, item.id);

        return {
          ...item,
          publicUrl: getPublicUrl(item.storagePath),
          usageCount: getTotalReferenceCount(references),
        };
      }),
    );

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

    await createAuditLog({
      tenantId: session.tenantId,
      userId: session.userId,
      action: "media.uploadStarted",
      targetType: "MediaAsset",
      targetId: result.mediaId,
      metadata: {
        fileName: parsed.data.fileName,
        fileSize: parsed.data.fileSize,
      },
      ipAddress: null,
    });

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
