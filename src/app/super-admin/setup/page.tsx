import { notFound } from "next/navigation";

import { SuperAdminSetupForm } from "@/components/auth/super-admin-setup-form";
import { prisma } from "@/server/db/client";

export const dynamic = "force-dynamic";

export default async function SuperAdminSetupPage() {
  const superAdminCount = await prisma.user.count({
    where: { role: "SUPER_ADMIN" },
  });

  if (superAdminCount > 0) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <SuperAdminSetupForm />
    </main>
  );
}
