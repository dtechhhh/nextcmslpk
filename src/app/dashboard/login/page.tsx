import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function DashboardLoginPage() {
  const session = await auth();

  if (session?.user?.role === "TENANT_ADMIN") {
    redirect("/dashboard");
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
