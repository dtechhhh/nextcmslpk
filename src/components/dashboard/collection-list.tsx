"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileImageIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  TrashIcon,
  Undo2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCmsBusy } from "@/components/cms/cms-busy-feedback";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCollectionDefinition,
  type CollectionDefinition,
  type CollectionKey,
  type CollectionOptionSets,
  type PublishStatus,
} from "@/lib/collection-definitions";
import {
  getCmsCollectionEyebrow,
  getCmsCollectionLabel,
  getCmsCollectionPluralLabel,
  getCmsFilterLabel,
  getCmsPublishStatusLabel,
} from "@/lib/cms-field-guidance";
import {
  deleteItem,
  listItems,
  publishItem,
  unpublishItem,
} from "@/server/actions/tenant/collection";

type ListItem = {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  excerpt: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  startAt: string | null;
  expiredAt: string | null;
  sortOrder: number;
  collectionKey: string;
  dataJson: Record<string, unknown>;
  updatedAt: string;
  thumbnailImage: {
    id: string;
    fileName: string;
    publicUrl: string;
  } | null;
};

type CollectionListProps = {
  variantId: string;
  collectionKey: CollectionKey;
  optionSets: CollectionOptionSets;
};

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Terbit" },
];

export function CollectionList({
  variantId,
  collectionKey,
  optionSets,
}: CollectionListProps) {
  const router = useRouter();
  const definition = useMemo(
    () => getCollectionDefinition(collectionKey),
    [collectionKey],
  );
  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [optionFilters, setOptionFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ListItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { start, startNavigation } = useCmsBusy();

  const fetchItems = useCallback(async () => {
    const stopBusy = start("Memuat daftar konten...");

    try {
      const response = await listItems({
        variantId,
        collectionKey,
        status: statusFilter,
        page: currentPage,
        filters: optionFilters,
      });

      if (!isListSuccess(response)) {
        toast.error(getActionError(response, "Gagal memuat data."));
        return;
      }

      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } finally {
      setLoading(false);
      stopBusy();
    }
  }, [variantId, collectionKey, statusFilter, currentPage, optionFilters, start]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stopBusy = start("Memuat daftar konten...");

      try {
        const response = await listItems({
          variantId,
          collectionKey,
          status: statusFilter,
          page: currentPage,
          filters: optionFilters,
        });

        if (cancelled) {
          return;
        }

        if (!isListSuccess(response)) {
          toast.error(getActionError(response, "Gagal memuat data."));
          return;
        }

        setItems(response.items);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
        stopBusy();
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [variantId, collectionKey, statusFilter, currentPage, optionFilters, start]);

  function handleStatusChange(value: string | null) {
    setLoading(true);
    setStatusFilter(value ?? "ALL");
    setCurrentPage(1);
  }

  function handleOptionFilterChange(path: string, value: string | null) {
    setLoading(true);
    setOptionFilters((current) => {
      const next = { ...current };

      if (!value || value === "ALL") {
        delete next[path];
      } else {
        next[path] = value;
      }

      return next;
    });
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setLoading(true);
    setCurrentPage(page);
  }

  async function handlePublish(item: ListItem) {
    setActionLoading(item.id);
    const stopBusy = start(`Menerbitkan ${item.title || "item"}...`);

    try {
      const response = await publishItem(item.id);

      if (isActionSuccess(response)) {
        toast.success(`${item.title} diterbitkan.`);
        await fetchItems();
      } else {
        toast.error(getActionError(response, "Gagal menerbitkan."));
      }
    } finally {
      stopBusy();
      setActionLoading(null);
    }
  }

  async function handleUnpublish(item: ListItem) {
    setActionLoading(item.id);
    const stopBusy = start(`Mengembalikan ${item.title || "item"} ke draft...`);

    try {
      const response = await unpublishItem(item.id);

      if (isActionSuccess(response)) {
        toast.success(`${item.title} kembali ke draft.`);
        await fetchItems();
      } else {
        toast.error(getActionError(response, "Gagal mengembalikan ke draft."));
      }
    } finally {
      stopBusy();
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setActionLoading(deleteTarget.id);
    const stopBusy = start(`Menghapus ${deleteTarget.title || "item"}...`);

    try {
      const response = await deleteItem(deleteTarget.id);

      if (isActionSuccess(response)) {
        toast.success(`${deleteTarget.title} dihapus.`);
        setDeleteTarget(null);
        await fetchItems();
      } else {
        toast.error(getActionError(response, "Gagal menghapus."));
      }
    } finally {
      stopBusy();
      setActionLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {getCmsCollectionEyebrow(definition.eyebrow)}
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {getCmsCollectionPluralLabel(definition.pluralLabel)}
          </h1>
        </div>
        <Button
          onClick={() => {
            startNavigation("Membuka editor baru...");
            router.push(definition.createPath);
          }}
        >
          <PlusIcon />
          Tambah {getCmsCollectionLabel(definition.label)}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {definition.optionFilters.map((filter) => {
          const filterLabel = getCmsFilterLabel(filter.path, filter.label);

          return (
            <Select
              key={filter.path}
              value={resolveFilterValue(
                optionFilters[filter.path],
                optionSets[filter.optionSetKey] ?? [],
              )}
              onValueChange={(value) => handleOptionFilterChange(filter.path, value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua {filterLabel}</SelectItem>
                {(optionSets[filter.optionSetKey] ?? []).map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Gambar</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Diperbarui</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2Icon className="size-4 animate-spin" />
                    Memuat...
                  </span>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada {getCmsCollectionLabel(definition.label).toLowerCase()}.
                  {" "}
                  <Link
                    href={definition.createPath}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Buat yang pertama.
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Thumbnail item={item} />
                  </TableCell>
                  <TableCell className="max-w-56">
                    <Link
                      href={`${definition.listPath}/${item.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {item.title || "Tanpa judul"}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      /{item.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="max-w-64 text-sm text-muted-foreground">
                    <span className="line-clamp-2">
                      {getInfoValue(definition, item, optionSets)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={actionLoading === item.id}
                            aria-label="Aksi"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            startNavigation("Membuka editor...");
                            router.push(`${definition.listPath}/${item.id}`);
                          }}
                        >
                          <PencilIcon />
                          Ubah
                        </DropdownMenuItem>
                        {item.status === "PUBLISHED" ? (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleUnpublish(item)}
                          >
                            <Undo2Icon />
                            Batalkan terbit
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={item.status !== "DRAFT"}
                            onClick={() => handlePublish(item)}
                          >
                            <SendIcon />
                            Terbitkan
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          variant="destructive"
                          disabled={item.status !== "DRAFT"}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <TrashIcon />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {total} total item{total === 1 ? "" : "s"}
        </div>

        {totalPages > 1 ? (
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>
              {generatePageNumbers(currentPage, totalPages).map((page, index) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <span className="flex size-8 items-center justify-center text-muted-foreground">
                      ...
                    </span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteTarget?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Item yang sudah terbit harus
              dibatalkan terbit terlebih dahulu sebelum dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Thumbnail({ item }: { item: ListItem }) {
  if (item.thumbnailImage?.publicUrl) {
    return (
      <div className="size-10 overflow-hidden rounded-md bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailImage.publicUrl}
          alt={item.title}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
      <FileImageIcon className="size-4 text-muted-foreground" />
    </div>
  );
}

export function StatusBadge({ status }: { status: PublishStatus | string }) {
  switch (status) {
    case "PUBLISHED":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          {getCmsPublishStatusLabel(status)}
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          {getCmsPublishStatusLabel(status)}
        </Badge>
      );
    case "FILLED":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {getCmsPublishStatusLabel(status)}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{getCmsPublishStatusLabel("DRAFT")}</Badge>;
  }
}

function getInfoValue(
  definition: CollectionDefinition,
  item: ListItem,
  optionSets: CollectionOptionSets,
) {
  if (definition.hasExpiry && item.expiredAt) {
    const prefix = item.status === "PUBLISHED" ? "Berakhir" : "Tanggal berakhir";

    return `${prefix} ${formatDate(item.expiredAt)}`;
  }

  for (const path of definition.listInfoPaths) {
    const rawValue = getAtPath(item.dataJson, path);
    const label = resolveOptionLabel(path, rawValue, definition, optionSets);

    if (label) {
      return label;
    }
  }

  return item.excerpt || (item.isFeatured ? "Unggulan" : "-");
}

function resolveOptionLabel(
  path: string,
  value: unknown,
  definition: CollectionDefinition,
  optionSets: CollectionOptionSets,
) {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }

  const filter = definition.optionFilters.find((item) => item.path === path);

  if (!filter) {
    return value;
  }

  return (
    optionSets[filter.optionSetKey]?.find(
      (option) => option.id === value || option.value === value,
    )
      ?.label ?? value
  );
}

function resolveFilterValue(
  value: string | undefined,
  options: CollectionOptionSets[string],
) {
  if (!value) {
    return "ALL";
  }

  return (
    options.find((option) => option.id === value || option.value === value)
      ?.id ?? value
  );
}

function getAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);

      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_value, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

function isListSuccess(value: unknown): value is {
  ok: true;
  items: ListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    Array.isArray(value.items) &&
    typeof value.total === "number" &&
    typeof value.totalPages === "number"
  );
}

function isActionSuccess(value: unknown): value is { ok: true } {
  return isRecord(value) && value.ok === true;
}

function getActionError(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
