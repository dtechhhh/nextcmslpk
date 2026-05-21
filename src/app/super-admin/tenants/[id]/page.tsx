import { notFound } from "next/navigation";

import { TenantAdminTab } from "@/components/super-admin/tenant-admin-tab";
import { TenantAuditLogTab } from "@/components/super-admin/tenant-audit-log-tab";
import { TenantDomainsTab } from "@/components/super-admin/tenant-domains-tab";
import { TenantGeneralForm } from "@/components/super-admin/tenant-general-form";
import { TenantVariantsTab } from "@/components/super-admin/tenant-variants-tab";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
          domains: {
            orderBy: {
              host: "asc",
            },
            select: {
              id: true,
              host: true,
              status: true,
              isPrimary: true,
              verifiedAt: true,
            },
          },
        },
      },
      users: {
        where: {
          role: "TENANT_ADMIN",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          username: true,
          isActive: true,
          totpVerified: true,
          mustChangePassword: true,
        },
      },
      auditLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
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
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const domainCount = tenant.variants.reduce(
    (total, variant) => total + variant.domains.length,
    0,
  );
  const domains = tenant.variants.flatMap((variant) =>
    variant.domains.map((domain) => ({
      ...domain,
      variantKey: variant.key,
      verifiedAt: domain.verifiedAt?.toISOString() ?? null,
    })),
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

      <Tabs defaultValue="general" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="tenant-admin">Tenant Admin</TabsTrigger>
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Created and updated timestamps</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <TenantGeneralForm
                tenant={{
                  id: tenant.id,
                  name: tenant.name,
                  slug: tenant.slug,
                  status: tenant.status,
                  domainCount,
                }}
              />
              <div className="grid content-start gap-3 text-sm">
                <MetaRow
                  label="Created at"
                  value={dateTimeFormatter.format(tenant.createdAt)}
                />
                <MetaRow
                  label="Updated at"
                  value={dateTimeFormatter.format(tenant.updatedAt)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Theme starter tersedia untuk MVP.</CardDescription>
            </CardHeader>
            <CardContent>
              <TenantVariantsTab tenantId={tenant.id} variants={tenant.variants} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Domains</CardTitle>
              <CardDescription>PENDING ke ACTIVE ke DISABLED.</CardDescription>
            </CardHeader>
            <CardContent>
              <TenantDomainsTab
                tenantId={tenant.id}
                variants={tenant.variants.map((variant) => ({
                  id: variant.id,
                  key: variant.key,
                  label: variant.label,
                }))}
                domains={domains}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant-admin">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Tenant Admin</CardTitle>
              <CardDescription>Max 1 admin per tenant di MVP.</CardDescription>
            </CardHeader>
            <CardContent>
              <TenantAdminTab tenantId={tenant.id} admins={tenant.users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-log">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Last 50 entries untuk tenant ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <TenantAuditLogTab
                entries={tenant.auditLogs.map((entry) => ({
                  id: entry.id,
                  action: entry.action,
                  targetType: entry.targetType,
                  targetId: entry.targetId,
                  metadata: entry.metadata,
                  createdAt: entry.createdAt.toISOString(),
                  username: entry.user.username,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
