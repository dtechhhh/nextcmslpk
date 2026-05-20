import { randomBytes } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { AppError, NotFoundError, ValidationError } from "@/lib/errors";
import { R2_BUCKET_NAME, R2_PUBLIC_URL, r2Client } from "@/lib/r2";
import { prisma } from "@/server/db/client";

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export type GeneratePresignedUploadUrlResult = {
  mediaId: string;
  presignedUrl: string;
  publicUrl: string;
  storagePath: string;
  expiresAt: Date;
};

export type ConfirmUploadResult = {
  mediaId: string;
  publicUrl: string;
  storagePath: string;
};

export type DeleteMediaResult = {
  mediaId: string;
  storagePath: string;
};

export type MediaReferenceCounts = {
  contentItemImages: number;
  contentPageJson: number;
  contentItemJson: number;
  globalConfigJson: number;
};

type MediaForStorage = {
  id: string;
  tenantId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
};

const PRESIGNED_UPLOAD_EXPIRES_SECONDS = 10 * 60;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const PDF_MAX_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_MIME_TYPE: Record<AllowedUploadMimeType, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

let cuidCounter = 0;

export async function generatePresignedUploadUrl(
  tenantId: string,
  fileName: string,
  contentType: string,
  fileSize: number,
): Promise<GeneratePresignedUploadUrlResult> {
  const mimeType = normalizeMimeType(contentType);

  validateUploadRequest({ contentType: mimeType, fileSize });

  if (!isAllowedUploadMimeType(mimeType)) {
    throw new ValidationError({
      contentType: ["Tipe file tidak didukung."],
    });
  }

  const mediaId = cuid();
  const extension = getExtensionForMimeType(mimeType);
  const storagePath = `tenants/${tenantId}/media/${mediaId}.${extension}`;
  const sanitizedFileName = sanitizeFileName(fileName, `${mediaId}.${extension}`);

  await prisma.mediaAsset.create({
    data: {
      id: mediaId,
      tenantId,
      fileName: sanitizedFileName,
      mimeType,
      fileSize,
      mediaType: mimeType === "application/pdf" ? "DOCUMENT" : "IMAGE",
      status: "UPLOADING",
      storagePath,
    },
  });

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: storagePath,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_UPLOAD_EXPIRES_SECONDS,
  });

  return {
    mediaId,
    presignedUrl,
    publicUrl: getPublicUrl(storagePath),
    storagePath,
    expiresAt: new Date(Date.now() + PRESIGNED_UPLOAD_EXPIRES_SECONDS * 1000),
  };
}

export async function confirmUpload(
  tenantId: string,
  mediaId: string,
): Promise<ConfirmUploadResult> {
  const media = await findTenantMediaOrThrow(tenantId, mediaId);
  const head = await headObjectOrThrow(media.storagePath);

  validateUploadedObjectMetadata(media, head);
  await validateUploadedObjectSignature(media.storagePath, media.mimeType);

  const activeMedia = await prisma.mediaAsset.update({
    where: { id: media.id },
    data: { status: "ACTIVE" },
    select: {
      id: true,
      storagePath: true,
    },
  });

  return {
    mediaId: activeMedia.id,
    storagePath: activeMedia.storagePath,
    publicUrl: getPublicUrl(activeMedia.storagePath),
  };
}

export async function deleteMedia(
  tenantId: string,
  mediaId: string,
): Promise<DeleteMediaResult> {
  const media = await findTenantMediaOrThrow(tenantId, mediaId);
  const references = await getMediaReferences(tenantId, mediaId);

  if (getTotalReferenceCount(references) > 0) {
    throw new AppError(
      "MEDIA_IN_USE",
      "Media masih digunakan dan tidak bisa dihapus.",
      409,
      { references },
    );
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: media.storagePath,
    }),
  );

  await prisma.mediaAsset.delete({
    where: { id: media.id },
  });

  return {
    mediaId: media.id,
    storagePath: media.storagePath,
  };
}

export function getPublicUrl(storagePath: string) {
  const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, "");
  const path = storagePath.replace(/^\/+/, "");

  return `${baseUrl}/${path}`;
}

export function validateUploadRequest(input: {
  contentType: string;
  fileSize: number;
}) {
  const mimeType = normalizeMimeType(input.contentType);
  const errors: Record<string, string[]> = {};

  if (!isAllowedUploadMimeType(mimeType)) {
    errors.contentType = ["Tipe file tidak didukung."];
  }

  if (!Number.isInteger(input.fileSize) || input.fileSize <= 0) {
    errors.fileSize = ["Ukuran file tidak valid."];
  } else if (isAllowedUploadMimeType(mimeType)) {
    const maxBytes = mimeType === "application/pdf" ? PDF_MAX_BYTES : IMAGE_MAX_BYTES;

    if (input.fileSize > maxBytes) {
      errors.fileSize = [
        mimeType === "application/pdf"
          ? "Ukuran PDF maksimal 10 MB."
          : "Ukuran gambar maksimal 5 MB.",
      ];
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

export function isAllowedUploadMimeType(
  contentType: string,
): contentType is AllowedUploadMimeType {
  return ALLOWED_UPLOAD_MIME_TYPES.includes(
    normalizeMimeType(contentType) as AllowedUploadMimeType,
  );
}

export async function getMediaReferences(
  tenantId: string,
  mediaId: string,
): Promise<MediaReferenceCounts> {
  const [contentItemImages, jsonReferences] = await Promise.all([
    prisma.contentItem.count({
      where: {
        tenantId,
        OR: [{ thumbnailImageId: mediaId }, { heroImageId: mediaId }],
      },
    }),
    countJsonMediaReferences(tenantId, mediaId),
  ]);

  return {
    contentItemImages,
    contentPageJson: jsonReferences.contentPages,
    contentItemJson: jsonReferences.contentItems,
    globalConfigJson: jsonReferences.globalConfigs,
  };
}

export function getTotalReferenceCount(references: MediaReferenceCounts) {
  return Object.values(references).reduce((total, count) => total + count, 0);
}

function getExtensionForMimeType(contentType: AllowedUploadMimeType) {
  return EXTENSION_BY_MIME_TYPE[contentType];
}

function normalizeMimeType(contentType: string) {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

function sanitizeFileName(fileName: string, fallback: string) {
  const sanitized = fileName
    .trim()
    .replace(/[\\/]/g, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return sanitized || fallback;
}

function cuid() {
  const timestamp = Date.now().toString(36);
  const counter = (cuidCounter++ % 36 ** 4).toString(36).padStart(4, "0");
  const random = randomBytes(10)
    .toString("base64url")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .padEnd(12, "0")
    .slice(0, 12);

  return `c${timestamp}${counter}${random}`;
}

async function findTenantMediaOrThrow(tenantId: string, mediaId: string) {
  const media = await prisma.mediaAsset.findFirst({
    where: {
      id: mediaId,
      tenantId,
    },
    select: {
      id: true,
      tenantId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      storagePath: true,
    },
  });

  if (!media) {
    throw new NotFoundError("MediaAsset", mediaId);
  }

  return media;
}

async function headObjectOrThrow(storagePath: string) {
  try {
    return await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storagePath,
      }),
    );
  } catch (error) {
    if (isS3NotFoundError(error)) {
      throw new NotFoundError("R2 object", storagePath);
    }

    throw error;
  }
}

function validateUploadedObjectMetadata(
  media: MediaForStorage,
  head: HeadObjectCommandOutput,
) {
  const errors: Record<string, string[]> = {};

  if (typeof head.ContentLength === "number" && head.ContentLength !== media.fileSize) {
    errors.fileSize = ["Ukuran file di R2 tidak sesuai request upload."];
  }

  const uploadedContentType =
    typeof head.ContentType === "string" ? normalizeMimeType(head.ContentType) : null;

  if (uploadedContentType && uploadedContentType !== media.mimeType) {
    errors.contentType = ["Tipe file di R2 tidak sesuai request upload."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

async function validateUploadedObjectSignature(
  storagePath: string,
  mimeType: string,
) {
  const bytes = await readObjectHeaderBytes(storagePath);

  if (!matchesFileSignature(mimeType, bytes)) {
    throw new ValidationError({
      file: ["File upload tidak sesuai tipe file yang diminta."],
    });
  }
}

async function readObjectHeaderBytes(storagePath: string) {
  try {
    const object = await r2Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storagePath,
        Range: "bytes=0-511",
      }),
    );

    return bodyToBuffer(object.Body);
  } catch (error) {
    if (isS3NotFoundError(error)) {
      throw new NotFoundError("R2 object", storagePath);
    }

    throw error;
  }
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    return Buffer.alloc(0);
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (typeof body === "string") {
    return Buffer.from(body);
  }

  if (hasTransformToByteArray(body)) {
    return Buffer.from(await body.transformToByteArray());
  }

  if (isAsyncIterable(body)) {
    const chunks: Buffer[] = [];

    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  return Buffer.alloc(0);
}

function matchesFileSignature(mimeType: string, bytes: Buffer) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  if (mimeType === "application/pdf") {
    return bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  return false;
}

type JsonReferenceRow = {
  source: "contentPages" | "contentItems" | "globalConfigs";
  count: number | bigint;
};

async function countJsonMediaReferences(tenantId: string, mediaId: string) {
  const jsonPath = "$.** ? (@ == $mediaId)";
  const rows = await prisma.$queryRaw<JsonReferenceRow[]>`
    SELECT 'contentPages' AS source, COUNT(*)::int AS count
    FROM "content_pages"
    WHERE "tenant_id" = ${tenantId}
      AND (
        jsonb_path_exists(
          "data_json",
          ${jsonPath}::jsonpath,
          jsonb_build_object('mediaId', to_jsonb(CAST(${mediaId} AS text)))
        )
        OR jsonb_path_exists(
          COALESCE("published_data_json", 'null'::jsonb),
          ${jsonPath}::jsonpath,
          jsonb_build_object('mediaId', to_jsonb(CAST(${mediaId} AS text)))
        )
      )

    UNION ALL

    SELECT 'contentItems' AS source, COUNT(*)::int AS count
    FROM "content_items"
    WHERE "tenant_id" = ${tenantId}
      AND (
        jsonb_path_exists(
          "data_json",
          ${jsonPath}::jsonpath,
          jsonb_build_object('mediaId', to_jsonb(CAST(${mediaId} AS text)))
        )
        OR jsonb_path_exists(
          COALESCE("published_data_json", 'null'::jsonb),
          ${jsonPath}::jsonpath,
          jsonb_build_object('mediaId', to_jsonb(CAST(${mediaId} AS text)))
        )
      )

    UNION ALL

    SELECT 'globalConfigs' AS source, COUNT(*)::int AS count
    FROM "variant_global_configs"
    WHERE "tenant_id" = ${tenantId}
      AND jsonb_path_exists(
        "data_json",
        ${jsonPath}::jsonpath,
        jsonb_build_object('mediaId', to_jsonb(CAST(${mediaId} AS text)))
      )
  `;

  return rows.reduce(
    (counts, row) => {
      counts[row.source] = Number(row.count);
      return counts;
    },
    {
      contentPages: 0,
      contentItems: 0,
      globalConfigs: 0,
    } as Record<JsonReferenceRow["source"], number>,
  );
}

function isS3NotFoundError(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  const metadata = error.$metadata;
  const statusCode =
    isRecord(metadata) && typeof metadata.httpStatusCode === "number"
      ? metadata.httpStatusCode
      : null;
  const name = typeof error.name === "string" ? error.name : null;

  return statusCode === 404 || name === "NotFound" || name === "NoSuchKey";
}

function hasTransformToByteArray(
  value: unknown,
): value is { transformToByteArray: () => Promise<Uint8Array> } {
  return (
    isRecord(value) &&
    typeof value.transformToByteArray === "function"
  );
}

function isAsyncIterable(value: unknown): value is AsyncIterable<Uint8Array | string> {
  return (
    isRecord(value) &&
    Symbol.asyncIterator in value &&
    typeof value[Symbol.asyncIterator] === "function"
  );
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null;
}
