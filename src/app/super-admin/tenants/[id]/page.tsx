import { notFound } from "next/navigation";

import { TenantGeneralForm } from "@/components/super-admin/tenant-general-form";
import { Badge } from "@/components/ui/badge";
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
import { prisma } from "@/server/db/client";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type TenantDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  await requireSuperAdminPage();

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      variants: {
        orderBy: {
          key: "asc",
        },
        select: {
          id: true,
          key: true,
          label: true,
          themeKey: true,
          status: true,
          _count: {
            select: {
              domains: true,
              contentCollections: true,
              optionSets: true,
              contentPages: true,
              globalConfigs: true,
            },
          },
        },
      },
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          mediaAssets: true,
          contentPages: true,
          contentCollections: true,
          optionSets: true,
          globalConfigs: true,
        },
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const domainCount = tenant.variants.reduce(
    (total, variant) => total + variant._count.domains,
    0,
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Tenants</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-normal">{tenant.name}</h1>
          <Badge variant={tenant.status === "ACTIVE" ? "secondary" : "destructive"}>
            {tenant.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Created {dateTimeFormatter.format(tenant.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TenantGeneralForm
              tenant={{
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,
                domainCount,
              }}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Seed Summary</CardTitle>
            <CardDescription>
              Updated {dateTimeFormatter.format(tenant.updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <SeedStat label="Variants" value={tenant.variants.length} />
              <SeedStat label="Collections" value={tenant._count.contentCollections} />
              <SeedStat label="Option Sets" value={tenant._count.optionSets} />
              <SeedStat label="Pages" value={tenant._count.contentPages} />
              <SeedStat label="Global Configs" value={tenant._count.globalConfigs} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>Starter variants created for this tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Collections</TableHead>
                <TableHead className="text-right">Options</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Domains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.key}</TableCell>
                  <TableCell>{variant.label}</TableCell>
                  <TableCell>{variant.themeKey}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        variant.status === "ACTIVE" ? "secondary" : "outline"
                      }
                    >
                      {variant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {variant._count.contentCollections}
                  </TableCell>
                  <TableCell className="text-right">
                    {variant._count.optionSets}
                  </TableCell>
                  <TableCell className="text-right">
                    {variant._count.contentPages}
                  </TableCell>
                  <TableCell className="text-right">
                    {variant._count.domains}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Last 10 tenant-scoped entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.auditLogs.length > 0 ? (
                tenant.auditLogs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline">{entry.action}</Badge>
                    </TableCell>
                    <TableCell>{entry.user.username}</TableCell>
                    <TableCell>
                      {entry.targetType}
                      {entry.targetId ? (
                        <span className="ml-1 text-muted-foreground">
                          {entry.targetId.slice(0, 8)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {dateTimeFormatter.format(entry.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tenant audit entries yet.
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

function SeedStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}
