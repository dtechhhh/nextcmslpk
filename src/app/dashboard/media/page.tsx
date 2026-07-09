import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/components/dashboard/media-library";

export const dynamic = "force-dynamic";

export default async function DashboardMediaPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    redirect("/dashboard/login");
  }

  return <MediaLibrary tenantId={tenantId} />;
}
