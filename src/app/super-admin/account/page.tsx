import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SuperAdminAccountSecurityForms } from "@/components/super-admin/super-admin-account-security-forms";
import { prisma } from "@/server/db/client";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function SuperAdminAccountPage() {
  const superAdmin = await requireSuperAdminPage();
  const user = await prisma.user.findUnique({
    where: {
      id: superAdmin.userId,
    },
    select: {
      username: true,
      role: true,
      totpVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Super Admin</p>
        <h1 className="text-2xl font-semibold tracking-normal">Account</h1>
      </div>

      <Card className="max-w-2xl rounded-lg">
        <CardHeader>
          <CardTitle>{user?.username ?? "Account"}</CardTitle>
          <CardDescription>
            {user ? `Created ${dateTimeFormatter.format(user.createdAt)}` : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AccountField label="Role" value={user?.role ?? "-"} />
            <AccountField
              label="TOTP"
              value={user?.totpVerified ? "Verified" : "Not verified"}
            />
            <AccountField
              label="Updated"
              value={user ? dateTimeFormatter.format(user.updatedAt) : "-"}
            />
            <div className="flex items-end">
              <Badge variant={user?.totpVerified ? "secondary" : "destructive"}>
                {user?.totpVerified ? "TOTP VERIFIED" : "TOTP REQUIRED"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <SuperAdminAccountSecurityForms />
    </>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
