import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { prisma } from "@/server/db/client";

export default async function SuperAdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  const superAdminCount = await prisma.user.count({
    where: { role: "SUPER_ADMIN" },
  });

  if (superAdminCount === 0) {
    redirect("/super-admin/setup");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <LoginForm
        title="Super Admin Login"
        description="Masuk ke konsol pengelolaan tenant."
        scope="super-admin"
        redirectTo="/super-admin"
      />
    </main>
  );
}
