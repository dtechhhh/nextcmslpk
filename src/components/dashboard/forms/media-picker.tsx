"use client";

import {
  CropIcon,
  FileTextIcon,
  ImageIcon,
  Loader2Icon,
  RotateCcwIcon,
  SearchIcon,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createCroppedImage,
  confirmUpload,
  generatePresignedUploadUrl,
  listMedia,
} from "@/server/actions/tenant/media";
import { cn } from "@/lib/utils";
import {
  getMediaCropConfig,
  type MediaCropPreset,
  type MediaCropRect,
} from "@/lib/media-crop";
import {
  LOGO_IMAGE_REQUIREMENT_TEXT,
  validateLogoFileBasics,
  validateLogoImageAsset,
  validateLogoImageDimensions,
  type MediaPreset,
} from "@/lib/media-constraints";

type MediaType = "IMAGE" | "DOCUMENT" | "VIDEO";

type MediaItem = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: MediaType;
  status: string;
  width: number | null;
  height: number | null;
  publicUrl?: string;
};

type MediaPickerProps = {
  tenantId: string;
  value: string;
  onChange: (mediaId: string) => void;
  mediaType?: MediaType;
  mediaPreset?: MediaPreset;
  cropPreset?: MediaCropPreset;
  disabled?: boolean;
};

const DEFAULT_CROP_RECT: MediaCropRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

const MEDIA_PICKER_PAGE_SIZE = 24;
const INLINE_UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";
const ALLOWED_INLINE_UPLOAD_MIME_TYPES = new Set(INLINE_UPLOAD_ACCEPT.split(","));

export function MediaPicker({
  tenantId,
  value,
  onChange,
  mediaType = "IMAGE",
  mediaPreset,
  cropPreset,
  disabled = false,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<MediaItem | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [cropError, setCropError] = useState<string | null>(null);
  const [cropSaving, setCropSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === value) ?? null,
    [items, value],
  );
  const cropConfig = cropPreset ? getMediaCropConfig(cropPreset) : null;
  const cropRect = useMemo(() => {
    if (!cropTarget || !cropConfig) {
      return DEFAULT_CROP_RECT;
    }

    return buildCropRect(
      cropTarget.width,
      cropTarget.height,
      cropConfig.aspectRatio,
      cropZoom,
      cropPosition,
    );
  }, [cropConfig, cropPosition, cropTarget, cropZoom]);
  const PickerIcon =
    mediaType === "IMAGE"
      ? ImageIcon
      : mediaType === "VIDEO"
        ? VideoIcon
        : FileTextIcon;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      const response = await listMedia(
        tenantId,
        {
          mediaType,
          status: "ACTIVE",
          query,
        },
        {
          page,
          pageSize: MEDIA_PICKER_PAGE_SIZE,
        },
      );

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!isMediaListSuccess(response)) {
        toast.error(getActionErrorMessage(response, "Media gagal dimuat."));
        return;
      }

      setItems(response.items);
      setTotalPages(Math.max(response.totalPages, 1));
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, tenantId, mediaType, query, page]);

  function handleSelect(mediaId: string) {
    const item = items.find((mediaItem) => mediaItem.id === mediaId);

    if (item) {
      beginMediaSelection(item);
      return;
    }

    onChange(mediaId);
    setOpen(false);
  }

  function beginMediaSelection(item: MediaItem) {
    if (cropConfig && item.mediaType === "IMAGE" && item.publicUrl) {
      setCropTarget(item);
      setCropZoom(1);
      setCropPosition({ x: 50, y: 50 });
      setCropError(null);
      setOpen(false);
      return;
    }

    onChange(item.id);
    setOpen(false);
  }

  async function handleApplyCrop() {
    if (!cropTarget || !cropPreset) {
      return;
    }

    setCropSaving(true);
    setCropError(null);

    try {
      const result = await createCroppedImage({
        mediaId: cropTarget.id,
        cropPreset,
        crop: cropRect,
      });

      if (!isCropSuccess(result)) {
        setCropError(getActionErrorMessage(result, "Crop gambar gagal."));
        return;
      }

      const croppedItem = toUploadedMediaItem(result.media, cropTarget);

      setItems((current) => [
        croppedItem,
        ...current.filter((item) => item.id !== croppedItem.id),
      ]);
      onChange(croppedItem.id);
      setCropTarget(null);
      toast.success("Crop gambar disimpan.");
    } catch {
      setCropError("Crop gambar gagal diproses.");
    } finally {
      setCropSaving(false);
    }
  }

  function handleUseOriginal() {
    if (!cropTarget) {
      return;
    }

    onChange(cropTarget.id);
    setCropTarget(null);
  }

  async function handleInlineUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    setUploading(true);
    setUploadError(null);

    try {
      if (mediaType === "DOCUMENT") {
        setUploadError("Upload dokumen tidak tersedia. Gunakan URL dokumen.");
        setUploading(false);
        event.target.value = "";
        return;
      }

      if (!isAllowedInlineUploadFile(file)) {
        setUploadError("Upload hanya mendukung gambar JPG/PNG/WebP dan video MP4/WebM/MOV.");
        setUploading(false);
        event.target.value = "";
        return;
      }

      const validationError = await validateFileForPreset(file, mediaPreset);

      if (validationError) {
        setUploadError(validationError);
        setUploading(false);
        event.target.value = "";
        return;
      }

      const presignedResult = await generatePresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (!isPresignedSuccess(presignedResult)) {
        setUploadError(getActionErrorMessage(presignedResult, "Upload gagal."));
        setUploading(false);
        return;
      }

      await uploadFile(presignedResult.presignedUrl, file);

      const confirmResult = await confirmUpload(presignedResult.mediaId);

      if (!isConfirmSuccess(confirmResult)) {
        setUploadError(getActionErrorMessage(confirmResult, "Konfirmasi gagal."));
        setUploading(false);
        return;
      }

      const uploadedItem = toUploadedMediaItem(
        confirmResult.media,
        {
          id: presignedResult.mediaId,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          mediaType: getMediaTypeForUploadedFile(file),
          status: "ACTIVE",
          width: null,
          height: null,
          publicUrl: presignedResult.publicUrl,
        },
      );

      setItems((current) => [
        uploadedItem,
        ...current.filter((item) => item.id !== uploadedItem.id),
      ]);
      setTotalPages((current) => Math.max(current, 1));
      beginMediaSelection(uploadedItem);
      toast.success("Media berhasil diupload.");
    } catch {
      setUploadError("Upload ke storage gagal. Periksa konfigurasi CORS R2.");
    } finally {
      setUploading(false);
    }

    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-0 justify-start"
          disabled={disabled}
          onClick={() => {
            setLoading(true);
            setOpen(true);
          }}
        >
          <PickerIcon />
          <span className="truncate">
            {selectedItem?.fileName ??
              (value ? getSelectedFallbackLabel(mediaType) : "Select media")}
          </span>
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear media"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            <XIcon />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(85vh,760px)] max-h-[85vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>
              {getMediaPickerTitle(mediaType)}
            </DialogTitle>
            <DialogDescription>
              {mediaPreset === "logo"
                ? LOGO_IMAGE_REQUIREMENT_TEXT
                : getMediaPickerDescription(mediaType)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  className="pl-8"
                  placeholder="Search media"
                  onChange={(event) => {
                    setLoading(true);
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || mediaType === "DOCUMENT"}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <UploadIcon className="size-4" />
                )}
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptedMimeTypes(mediaType)}
                className="hidden"
                onChange={handleInlineUpload}
              />
            </div>

            {uploadError ? (
              <p className="text-xs text-destructive">{uploadError}</p>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              {loading ? (
                <div className="grid h-full min-h-48 place-items-center text-sm text-muted-foreground">
                  <Loader2Icon className="size-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="grid h-full min-h-48 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  No active media found.
                </div>
              ) : (
                <div className="grid gap-3 pb-1 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const presetErrors = getPresetErrors(item, mediaPreset);
                    const isInvalidForPreset = presetErrors.length > 0;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isInvalidForPreset}
                        title={presetErrors.join(" ")}
                        className={cn(
                          "group overflow-hidden rounded-lg border bg-background text-left transition-colors hover:border-primary",
                          item.id === value && "border-primary ring-2 ring-primary/20",
                          isInvalidForPreset && "cursor-not-allowed opacity-55",
                        )}
                        onClick={() => handleSelect(item.id)}
                      >
                        <div
                          className={cn(
                            "grid place-items-center bg-muted",
                            mediaPreset === "logo" ? "aspect-square" : "aspect-video",
                          )}
                        >
                          {item.mediaType === "IMAGE" && item.publicUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.publicUrl}
                              alt={item.fileName}
                              className="h-full w-full object-contain"
                            />
                          ) : item.mediaType === "VIDEO" && item.publicUrl ? (
                            <video
                              src={item.publicUrl}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                              aria-label={item.fileName}
                            />
                          ) : (
                            <FileTextIcon className="size-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 p-3">
                          <span className="truncate text-sm font-medium">
                            {item.fileName}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {item.mimeType}
                          </span>
                          {item.width && item.height ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {item.width}&times;{item.height}
                            </span>
                          ) : null}
                          {isInvalidForPreset ? (
                            <span className="line-clamp-2 text-xs text-destructive">
                              {presetErrors[0]}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => Math.max(current - 1, 1));
                  }}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => Math.min(current + 1, totalPages));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropConfig && cropTarget ? (
        <Dialog
          open={Boolean(cropTarget)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !cropSaving) {
              setCropTarget(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CropIcon className="size-5" />
                Crop {cropConfig.label}
              </DialogTitle>
              <DialogDescription>{cropTarget.fileName}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex flex-col gap-3">
                <div
                  className="relative overflow-hidden rounded-lg border bg-muted"
                  style={{ aspectRatio: cropConfig.aspectRatio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cropTarget.publicUrl}
                    alt={cropTarget.fileName}
                    className="absolute max-w-none select-none"
                    style={getCropPreviewStyle(cropRect)}
                    draggable={false}
                  />
                </div>
                {cropError ? (
                  <p className="text-xs text-destructive">{cropError}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <RangeField
                  label="Zoom"
                  value={cropZoom}
                  min={1}
                  max={3}
                  step={0.01}
                  disabled={cropSaving}
                  onChange={setCropZoom}
                />
                <RangeField
                  label="Horizontal"
                  value={cropPosition.x}
                  min={0}
                  max={100}
                  step={1}
                  disabled={cropSaving || cropRect.width >= 0.999}
                  onChange={(x) =>
                    setCropPosition((current) => ({ ...current, x }))
                  }
                />
                <RangeField
                  label="Vertical"
                  value={cropPosition.y}
                  min={0}
                  max={100}
                  step={1}
                  disabled={cropSaving || cropRect.height >= 0.999}
                  onChange={(y) =>
                    setCropPosition((current) => ({ ...current, y }))
                  }
                />

                <div className="mt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={cropSaving}
                    onClick={() => {
                      setCropZoom(1);
                      setCropPosition({ x: 50, y: 50 });
                    }}
                  >
                    <RotateCcwIcon />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={cropSaving}
                    onClick={handleUseOriginal}
                  >
                    Use original
                  </Button>
                  <Button
                    type="button"
                    disabled={cropSaving}
                    onClick={handleApplyCrop}
                  >
                    {cropSaving ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <CropIcon />
                    )}
                    Use crop
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {Math.round(value)}
        </span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full accent-primary"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

async function uploadFile(url: string, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(file);
  });
}

async function validateFileForPreset(
  file: File,
  mediaPreset: MediaPreset | undefined,
) {
  if (mediaPreset !== "logo") {
    return null;
  }

  const basicErrors = validateLogoFileBasics(file);

  if (basicErrors.length > 0) {
    return basicErrors.join(" ");
  }

  let dimensions: { width: number; height: number };

  try {
    dimensions = await readImageDimensions(file);
  } catch {
    return "Dimensi logo tidak bisa dibaca. Gunakan file JPG, PNG, atau WebP yang valid.";
  }

  const dimensionErrors = validateLogoImageDimensions(
    dimensions.width,
    dimensions.height,
  );

  return dimensionErrors.length > 0 ? dimensionErrors.join(" ") : null;
}

function getPresetErrors(
  media: MediaItem,
  mediaPreset: MediaPreset | undefined,
) {
  if (mediaPreset !== "logo") {
    return [];
  }

  return validateLogoImageAsset(media);
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    });

    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image dimensions could not be read"));
    });

    image.src = url;
  });
}

function buildCropRect(
  sourceWidth: number | null,
  sourceHeight: number | null,
  targetAspectRatio: number,
  zoom: number,
  position: { x: number; y: number },
): MediaCropRect {
  const safeWidth = sourceWidth && sourceWidth > 0 ? sourceWidth : targetAspectRatio;
  const safeHeight = sourceHeight && sourceHeight > 0 ? sourceHeight : 1;
  const sourceAspectRatio = safeWidth / safeHeight;
  let baseWidth = 1;
  let baseHeight = 1;

  if (sourceAspectRatio > targetAspectRatio) {
    baseWidth = targetAspectRatio / sourceAspectRatio;
  } else {
    baseHeight = sourceAspectRatio / targetAspectRatio;
  }

  const safeZoom = clampNumber(zoom, 1, 3);
  const width = clampNumber(baseWidth / safeZoom, 0.01, 1);
  const height = clampNumber(baseHeight / safeZoom, 0.01, 1);

  return {
    x: (1 - width) * (clampNumber(position.x, 0, 100) / 100),
    y: (1 - height) * (clampNumber(position.y, 0, 100) / 100),
    width,
    height,
  };
}

function getCropPreviewStyle(crop: MediaCropRect): CSSProperties {
  return {
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function isMediaListSuccess(value: unknown): value is {
  ok: true;
  items: MediaItem[];
  totalPages: number;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    Array.isArray(value.items) &&
    typeof value.totalPages === "number"
  );
}

function isPresignedSuccess(value: unknown): value is {
  ok: true;
  mediaId: string;
  presignedUrl: string;
  publicUrl: string;
} {
  return isRecord(value) && value.ok === true && typeof value.presignedUrl === "string" && typeof value.mediaId === "string" && typeof value.publicUrl === "string";
}

function isConfirmSuccess(value: unknown): value is {
  ok: true;
  media: Record<string, unknown>;
} {
  return isRecord(value) && value.ok === true && isRecord(value.media);
}

function isCropSuccess(value: unknown): value is {
  ok: true;
  media: Record<string, unknown>;
} {
  return isRecord(value) && value.ok === true && isRecord(value.media);
}

function toUploadedMediaItem(media: Record<string, unknown>, fallback: MediaItem): MediaItem {
  return {
    id: typeof media.id === "string"
      ? media.id
      : typeof media.mediaId === "string"
        ? media.mediaId
        : fallback.id,
    fileName: typeof media.fileName === "string" ? media.fileName : fallback.fileName,
    mimeType: typeof media.mimeType === "string" ? media.mimeType : fallback.mimeType,
    fileSize: typeof media.fileSize === "number" ? media.fileSize : fallback.fileSize,
    mediaType: isMediaType(media.mediaType) ? media.mediaType : fallback.mediaType,
    status: typeof media.status === "string" ? media.status : fallback.status,
    width: typeof media.width === "number" ? media.width : fallback.width,
    height: typeof media.height === "number" ? media.height : fallback.height,
    publicUrl: typeof media.publicUrl === "string" ? media.publicUrl : fallback.publicUrl,
  };
}

function getAcceptedMimeTypes(mediaType: MediaType) {
  if (mediaType === "IMAGE") {
    return "image/jpeg,image/png,image/webp";
  }

  if (mediaType === "VIDEO") {
    return "video/mp4,video/webm,video/quicktime";
  }

  return INLINE_UPLOAD_ACCEPT;
}

function getMediaPickerTitle(mediaType: MediaType) {
  if (mediaType === "IMAGE") {
    return "Select image";
  }

  if (mediaType === "VIDEO") {
    return "Select video";
  }

  return "Select document";
}

function getMediaPickerDescription(mediaType: MediaType) {
  if (mediaType === "VIDEO") {
    return "Choose an active video from the tenant media library.";
  }

  return "Choose an active asset from the tenant media library.";
}

function getSelectedFallbackLabel(mediaType: MediaType) {
  if (mediaType === "IMAGE") {
    return "Image selected";
  }

  if (mediaType === "VIDEO") {
    return "Video selected";
  }

  return "Document selected";
}

function isMediaType(value: unknown): value is MediaType {
  return value === "IMAGE" || value === "DOCUMENT" || value === "VIDEO";
}

function isAllowedInlineUploadFile(file: File) {
  return ALLOWED_INLINE_UPLOAD_MIME_TYPES.has(file.type);
}

function getMediaTypeForUploadedFile(file: File): MediaType {
  return file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
}

function getActionErrorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
