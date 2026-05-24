"use client";

import {
  CheckIcon,
  FileTextIcon,
  Grid3x3Icon,
  ListIcon,
  Loader2Icon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  confirmUpload,
  deleteMedia,
  generatePresignedUploadUrl,
  getMediaReferences,
  listMedia,
  updateMediaAltText,
} from "@/server/actions/tenant/media";
import { cn } from "@/lib/utils";

type MediaType = "IMAGE" | "DOCUMENT";
type ViewMode = "grid" | "list";
type FilterType = "ALL" | "IMAGE" | "DOCUMENT";

type MediaItem = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: MediaType;
  status: string;
  storagePath: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  publicUrl: string;
  usageCount: number;
};

type UploadEntry = {
  id: string;
  fileName: string;
  mediaType: MediaType;
  fileSize: number;
  progress: number;
  status: "uploading" | "confirming" | "done" | "error";
  error?: string;
};

type MediaLibraryProps = {
  tenantId: string;
};

const PAGE_SIZE = 24;

export function MediaLibrary({ tenantId }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [editingAltValue, setEditingAltValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleteRefCount, setDeleteRefCount] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadItems = useCallback(async () => {
    const mediaType = filter === "ALL" ? undefined : filter;
    const response = await listMedia(
      tenantId,
      { mediaType, status: "ACTIVE", query: query || undefined },
      { page, pageSize: PAGE_SIZE },
    );

    setLoading(false);

    if (isMediaListSuccess(response)) {
      setItems(response.items);
      setTotalPages(Math.max(response.totalPages, 1));
    } else {
      toast.error(getErrorMessage(response, "Media gagal dimuat."));
    }
  }, [tenantId, filter, query, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadItems]);

  function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      void uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    const entry: UploadEntry = {
      id: String(Math.random()),
      fileName: file.name,
      mediaType: file.type === "application/pdf" ? "DOCUMENT" : "IMAGE",
      fileSize: file.size,
      progress: 0,
      status: "uploading",
    };

    setUploads((current) => [...current, entry]);

    try {
      const presignedResult = await generatePresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (!isPresignedSuccess(presignedResult)) {
        setUploads((current) =>
          current.map((u) =>
            u.id === entry.id
              ? { ...u, status: "error", error: getErrorMessage(presignedResult, "Upload gagal.") }
              : u,
          ),
        );
        return;
      }

      await uploadToR2(presignedResult.presignedUrl, file, (progress) => {
        setUploads((current) =>
          current.map((u) => (u.id === entry.id ? { ...u, progress } : u)),
        );
      });

      setUploads((current) =>
        current.map((u) => (u.id === entry.id ? { ...u, status: "confirming", progress: 100 } : u)),
      );

      const confirmResult = await confirmUpload(presignedResult.mediaId);

      if (!isConfirmSuccess(confirmResult)) {
        setUploads((current) =>
          current.map((u) =>
            u.id === entry.id
              ? { ...u, status: "error", error: getErrorMessage(confirmResult, "Konfirmasi gagal.") }
              : u,
          ),
        );
        return;
      }

      setUploads((current) => current.map((u) => (u.id === entry.id ? { ...u, status: "done" } : u)));
      void loadItems();

      setTimeout(() => {
        setUploads((current) => current.filter((u) => u.id !== entry.id));
      }, 3000);
    } catch {
      setUploads((current) =>
        current.map((u) =>
          u.id === entry.id ? { ...u, status: "error", error: "Upload gagal." } : u,
        ),
      );
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  }

  async function handleDelete(media: MediaItem) {
    setDeleteTarget(media);
    setDeleteLoading(true);

    const refs = await getMediaReferences(media.id);

    if (isRefSuccess(refs)) {
      setDeleteRefCount(refs.totalReferences);
    } else {
      setDeleteRefCount(0);
    }

    setDeleteLoading(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const result = await deleteMedia(deleteTarget.id);

    if (isDeleteSuccess(result)) {
      toast.success("Media dihapus.");
      setDeleteTarget(null);
      void loadItems();
    } else {
      toast.error(getErrorMessage(result, "Media gagal dihapus."));
      setDeleteTarget(null);
    }
  }

  async function handleSaveAltText(mediaId: string) {
    if (editingAltValue.trim().length > 200) {
      toast.error("Alt text maksimal 200 karakter.");
      return;
    }

    const result = await updateMediaAltText({ mediaId, altText: editingAltValue });

    if (isAltTextSuccess(result)) {
      setItems((current) =>
        current.map((item) =>
          item.id === mediaId ? { ...item, altText: result.media.altText } : item,
        ),
      );
      setEditingAltId(null);
    } else {
      toast.error(getErrorMessage(result, "Alt text gagal diubah."));
    }
  }

  function startEditAlt(media: MediaItem) {
    setEditingAltId(media.id);
    setEditingAltValue(media.altText ?? "");
  }

  const activeUploads = uploads.filter((u) => u.status !== "done").length;
  const canDelete = deleteTarget && deleteRefCount === 0 && !deleteLoading;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Shared</p>
        <h1 className="text-2xl font-semibold tracking-normal">Media Library</h1>
      </div>

      <div
        ref={dropZoneRef}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <UploadIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP (max 5 MB) &middot; PDF (max 10 MB)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            Browse files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                handleFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {uploads.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <p className="text-sm font-medium">
            Uploads {activeUploads > 0 ? `(${activeUploads} active)` : ""}
          </p>
          <div className="flex flex-col gap-1.5">
            {uploads.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                {entry.status === "done" ? (
                  <CheckIcon className="size-4 shrink-0 text-emerald-600" />
                ) : entry.status === "error" ? (
                  <XIcon className="size-4 shrink-0 text-destructive" />
                ) : (
                  <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">{entry.fileName}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(entry.fileSize)}
                </span>
                {entry.status === "uploading" && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {Math.round(entry.progress)}%
                  </span>
                )}
                {entry.status === "error" && entry.error && (
                  <span className="shrink-0 text-xs text-destructive">{entry.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          {(["ALL", "IMAGE", "DOCUMENT"] as FilterType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => {
                setLoading(true);
                setFilter(type);
                setPage(1);
              }}
            >
              {type === "ALL" ? "All" : type === "IMAGE" ? "Images" : "Documents"}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            className="w-48 pl-8"
            placeholder="Search..."
            onChange={(event) => {
              setLoading(true);
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <button
            type="button"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "grid" ? "bg-muted" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid3x3Icon className="size-4" />
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md p-1.5 transition-colors",
              viewMode === "list" ? "bg-muted" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-72">
        {loading ? (
          <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No media found.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                editingAltId={editingAltId}
                editingAltValue={editingAltValue}
                onStartEditAlt={startEditAlt}
                onAltValueChange={setEditingAltValue}
                onSaveAlt={handleSaveAltText}
                onCancelEditAlt={() => setEditingAltId(null)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col rounded-lg border">
            {items.map((item, index) => (
              <MediaListRow
                key={item.id}
                media={item}
                bordered={index < items.length - 1}
                editingAltId={editingAltId}
                editingAltValue={editingAltValue}
                onStartEditAlt={startEditAlt}
                onAltValueChange={setEditingAltValue}
                onSaveAlt={handleSaveAltText}
                onCancelEditAlt={() => setEditingAltId(null)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
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
      ) : null}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteLoading ? (
                "Checking references..."
              ) : canDelete ? (
                `Delete "${deleteTarget?.fileName}"? This action cannot be undone.`
              ) : (
                <>
                  <span className="font-medium">&ldquo;{deleteTarget?.fileName}&rdquo;</span> is used in{" "}
                  <span className="font-medium">{deleteRefCount}</span> content item(s). Remove media from all content before deleting.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canDelete || deleteLoading}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MediaCard({
  media,
  editingAltId,
  editingAltValue,
  onStartEditAlt,
  onAltValueChange,
  onSaveAlt,
  onCancelEditAlt,
  onDelete,
}: {
  media: MediaItem;
  editingAltId: string | null;
  editingAltValue: string;
  onStartEditAlt: (media: MediaItem) => void;
  onAltValueChange: (value: string) => void;
  onSaveAlt: (mediaId: string) => void;
  onCancelEditAlt: () => void;
  onDelete: (media: MediaItem) => void;
}) {
  const isEditingAlt = editingAltId === media.id;
  const deleteDisabled = media.usageCount > 0;
  const deleteTooltip = deleteDisabled ? "Remove from content first" : "Delete";

  return (
    <div className="group overflow-hidden rounded-lg border bg-card">
      <div className="grid aspect-video place-items-center bg-muted">
        {media.mediaType === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.publicUrl}
            alt={media.altText ?? media.fileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileTextIcon className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium" title={media.fileName}>
            {media.fileName}
          </p>
          <Tooltip>
            <TooltipTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label={deleteTooltip}
                disabled={deleteDisabled}
                onClick={() => onDelete(media)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{deleteTooltip}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">
            {media.mediaType}
          </Badge>
          <span>{formatFileSize(media.fileSize)}</span>
          {media.width && media.height ? (
            <span>
              {media.width}&times;{media.height}
            </span>
          ) : null}
          <span>{formatUsageCount(media.usageCount)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(media.createdAt)}
        </p>
        {isEditingAlt ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingAltValue}
              className="h-7 text-xs"
              maxLength={200}
              autoFocus
              onChange={(event) => onAltValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSaveAlt(media.id);
                } else if (event.key === "Escape") {
                  onCancelEditAlt();
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => onSaveAlt(media.id)}
            >
              <CheckIcon className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {media.altText || "No alt text"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => onStartEditAlt(media)}
            >
              <PencilIcon className="size-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaListRow({
  media,
  bordered,
  editingAltId,
  editingAltValue,
  onStartEditAlt,
  onAltValueChange,
  onSaveAlt,
  onCancelEditAlt,
  onDelete,
}: {
  media: MediaItem;
  bordered: boolean;
  editingAltId: string | null;
  editingAltValue: string;
  onStartEditAlt: (media: MediaItem) => void;
  onAltValueChange: (value: string) => void;
  onSaveAlt: (mediaId: string) => void;
  onCancelEditAlt: () => void;
  onDelete: (media: MediaItem) => void;
}) {
  const isEditingAlt = editingAltId === media.id;
  const deleteDisabled = media.usageCount > 0;
  const deleteTooltip = deleteDisabled ? "Remove from content first" : "Delete";

  return (
    <div className={cn("group flex items-center gap-4 px-4 py-3", bordered && "border-b")}>
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
        {media.mediaType === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.publicUrl}
            alt={media.fileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileTextIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{media.fileName}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">{media.mediaType}</Badge>
          <span>{formatFileSize(media.fileSize)}</span>
          {media.width && media.height ? <span>{media.width}&times;{media.height}</span> : null}
          <span>{formatDateTime(media.createdAt)}</span>
          <span>{formatUsageCount(media.usageCount)}</span>
        </div>
      </div>
      <div className="flex min-w-0 max-w-40 flex-1 items-center">
        {isEditingAlt ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingAltValue}
              className="h-7 text-xs"
              maxLength={200}
              autoFocus
              onChange={(event) => onAltValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSaveAlt(media.id);
                } else if (event.key === "Escape") {
                  onCancelEditAlt();
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => onSaveAlt(media.id)}
            >
              <CheckIcon className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <p className="truncate text-xs text-muted-foreground">
              {media.altText || "No alt text"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={() => onStartEditAlt(media)}
            >
              <PencilIcon className="size-3" />
            </Button>
          </div>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={deleteTooltip}
            disabled={deleteDisabled}
            onClick={() => onDelete(media)}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{deleteTooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

async function uploadToR2(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100);
      }
    });

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatUsageCount(count: number) {
  return `Used in ${count} item${count === 1 ? "" : "s"}`;
}

function isMediaListSuccess(value: unknown): value is {
  ok: true;
  items: MediaItem[];
  total: number;
  totalPages: number;
} {
  return (
    isRecord(value) && value.ok === true && Array.isArray(value.items) && typeof value.totalPages === "number"
  );
}

function isPresignedSuccess(value: unknown): value is {
  ok: true;
  mediaId: string;
  presignedUrl: string;
  publicUrl: string;
} {
  return isRecord(value) && value.ok === true && typeof value.presignedUrl === "string" && typeof value.mediaId === "string";
}

function isConfirmSuccess(value: unknown): value is {
  ok: true;
  media: { publicUrl: string; storagePath: string };
} {
  return isRecord(value) && value.ok === true && isRecord(value.media);
}

function isRefSuccess(value: unknown): value is {
  ok: true;
  totalReferences: number;
  references: unknown;
} {
  return isRecord(value) && value.ok === true && typeof value.totalReferences === "number";
}

function isDeleteSuccess(value: unknown): value is {
  ok: true;
} {
  return isRecord(value) && value.ok === true;
}

function isAltTextSuccess(value: unknown): value is {
  ok: true;
  media: { id: string; altText: string | null };
} {
  return isRecord(value) && value.ok === true && isRecord(value.media);
}

function getErrorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string") return value.error;
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
