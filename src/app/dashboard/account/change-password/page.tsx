import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { canAccessTenantDashboardAccount } from "@/server/services/dashboard-account";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const canAccessAccount = await canAccessTenantDashboardAccount(session.user.userId);

  if (!canAccessAccount) {
    redirect("/dashboard/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <ChangePasswordForm />
    </main>
  );
}
