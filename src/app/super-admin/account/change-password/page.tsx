import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireSuperAdminPage } from "@/server/services/super-admin";

export const dynamic = "force-dynamic";

export default async function SuperAdminChangePasswordPage() {
  await requireSuperAdminPage();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <ChangePasswordForm />
    </div>
  );
}
