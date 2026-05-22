import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { IdleTracker } from "@/components/auth/idle-tracker";
import { TenantDashboardShell } from "@/components/dashboard/tenant-dashboard-shell";
import {
  DEFAULT_DASHBOARD_VARIANT,
  getDashboardVariantFromPathname,
} from "@/lib/dashboard-routes";
import { requireTenantDashboardPage } from "@/server/services/tenant-dashboard";

export const dynamic = "force-dynamic";

const PUBLIC_DASHBOARD_ROUTES = new Set([
  "/dashboard/login",
  "/dashboard/suspended",
]);
const ONBOARDING_DASHBOARD_ROUTES = new Set([
  "/dashboard/account/change-password",
  "/dashboard/account/totp-setup",
]);

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = await getCurrentPathname();

  if (PUBLIC_DASHBOARD_ROUTES.has(pathname)) {
    return (
      <section className="min-h-full bg-background text-foreground">
        <IdleTracker callbackUrl="/dashboard/login" />
        {children}
      </section>
    );
  }

  const dashboardContext = await requireTenantDashboardPage();

  if (
    dashboardContext.mustChangePassword &&
    pathname !== "/dashboard/account/change-password"
  ) {
    redirect("/dashboard/account/change-password");
  }

  if (
    !dashboardContext.mustChangePassword &&
    dashboardContext.needsTOTPSetup &&
    pathname !== "/dashboard/account/totp-setup"
  ) {
    redirect("/dashboard/account/totp-setup");
  }

  if (ONBOARDING_DASHBOARD_ROUTES.has(pathname)) {
    return (
      <section className="min-h-full bg-background text-foreground">
        <IdleTracker callbackUrl="/dashboard/login" />
        {children}
      </section>
    );
  }

  const initialVariant =
    getDashboardVariantFromPathname(pathname) ?? DEFAULT_DASHBOARD_VARIANT;

  return (
    <section className="min-h-full bg-background text-foreground">
      <IdleTracker callbackUrl="/dashboard/login" />
      <TenantDashboardShell
        tenantName={dashboardContext.tenantName}
        username={dashboardContext.username}
        initialVariant={initialVariant}
      >
        {children}
      </TenantDashboardShell>
    </section>
  );
}

async function getCurrentPathname() {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-pathname") ||
    requestHeaders.get("next-url") ||
    requestHeaders.get("x-invoke-path") ||
    ""
  );
}
