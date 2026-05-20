import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { prisma } from "@/server/db/client";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: {
      id: true,
      isActive: true,
      role: true,
    },
  });

  if (!user?.isActive || user.role !== "TENANT_ADMIN") {
    redirect("/dashboard/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <ChangePasswordForm />
    </main>
  );
}
