export const ALLOWED_IMAGE_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_DOCUMENT_UPLOAD_MIME_TYPES = ["application/pdf"] as const;

export const ALLOWED_VIDEO_UPLOAD_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  ...ALLOWED_IMAGE_UPLOAD_MIME_TYPES,
  ...ALLOWED_DOCUMENT_UPLOAD_MIME_TYPES,
  ...ALLOWED_VIDEO_UPLOAD_MIME_TYPES,
] as const;

export type AllowedImageUploadMimeType =
  (typeof ALLOWED_IMAGE_UPLOAD_MIME_TYPES)[number];
export type AllowedVideoUploadMimeType =
  (typeof ALLOWED_VIDEO_UPLOAD_MIME_TYPES)[number];
export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];
export type MediaPreset = "logo";

export type MediaValidationAsset = {
  mimeType: string;
  fileSize: number;
  mediaType?: string;
  status?: string;
  width?: number | null;
  height?: number | null;
};

export const GENERAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const GENERAL_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const GENERAL_VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export const LOGO_IMAGE_CONSTRAINTS = {
  allowedMimeTypes: ALLOWED_IMAGE_UPLOAD_MIME_TYPES,
  maxBytes: 1024 * 1024,
  minWidth: 160,
  minHeight: 160,
  maxWidth: 1200,
  maxHeight: 1200,
  minAspectRatio: 1,
  maxAspectRatio: 1,
} as const;

export const LOGO_IMAGE_REQUIREMENT_TEXT =
  "Logo: JPG/PNG/WebP, maksimal 1 MB, dimensi 160x160 sampai 1200x1200 px, wajib berbentuk kotak (rasio 1:1).";

export function validateLogoFileBasics(file: {
  type: string;
  size: number;
}) {
  const errors: string[] = [];
  const mimeType = normalizeMimeType(file.type);

  if (!isAllowedLogoMimeType(mimeType)) {
    errors.push("Logo harus berupa JPG, PNG, atau WebP.");
  }

  if (!Number.isInteger(file.size) || file.size <= 0) {
    errors.push("Ukuran logo tidak valid.");
  } else if (file.size > LOGO_IMAGE_CONSTRAINTS.maxBytes) {
    errors.push("Ukuran logo maksimal 1 MB.");
  }

  return errors;
}

export function validateLogoImageAsset(asset: MediaValidationAsset) {
  const errors = validateLogoFileBasics({
    type: asset.mimeType,
    size: asset.fileSize,
  });

  if (asset.mediaType && asset.mediaType !== "IMAGE") {
    errors.push("Logo harus memakai asset gambar.");
  }

  if (asset.status && asset.status !== "ACTIVE") {
    errors.push("Logo harus memakai media yang sudah aktif.");
  }

  errors.push(...validateLogoImageDimensions(asset.width, asset.height));

  return errors;
}

export function validateLogoImageDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
) {
  const errors: string[] = [];

  if (!isPositiveInteger(width) || !isPositiveInteger(height)) {
    errors.push("Dimensi logo belum diketahui. Upload ulang logo dari file asli.");
    return errors;
  }

  if (
    width < LOGO_IMAGE_CONSTRAINTS.minWidth ||
    height < LOGO_IMAGE_CONSTRAINTS.minHeight
  ) {
    errors.push(
      `Dimensi logo minimal ${LOGO_IMAGE_CONSTRAINTS.minWidth}x${LOGO_IMAGE_CONSTRAINTS.minHeight} px.`,
    );
  }

  if (
    width > LOGO_IMAGE_CONSTRAINTS.maxWidth ||
    height > LOGO_IMAGE_CONSTRAINTS.maxHeight
  ) {
    errors.push(
      `Dimensi logo maksimal ${LOGO_IMAGE_CONSTRAINTS.maxWidth}x${LOGO_IMAGE_CONSTRAINTS.maxHeight} px.`,
    );
  }

  if (width !== height) {
    errors.push("Rasio logo harus 1:1 (bentuk kotak).");
  }

  return errors;
}

export function normalizeMimeType(contentType: string) {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

function isAllowedLogoMimeType(
  mimeType: string,
): mimeType is AllowedImageUploadMimeType {
  return LOGO_IMAGE_CONSTRAINTS.allowedMimeTypes.includes(
    mimeType as AllowedImageUploadMimeType,
  );
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
