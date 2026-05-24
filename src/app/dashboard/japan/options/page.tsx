import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OptionDataManager } from "@/components/dashboard/option-data-manager";
import { prisma } from "@/server/db/client";

export const dynamic = "force-dynamic";

export default async function JapanOptionsPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    redirect("/dashboard/login");
  }

  const variant = await prisma.variant.findFirst({
    where: { tenantId, key: "japan" },
    select: { id: true },
  });

  if (!variant) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Japan / Option Data</p>
          <h1 className="text-2xl font-semibold tracking-normal">Option Sets</h1>
        </div>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Japan variant not found. Please initialize variant content first.
        </div>
      </div>
    );
  }

  return <OptionDataManager variantId={variant.id} variantLabel="Japan" />;
}
