import Link from "next/link";
import { RotateCcwIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { prisma } from "@/server/db/client";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const actionFilters = [
  { value: "all", label: "All actions" },
  { value: "tenant.*", label: "tenant.*" },
  { value: "content.*", label: "content.*" },
  { value: "user.*", label: "user.*" },
  { value: "media.*", label: "media.*" },
] as const;

const dateRangeFilters = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
] as const;

type ActionFilter = (typeof actionFilters)[number]["value"];
type DateRangeFilter = (typeof dateRangeFilters)[number]["value"];

type AuditLogPageProps = {
  searchParams: Promise<{
    tenant?: string | string[];
    action?: string | string[];
    range?: string | string[];
    from?: string | string[];
    to?: string | string[];
    page?: string | string[];
  }>;
};

type AuditLogFilters = {
  tenantId: string | null;
  action: ActionFilter;
  range: DateRangeFilter;
  from: string;
  to: string;
  page: number;
};

type TenantFilterOption = {
  id: string;
  name: string;
  slug: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  await requireSuperAdminPage();

  const [params, tenants] = await Promise.all([
    searchParams,
    prisma.tenant.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  const filters = parseFilters(params, tenants);
  const where = createAuditLogWhere(filters);
  const totalEntries = await prisma.auditLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalEntries / PER_PAGE));
  const currentPage = Math.min(filters.page, totalPages);
  const auditLogs = await prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * PER_PAGE,
    take: PER_PAGE,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  const firstShown = totalEntries === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const lastShown = Math.min(currentPage * PER_PAGE, totalEntries);

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Super Admin</p>
        <h1 className="text-2xl font-semibold tracking-normal">Audit Log</h1>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Tenant, action prefix, and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
            <FilterField label="Tenant" htmlFor="tenant">
              <select
                id="tenant"
                name="tenant"
                defaultValue={filters.tenantId ?? "all"}
                className={selectClassName}
              >
                <option value="all">All tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.slug})
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Action" htmlFor="action">
              <select
                id="action"
                name="action"
                defaultValue={filters.action}
                className={selectClassName}
              >
                {actionFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Date range" htmlFor="range">
              <select
                id="range"
                name="range"
                defaultValue={filters.range}
                className={selectClassName}
              >
                {dateRangeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="From" htmlFor="from">
              <input
                id="from"
                name="from"
                type="date"
                defaultValue={filters.from}
                className={inputClassName}
              />
            </FilterField>

            <FilterField label="To" htmlFor="to">
              <input
                id="to"
                name="to"
                type="date"
                defaultValue={filters.to}
                className={inputClassName}
              />
            </FilterField>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className={cn(buttonVariants(), "min-w-24")}
              >
                <SearchIcon />
                Apply
              </button>
              <Link
                href="/super-admin/audit-log"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <RotateCcwIcon />
                Reset
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Global Audit Log</CardTitle>
          <CardDescription>
            Showing {firstShown.toLocaleString("id-ID")}-
            {lastShown.toLocaleString("id-ID")} of{" "}
            {totalEntries.toLocaleString("id-ID")} entries
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Target Type</TableHead>
                  <TableHead>Target ID</TableHead>
                  <TableHead>Metadata Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {dateTimeFormatter.format(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.action}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.user.username}
                      </TableCell>
                      <TableCell>{entry.targetType}</TableCell>
                      <TableCell className="max-w-48 truncate text-muted-foreground">
                        {entry.targetId ?? "-"}
                      </TableCell>
                      <TableCell
                        className="max-w-sm truncate text-muted-foreground"
                        title={previewMetadata(entry.metadata)}
                      >
                        {previewMetadata(entry.metadata)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No audit log entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage.toLocaleString("id-ID")} of{" "}
              {totalPages.toLocaleString("id-ID")}
            </p>
            <AuditLogPagination
              filters={filters}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function AuditLogPagination({
  filters,
  currentPage,
  totalPages,
}: {
  filters: AuditLogFilters;
  currentPage: number;
  totalPages: number;
}) {
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination className="mx-0 w-auto justify-start sm:justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createAuditLogHref(filters, currentPage - 1)}
            text="Previous"
            aria-disabled={!hasPrevious}
            className={!hasPrevious ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createAuditLogHref(filters, page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={createAuditLogHref(filters, currentPage + 1)}
            text="Next"
            aria-disabled={!hasNext}
            className={!hasNext ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm font-medium" htmlFor={htmlFor}>
      {label}
      {children}
    </label>
  );
}

function parseFilters(
  params: Awaited<AuditLogPageProps["searchParams"]>,
  tenants: TenantFilterOption[],
): AuditLogFilters {
  const tenant = readParam(params.tenant);
  const action = normalizeActionFilter(readParam(params.action));
  const range = normalizeDateRangeFilter(readParam(params.range));
  const from = normalizeDateParam(readParam(params.from));
  const to = normalizeDateParam(readParam(params.to));
  const tenantId = tenants.some((item) => item.id === tenant) ? tenant : null;
  const parsedPage = Number.parseInt(readParam(params.page) ?? "1", 10);

  return {
    tenantId,
    action,
    range,
    from,
    to,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

function createAuditLogWhere(filters: AuditLogFilters): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  const dateFilter = createDateFilter(filters);

  if (filters.tenantId) {
    where.tenantId = filters.tenantId;
  }

  if (filters.action !== "all") {
    where.action = {
      startsWith: filters.action.replace("*", ""),
    };
  }

  if (dateFilter) {
    where.createdAt = dateFilter;
  }

  return where;
}

function createDateFilter(filters: AuditLogFilters) {
  if (filters.range === "7d") {
    return {
      gte: new Date(Date.now() - 7 * MS_PER_DAY),
    };
  }

  if (filters.range === "30d") {
    return {
      gte: new Date(Date.now() - 30 * MS_PER_DAY),
    };
  }

  if (filters.range !== "custom") {
    return null;
  }

  const fromDate = createJakartaStartDate(filters.from);
  const toDate = createJakartaEndDate(filters.to);

  if (!fromDate && !toDate) {
    return null;
  }

  return {
    ...(fromDate ? { gte: fromDate } : {}),
    ...(toDate ? { lte: toDate } : {}),
  };
}

function createAuditLogHref(filters: AuditLogFilters, page: number) {
  const query = new URLSearchParams();

  if (filters.tenantId) {
    query.set("tenant", filters.tenantId);
  }

  if (filters.action !== "all") {
    query.set("action", filters.action);
  }

  if (filters.range !== "all") {
    query.set("range", filters.range);
  }

  if (filters.from) {
    query.set("from", filters.from);
  }

  if (filters.to) {
    query.set("to", filters.to);
  }

  if (page > 1) {
    query.set("page", page.toString());
  }

  const serialized = query.toString();

  return serialized ? `/super-admin/audit-log?${serialized}` : "/super-admin/audit-log";
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function normalizeActionFilter(value: string | null): ActionFilter {
  return actionFilters.some((filter) => filter.value === value)
    ? (value as ActionFilter)
    : "all";
}

function normalizeDateRangeFilter(value: string | null): DateRangeFilter {
  return dateRangeFilters.some((filter) => filter.value === value)
    ? (value as DateRangeFilter)
    : "all";
}

function normalizeDateParam(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  return value;
}

function createJakartaStartDate(value: string) {
  return value ? new Date(`${value}T00:00:00+07:00`) : null;
}

function createJakartaEndDate(value: string) {
  return value ? new Date(`${value}T23:59:59.999+07:00`) : null;
}

function readParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() || null;
}

function previewMetadata(metadata: unknown) {
  if (metadata == null) {
    return "-";
  }

  const serialized = JSON.stringify(metadata);

  if (!serialized) {
    return "-";
  }

  return serialized.length > 180 ? `${serialized.slice(0, 177)}...` : serialized;
}

const inputClassName =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClassName = cn(inputClassName, "appearance-auto");
