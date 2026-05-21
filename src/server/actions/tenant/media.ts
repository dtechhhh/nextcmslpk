"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import { createAuditLog } from "@/server/services/audit";
import {
  confirmUpload as confirmStorageUpload,
  deleteMedia as deleteStorageMedia,
  getPublicUrl,
} from "@/server/services/storage";

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

    const where: Prisma.MediaAssetWhereInput = {
      tenantId: session.tenantId,
    };
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
    const [items, total] = await prisma.$transaction([
      prisma.mediaAsset.findMany({
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
      prisma.mediaAsset.count({ where }),
    ]);

    return {
      ok: true,
      items: items.map((item) => ({
        ...item,
        publicUrl: getPublicUrl(item.storagePath),
      })),
      total,
      page: normalizedPage.page,
      pageSize: normalizedPage.pageSize,
      totalPages: Math.ceil(total / normalizedPage.pageSize),
    };
  } catch (error) {
    return toActionError(error, "Media gagal dimuat.");
  }
}

async function requireTenantSession(expectedTenantId?: string) {
  const session = await auth();
  const user = session?.user;

  if (!user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (user.role !== "TENANT_ADMIN" || !user.tenantId) {
    throw new ForbiddenError("Akses tenant diperlukan.");
  }

  if (expectedTenantId && expectedTenantId !== user.tenantId) {
    throw new ForbiddenError("Tenant tidak sesuai sesi.");
  }

  return {
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
