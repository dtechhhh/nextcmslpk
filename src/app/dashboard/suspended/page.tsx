import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getTenantDashboardSuspendedPageData } from "@/server/services/tenant-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardSuspendedPage() {
  const data = await getTenantDashboardSuspendedPageData();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Dashboard access suspended
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          {data.tenantName} sedang disuspend
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Akses dashboard tenant ini sementara dinonaktifkan. Hubungi super
          admin untuk mengaktifkan kembali tenant.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Kembali ke login
          </Link>
        </div>
      </section>
    </main>
  );
}
