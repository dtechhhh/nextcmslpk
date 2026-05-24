import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { prisma } from "@/server/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardAccountPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.userId) {
    redirect("/dashboard/login");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      username: true,
      totpVerified: true,
      totpSecret: true,
      role: true,
    },
  });

  if (!userRecord) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="text-2xl font-semibold tracking-normal">Account Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChangePasswordForm />

        <Card className="w-full max-w-md rounded-lg">
          <CardHeader>
            <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
            <CardDescription>
              TOTP status for your account. TOTP reset must be performed by a super admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">TOTP Status</p>
                  <p className="text-xs text-muted-foreground">
                    {userRecord.totpVerified
                      ? "Two-factor authentication is enabled."
                      : "Two-factor authentication is not yet set up."}
                  </p>
                </div>
                <Badge variant={userRecord.totpVerified ? "default" : "secondary"}>
                  {userRecord.totpVerified ? "Verified" : "Not verified"}
                </Badge>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                TOTP reset is managed by the super admin. If you need to reset your TOTP, please contact your system administrator.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
