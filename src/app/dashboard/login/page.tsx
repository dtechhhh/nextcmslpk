import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { verifySecurityStamp } from "@/server/services/security-stamp";

export const dynamic = "force-dynamic";

export default async function DashboardLoginPage() {
  const session = await auth();

  if (session?.user?.role === "TENANT_ADMIN") {
    try {
      await verifySecurityStamp(session);
      redirect("/dashboard");
    } catch {
      // Keep the user on the login form when the existing JWT was invalidated.
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <LoginForm
        title="Dashboard Login"
        description="Masuk ke workspace tenant."
        scope="dashboard"
        redirectTo="/dashboard"
      />
    </main>
  );
}
