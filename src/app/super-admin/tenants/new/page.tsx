import Link from "next/link";

import { CreateTenantForm } from "@/components/super-admin/create-tenant-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

export default async function NewTenantPage() {
  await requireSuperAdminPage();

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Tenants</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            Create Tenant
          </h1>
        </div>
        <Link
          href="/super-admin/tenants"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to List
        </Link>
      </div>

      <CreateTenantForm />
    </>
  );
}
