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

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function SuperAdminPage() {
  await requireSuperAdminPage();

  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    totalDomains,
    activeDomains,
    pendingDomains,
    totalMedia,
    publishedPages,
    recentActivity,
  ] = await prisma.$transaction([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "ACTIVE" } }),
    prisma.tenant.count({ where: { status: "SUSPENDED" } }),
    prisma.domain.count(),
    prisma.domain.count({ where: { status: "ACTIVE" } }),
    prisma.domain.count({ where: { status: "PENDING" } }),
    prisma.mediaAsset.count(),
    prisma.contentPage.count({ where: { status: "PUBLISHED" } }),
    prisma.auditLog.findMany({
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
    }),
  ]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="text-2xl font-semibold tracking-normal">
          Tenant management console
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={totalTenants}
          description={`${activeTenants} active, ${suspendedTenants} suspended`}
        />
        <StatCard
          title="Total Domains"
          value={totalDomains}
          description={`${activeDomains} active, ${pendingDomains} pending`}
        />
        <StatCard
          title="Total Media"
          value={totalMedia}
          description="Media files across all tenants"
        />
        <StatCard
          title="Published Pages"
          value={publishedPages}
          description="Content pages visible publicly"
        />
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 10 audit log entries</CardDescription>
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
              {recentActivity.length > 0 ? (
                recentActivity.map((entry) => (
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
                      {dateFormatter.format(entry.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No audit log entries yet.
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

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value.toLocaleString("id-ID")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
