import Link from "next/link";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { prisma } from "@/server/db/client";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

type TenantListPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

export default async function TenantListPage({
  searchParams,
}: TenantListPageProps) {
  await requireSuperAdminPage();

  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const tenants = await prisma.tenant.findMany({
    where: status
      ? {
          status,
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      variants: {
        select: {
          _count: {
            select: {
              domains: true,
            },
          },
        },
      },
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Tenants</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            Tenant List
          </h1>
        </div>
        <Link
          href="/super-admin/tenants/new"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Create Tenant
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/super-admin/tenants" active={!status}>
          All
        </FilterLink>
        <FilterLink
          href="/super-admin/tenants?status=ACTIVE"
          active={status === "ACTIVE"}
        >
          Active
        </FilterLink>
        <FilterLink
          href="/super-admin/tenants?status=SUSPENDED"
          active={status === "SUSPENDED"}
        >
          Suspended
        </FilterLink>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
          <CardDescription>
            {tenants.length.toLocaleString("id-ID")} tenant shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Variants</TableHead>
                <TableHead className="text-right">Domains</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length > 0 ? (
                tenants.map((tenant) => {
                  const domainCount = tenant.variants.reduce(
                    (total, variant) => total + variant._count.domains,
                    0,
                  );

                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.slug}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tenant.status === "ACTIVE"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tenant._count.variants}
                      </TableCell>
                      <TableCell className="text-right">{domainCount}</TableCell>
                      <TableCell>{dateFormatter.format(tenant.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/super-admin/tenants/${tenant.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                          )}
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tenants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: active ? "default" : "outline",
          size: "sm",
        }),
      )}
    >
      {children}
    </Link>
  );
}

function normalizeStatus(status: string | string[] | undefined) {
  const value = Array.isArray(status) ? status[0] : status;

  if (value === "ACTIVE" || value === "SUSPENDED") {
    return value;
  }

  return null;
}
