import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getTenantDashboardLandingState } from "@/server/services/dashboard-account";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const dashboardState = await getTenantDashboardLandingState(session.user.userId);

  if (!dashboardState) {
    redirect("/dashboard/login");
  }

  if (dashboardState.mustChangePassword) {
    redirect("/dashboard/account/change-password");
  }

  if (dashboardState.needsTOTPSetup) {
    redirect("/dashboard/account/totp-setup");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
      <h1 className="text-3xl font-semibold tracking-normal">
        Tenant content workspace
      </h1>
    </main>
  );
}
