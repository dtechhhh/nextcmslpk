import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { TOTPSetupForm } from "@/components/auth/totp-setup-form";
import { getTenantAdminTOTPSetupState } from "@/server/services/dashboard-account";

export default async function TOTPSetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const setupState = await getTenantAdminTOTPSetupState(session.user.userId);

  if (setupState.status === "unauthorized") {
    redirect("/dashboard/login");
  }

  if (setupState.status === "mustChangePassword") {
    redirect("/dashboard/account/change-password");
  }

  if (setupState.status === "alreadyVerified") {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <TOTPSetupForm qrCodeDataUri={setupState.qrCodeDataUri} />
    </main>
  );
}
