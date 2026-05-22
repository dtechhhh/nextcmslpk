"use client";

import { FileTextIcon, ImageIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { listMedia } from "@/server/actions/tenant/media";
import { cn } from "@/lib/utils";

type MediaType = "IMAGE" | "DOCUMENT";

type MediaItem = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: MediaType;
  status: string;
  publicUrl?: string;
};

type MediaPickerProps = {
  tenantId: string;
  value: string;
  onChange: (mediaId: string) => void;
  mediaType?: MediaType;
  disabled?: boolean;
};

export function MediaPicker({
  tenantId,
  value,
  onChange,
  mediaType = "IMAGE",
  disabled = false,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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

    async function loadItems() {
      setLoading(true);
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

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [open, tenantId, mediaType, query, page]);

  function handleSelect(mediaId: string) {
    onChange(mediaId);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-0 justify-start"
          disabled={disabled}
          onClick={() => setOpen(true)}
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
              Choose an active asset from the tenant media library.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                className="pl-8"
                placeholder="Search media"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="min-h-72 overflow-y-auto pr-1">
              {loading ? (
                <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
                  Loading media...
                </div>
              ) : items.length === 0 ? (
                <div className="grid min-h-72 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  No active media found.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "group overflow-hidden rounded-lg border bg-background text-left transition-colors hover:border-primary",
                        item.id === value && "border-primary ring-2 ring-primary/20",
                      )}
                      onClick={() => handleSelect(item.id)}
                    >
                      <div className="grid aspect-video place-items-center bg-muted">
                        {item.mediaType === "IMAGE" && item.publicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.publicUrl}
                            alt={item.fileName}
                            className="h-full w-full object-cover"
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
                      </div>
                    </button>
                  ))}
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
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
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

function getActionErrorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
