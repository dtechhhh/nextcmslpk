"use client";

import { FileTextIcon, ImageIcon, Loader2Icon, SearchIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  confirmUpload,
  generatePresignedUploadUrl,
  listMedia,
} from "@/server/actions/tenant/media";
import { cn } from "@/lib/utils";
import {
  LOGO_IMAGE_REQUIREMENT_TEXT,
  validateLogoFileBasics,
  validateLogoImageAsset,
  validateLogoImageDimensions,
  type MediaPreset,
} from "@/lib/media-constraints";

type MediaType = "IMAGE" | "DOCUMENT";

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
  disabled?: boolean;
};

export function MediaPicker({
  tenantId,
  value,
  onChange,
  mediaType = "IMAGE",
  mediaPreset,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === value) ?? null,
    [items, value],
  );
  const PickerIcon = mediaType === "IMAGE" ? ImageIcon : FileTextIcon;

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
          pageSize: 12,
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
    onChange(mediaId);
    setOpen(false);
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

      onChange(presignedResult.mediaId);
      setOpen(false);
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
            {selectedItem?.fileName ?? (value ? `Selected: ${value}` : "Select media")}
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
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {mediaType === "IMAGE" ? "Select image" : "Select document"}
            </DialogTitle>
            <DialogDescription>
              {mediaPreset === "logo"
                ? LOGO_IMAGE_REQUIREMENT_TEXT
                : "Choose an active asset from the tenant media library."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
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
                disabled={uploading}
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
                accept={
                  mediaType === "IMAGE"
                    ? "image/jpeg,image/png,image/webp"
                    : "application/pdf"
                }
                className="hidden"
                onChange={handleInlineUpload}
              />
            </div>

            {uploadError ? (
              <p className="text-xs text-destructive">{uploadError}</p>
            ) : null}

            <div className="min-h-72 overflow-y-auto pr-1">
              {loading ? (
                <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
                  <Loader2Icon className="size-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="grid min-h-72 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  No active media found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                        <div className="grid aspect-video place-items-center bg-muted">
                          {item.mediaType === "IMAGE" && item.publicUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.publicUrl}
                              alt={item.fileName}
                              className="h-full w-full object-contain"
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

            <div className="flex items-center justify-between border-t pt-3">
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
    </div>
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
} {
  return isRecord(value) && value.ok === true && typeof value.presignedUrl === "string" && typeof value.mediaId === "string";
}

function isConfirmSuccess(value: unknown): value is {
  ok: true;
  media: unknown;
} {
  return isRecord(value) && value.ok === true;
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
