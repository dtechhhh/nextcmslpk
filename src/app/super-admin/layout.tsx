import { headers } from "next/headers";

import { IdleTracker } from "@/components/auth/idle-tracker";
import { CmsBusyProvider } from "@/components/cms/cms-busy-feedback";
import { SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { requireSuperAdminPage } from "@/server/services/super-admin";

const PUBLIC_SUPER_ADMIN_ROUTES = new Set([
  "/super-admin/login",
  "/super-admin/setup",
]);

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = await getCurrentPathname();

  if (PUBLIC_SUPER_ADMIN_ROUTES.has(pathname)) {
    return (
      <section className="min-h-full bg-background text-foreground">
        <CmsBusyProvider>
          <IdleTracker callbackUrl="/super-admin/login" />
          {children}
        </CmsBusyProvider>
      </section>
    );
  }

  const user = await requireSuperAdminPage();

  return (
    <section className="min-h-full bg-background text-foreground">
      <CmsBusyProvider>
        <IdleTracker callbackUrl="/super-admin/login" />
        <SuperAdminShell username={user.username}>{children}</SuperAdminShell>
      </CmsBusyProvider>
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
