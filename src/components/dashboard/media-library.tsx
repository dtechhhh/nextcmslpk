"use client";

import {
  CheckIcon,
  FileTextIcon,
  Grid3x3Icon,
  HardDriveIcon,
  ListIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useCmsBusy } from "@/components/cms/cms-busy-feedback";
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
  cleanupMedia,
  confirmUpload,
  deleteMedia,
  generatePresignedUploadUrl,
  getMediaReferences,
  listMedia,
  scanMediaCleanup,
  updateMediaAltText,
} from "@/server/actions/tenant/media";
import { cn } from "@/lib/utils";

type MediaType = "IMAGE" | "DOCUMENT" | "VIDEO";
type ViewMode = "grid" | "list";
type FilterType = "ALL" | "IMAGE" | "VIDEO";

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

type CleanupReason = "STALE_UPLOAD" | "UNUSED_ACTIVE" | "ORPHAN_OBJECT";

type CleanupCandidate = {
  candidateId: string;
  kind: "MEDIA_ASSET" | "R2_OBJECT";
  mediaId: string | null;
  fileName: string;
  fileSize: number;
  mediaType: MediaType | "UNKNOWN";
  mimeType: string | null;
  status: "UPLOADING" | "ACTIVE" | "ORPHAN_OBJECT";
  storagePath: string;
  publicUrl: string;
  createdAt: string | null;
  lastModified: string | null;
  usageCount: number;
  reason: CleanupReason;
};

type CleanupSummary = {
  candidateCount: number;
  totalBytes: number;
  staleUploads: number;
  unusedActive: number;
  orphanObjects: number;
  activeUnusedGraceDays: number;
  staleUploadGraceHours: number;
  orphanObjectGraceHours: number;
};

type CleanupDeletedItem = {
  candidateId: string;
  kind: "MEDIA_ASSET" | "R2_OBJECT";
  mediaId: string | null;
  fileName: string;
  fileSize: number;
  storagePath: string;
  reason: CleanupReason;
};

type CleanupSkippedItem = {
  candidateId: string;
  fileName: string;
  storagePath: string;
  reason: string;
};

type MediaLibraryProps = {
  tenantId: string;
};

const PAGE_SIZE = 24;

const ALLOWED_LIBRARY_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

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
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [cleanupCandidates, setCleanupCandidates] = useState<CleanupCandidate[]>([]);
  const [cleanupSummary, setCleanupSummary] = useState<CleanupSummary | null>(null);
  const [selectedCleanupIds, setSelectedCleanupIds] = useState<string[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupDeleting, setCleanupDeleting] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { start } = useCmsBusy();

  const loadItems = useCallback(async () => {
    const stopBusy = start("Memuat media...");
    const mediaType = filter === "ALL" ? undefined : filter;

    try {
      const response = await listMedia(
        tenantId,
        { mediaType, status: "ACTIVE", query: query || undefined },
        { page, pageSize: PAGE_SIZE },
        { includeUsage: true },
      );

      if (isMediaListSuccess(response)) {
        setItems(response.items);
        setTotalPages(Math.max(response.totalPages, 1));
      } else {
        toast.error(getErrorMessage(response, "Media gagal dimuat."));
      }
    } finally {
      setLoading(false);
      stopBusy();
    }
  }, [tenantId, filter, query, page, start]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadItems]);

  function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const uploadableFiles = fileArray.filter(isAllowedLibraryUploadFile);

    if (uploadableFiles.length < fileArray.length) {
      toast.error("Upload hanya mendukung gambar JPG/PNG/WebP dan video MP4/WebM/MOV.");
    }

    for (const file of uploadableFiles) {
      void uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    const stopBusy = start(`Mengupload ${file.name}...`);
    const entry: UploadEntry = {
      id: String(Math.random()),
      fileName: file.name,
      mediaType: getMediaTypeForFile(file),
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
          u.id === entry.id
            ? {
                ...u,
                status: "error",
                error: "Upload ke storage gagal. Periksa konfigurasi CORS R2.",
              }
            : u,
        ),
      );
    } finally {
      stopBusy();
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
    const stopBusy = start("Mengecek penggunaan media...");

    try {
      const refs = await getMediaReferences(media.id);

      if (isRefSuccess(refs)) {
        setDeleteRefCount(refs.totalReferences);
      } else {
        setDeleteRefCount(0);
      }
    } finally {
      setDeleteLoading(false);
      stopBusy();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setConfirmDeleteLoading(true);
    const stopBusy = start(`Menghapus ${deleteTarget.fileName}...`);

    try {
      const result = await deleteMedia(deleteTarget.id);

      if (isDeleteSuccess(result)) {
        toast.success("Media dihapus.");
        setDeleteTarget(null);
        void loadItems();
      } else {
        toast.error(getErrorMessage(result, "Media gagal dihapus."));
        setDeleteTarget(null);
      }
    } finally {
      setConfirmDeleteLoading(false);
      stopBusy();
    }
  }

  async function handleScanCleanup() {
    setCleanupLoading(true);
    const stopBusy = start("Memindai media tidak terpakai...");

    try {
      const result = await scanMediaCleanup(tenantId);

      if (isCleanupScanSuccess(result)) {
        setCleanupCandidates(result.candidates);
        setCleanupSummary(result.summary);
        setSelectedCleanupIds(result.candidates.map((candidate) => candidate.candidateId));

        if (result.summary.candidateCount > 0) {
          toast.success(`${result.summary.candidateCount} kandidat cleanup ditemukan.`);
        } else {
          toast.success("Tidak ada kandidat cleanup.");
        }
      } else {
        toast.error(getErrorMessage(result, "Scan cleanup gagal."));
      }
    } finally {
      setCleanupLoading(false);
      stopBusy();
    }
  }

  function toggleCleanupCandidate(candidateId: string, checked: boolean) {
    setSelectedCleanupIds((current) => {
      if (!checked) {
        return current.filter((id) => id !== candidateId);
      }

      return [...new Set([...current, candidateId])];
    });
  }

  function toggleAllCleanupCandidates(checked: boolean) {
    setSelectedCleanupIds(checked ? cleanupCandidates.map((candidate) => candidate.candidateId) : []);
  }

  async function confirmCleanupDelete() {
    const selectedCandidates = cleanupCandidates.filter((candidate) =>
      selectedCleanupIds.includes(candidate.candidateId),
    );

    if (selectedCandidates.length === 0) {
      toast.error("Pilih minimal satu media untuk cleanup.");
      return;
    }

    setCleanupDeleting(true);
    const stopBusy = start("Membersihkan media tidak terpakai...");

    try {
      const result = await cleanupMedia({
        tenantId,
        mediaIds: selectedCandidates
          .filter((candidate) => candidate.kind === "MEDIA_ASSET" && candidate.mediaId)
          .map((candidate) => candidate.mediaId as string),
        orphanStoragePaths: selectedCandidates
          .filter((candidate) => candidate.kind === "R2_OBJECT")
          .map((candidate) => candidate.storagePath),
      });

      if (isCleanupDeleteSuccess(result)) {
        const skippedLabel =
          result.skipped.length > 0 ? `, ${result.skipped.length} dilewati` : "";

        toast.success(
          `Cleanup selesai: ${result.deleted.length} resource dihapus${skippedLabel}.`,
        );
        setCleanupDialogOpen(false);
        setSelectedCleanupIds([]);
        setLoading(true);
        await loadItems();
        await handleScanCleanup();
      } else {
        toast.error(getErrorMessage(result, "Cleanup media gagal."));
      }
    } finally {
      setCleanupDeleting(false);
      stopBusy();
    }
  }

  async function handleSaveAltText(mediaId: string) {
    if (editingAltValue.trim().length > 200) {
      toast.error("Alt text maksimal 200 karakter.");
      return;
    }

    const stopBusy = start("Menyimpan alt text...");

    try {
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
    } finally {
      stopBusy();
    }
  }

  function startEditAlt(media: MediaItem) {
    setEditingAltId(media.id);
    setEditingAltValue(media.altText ?? "");
  }

  const activeUploads = uploads.filter((u) => u.status !== "done").length;
  const canDelete =
    deleteTarget && deleteRefCount === 0 && !deleteLoading && !confirmDeleteLoading;
  const selectedCleanupIdSet = new Set(selectedCleanupIds);
  const selectedCleanupCandidates = cleanupCandidates.filter((candidate) =>
    selectedCleanupIdSet.has(candidate.candidateId),
  );
  const selectedCleanupBytes = selectedCleanupCandidates.reduce(
    (total, candidate) => total + candidate.fileSize,
    0,
  );
  const allCleanupSelected =
    cleanupCandidates.length > 0 && selectedCleanupCandidates.length === cleanupCandidates.length;

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
            JPEG, PNG, WebP (max 5 MB) &middot; MP4, WebM, MOV (max 50 MB)
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
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
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

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
              <HardDriveIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Storage cleanup</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Unused active: {cleanupSummary?.unusedActive ?? 0}</span>
                <span>Stale uploads: {cleanupSummary?.staleUploads ?? 0}</span>
                <span>R2 orphans: {cleanupSummary?.orphanObjects ?? 0}</span>
                {cleanupSummary ? (
                  <span>Potential reclaim: {formatFileSize(cleanupSummary.totalBytes)}</span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cleanupLoading || cleanupDeleting}
              onClick={handleScanCleanup}
            >
              {cleanupLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <RefreshCwIcon className="size-4" />
              )}
              Scan
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selectedCleanupCandidates.length === 0 || cleanupLoading || cleanupDeleting}
              onClick={() => setCleanupDialogOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete selected
            </Button>
          </div>
        </div>

        {cleanupSummary ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <CleanupMetric
              label="Candidates"
              value={String(cleanupSummary.candidateCount)}
              detail={`${formatFileSize(cleanupSummary.totalBytes)} total`}
            />
            <CleanupMetric
              label="Active grace"
              value={`${cleanupSummary.activeUnusedGraceDays} days`}
              detail="usage count must be zero"
            />
            <CleanupMetric
              label="Upload grace"
              value={`${cleanupSummary.staleUploadGraceHours} hour`}
              detail="for unfinished uploads"
            />
          </div>
        ) : null}

        {cleanupCandidates.length > 0 ? (
          <>
            <div className="flex flex-col gap-2 rounded-md bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={allCleanupSelected}
                  onChange={(event) => toggleAllCleanupCandidates(event.target.checked)}
                />
                Select all safe candidates
              </label>
              <span className="text-xs text-muted-foreground">
                {selectedCleanupCandidates.length} selected &middot; {formatFileSize(selectedCleanupBytes)}
              </span>
            </div>
            <div className="max-h-80 overflow-auto rounded-md border">
              {cleanupCandidates.map((candidate, index) => (
                <CleanupCandidateRow
                  key={candidate.candidateId}
                  candidate={candidate}
                  checked={selectedCleanupIdSet.has(candidate.candidateId)}
                  bordered={index < cleanupCandidates.length - 1}
                  onCheckedChange={toggleCleanupCandidate}
                />
              ))}
            </div>
          </>
        ) : cleanupSummary ? (
          <div className="grid min-h-20 place-items-center rounded-md border border-dashed text-sm text-muted-foreground">
            No cleanup candidates.
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          {(["ALL", "IMAGE", "VIDEO"] as FilterType[]).map((type) => (
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
              {getFilterLabel(type)}
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
              ) : confirmDeleteLoading ? (
                "Deleting media..."
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
              disabled={!canDelete || deleteLoading || confirmDeleteLoading}
              onClick={confirmDelete}
            >
              {confirmDeleteLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected cleanup candidates</AlertDialogTitle>
            <AlertDialogDescription>
              {cleanupDeleting ? (
                "Deleting selected resources..."
              ) : (
                <>
                  Delete <span className="font-medium">{selectedCleanupCandidates.length}</span>{" "}
                  resource(s) and reclaim{" "}
                  <span className="font-medium">{formatFileSize(selectedCleanupBytes)}</span>? The server will check references again before deleting.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cleanupDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={selectedCleanupCandidates.length === 0 || cleanupDeleting}
              onClick={confirmCleanupDelete}
            >
              {cleanupDeleting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
              Delete selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CleanupMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function CleanupCandidateRow({
  candidate,
  checked,
  bordered,
  onCheckedChange,
}: {
  candidate: CleanupCandidate;
  checked: boolean;
  bordered: boolean;
  onCheckedChange: (candidateId: string, checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted/40",
        bordered && "border-b",
      )}
    >
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded border"
        checked={checked}
        onChange={(event) => onCheckedChange(candidate.candidateId, event.target.checked)}
      />
      <CleanupCandidateIcon candidate={candidate} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="min-w-0 truncate font-medium" title={candidate.fileName}>
            {candidate.fileName}
          </p>
          <Badge variant="secondary" className="text-[10px]">
            {getCleanupReasonLabel(candidate.reason)}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground" title={candidate.storagePath}>
          {candidate.storagePath}
        </p>
      </div>
      <div className="hidden min-w-32 text-right text-xs text-muted-foreground sm:block">
        <p>{formatFileSize(candidate.fileSize)}</p>
        <p>{formatCleanupTimestamp(candidate)}</p>
      </div>
    </label>
  );
}

function CleanupCandidateIcon({ candidate }: { candidate: CleanupCandidate }) {
  if (candidate.reason === "UNUSED_ACTIVE") {
    return <ShieldCheckIcon className="size-5 shrink-0 text-emerald-600" />;
  }

  if (candidate.mediaType === "VIDEO") {
    return <VideoIcon className="size-5 shrink-0 text-muted-foreground" />;
  }

  if (candidate.mediaType === "DOCUMENT") {
    return <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />;
  }

  return <HardDriveIcon className="size-5 shrink-0 text-muted-foreground" />;
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
        ) : media.mediaType === "VIDEO" ? (
          <video
            src={media.publicUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            aria-label={media.altText ?? media.fileName}
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
        ) : media.mediaType === "VIDEO" ? (
          <VideoIcon className="size-6 text-muted-foreground" />
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

function getCleanupReasonLabel(reason: CleanupReason) {
  if (reason === "STALE_UPLOAD") return "Stale upload";
  if (reason === "UNUSED_ACTIVE") return "Unused";
  return "R2 orphan";
}

function formatCleanupTimestamp(candidate: CleanupCandidate) {
  const value = candidate.createdAt ?? candidate.lastModified;

  return value ? formatDateTime(value) : "";
}

function getFilterLabel(type: FilterType) {
  if (type === "ALL") return "All";
  if (type === "IMAGE") return "Images";
  return "Videos";
}

function getMediaTypeForFile(file: File): MediaType {
  if (file.type.startsWith("video/")) {
    return "VIDEO";
  }

  return "IMAGE";
}

function isAllowedLibraryUploadFile(file: File) {
  return ALLOWED_LIBRARY_UPLOAD_MIME_TYPES.has(file.type);
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

function isCleanupScanSuccess(value: unknown): value is {
  ok: true;
  candidates: CleanupCandidate[];
  summary: CleanupSummary;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    Array.isArray(value.candidates) &&
    isRecord(value.summary)
  );
}

function isCleanupDeleteSuccess(value: unknown): value is {
  ok: true;
  deleted: CleanupDeletedItem[];
  skipped: CleanupSkippedItem[];
  totalBytes: number;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    Array.isArray(value.deleted) &&
    Array.isArray(value.skipped) &&
    typeof value.totalBytes === "number"
  );
}

function getErrorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string") return value.error;
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
