import { redirect } from "next/navigation";

import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

export default async function SuperAdminChangePasswordPage() {
  await requireSuperAdminPage();

  redirect("/super-admin/account");
}
