import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { AppError, AuthError, ValidationError } from "@/lib/errors";
import { createAuditLog } from "@/server/services/audit";
import { limitUploadAttempt } from "@/server/services/rate-limit";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  generatePresignedUploadUrl,
  validateUploadRequest,
} from "@/server/services/storage";

export const runtime = "nodejs";

const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
  fileSize: z.coerce.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = session?.user?.tenantId;
    const userId = session?.user?.userId;

    if (!session?.user || !tenantId || !userId) {
      throw new AuthError("Sesi tidak valid.");
    }

    const rateLimit = await limitUploadAttempt(tenantId);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Terlalu banyak request upload. Coba lagi nanti.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(
              1,
              Math.ceil((rateLimit.reset - Date.now()) / 1000),
            ).toString(),
          },
        },
      );
    }

    const parsed = uploadRequestSchema.safeParse(await readJson(request));

    if (!parsed.success) {
      throw new ValidationError(
        z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      );
    }

    validateUploadRequest(parsed.data);

    const upload = await generatePresignedUploadUrl(
      tenantId,
      parsed.data.fileName,
      parsed.data.contentType,
      parsed.data.fileSize,
    );

    await createAuditLog({
      tenantId,
      userId,
      action: "media.upload.requested",
      targetType: "MediaAsset",
      targetId: upload.mediaId,
      metadata: {
        fileName: parsed.data.fileName,
        contentType: parsed.data.contentType,
        fileSize: parsed.data.fileSize,
        storagePath: upload.storagePath,
      },
      headers: request.headers,
    });

    return NextResponse.json({
      presignedUrl: upload.presignedUrl,
      mediaId: upload.mediaId,
      publicUrl: upload.publicUrl,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError({
      body: ["Payload harus berupa JSON."],
    });
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      error: "Upload gagal diproses.",
    },
    { status: 500 },
  );
}
