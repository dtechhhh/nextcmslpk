import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getTenantDashboardOverviewData } from "@/server/services/tenant-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getTenantDashboardOverviewData();

  return <DashboardOverview data={data} />;
}
