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

export default async function AuditLogPage() {
  await requireSuperAdminPage();

  const auditLogs = await prisma.auditLog.findMany({
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
      tenant: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Super Admin</p>
        <h1 className="text-2xl font-semibold tracking-normal">Audit Log</h1>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Global Audit Log</CardTitle>
          <CardDescription>Newest 50 entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length > 0 ? (
                auditLogs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {dateTimeFormatter.format(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.action}</Badge>
                    </TableCell>
                    <TableCell>{entry.user.username}</TableCell>
                    <TableCell>
                      {entry.tenant
                        ? `${entry.tenant.name} (${entry.tenant.slug})`
                        : "Global"}
                    </TableCell>
                    <TableCell>
                      {entry.targetType}
                      {entry.targetId ? (
                        <span className="ml-1 text-muted-foreground">
                          {entry.targetId.slice(0, 8)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">
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

function previewMetadata(metadata: unknown) {
  if (!metadata) {
    return "-";
  }

  return JSON.stringify(metadata);
}
