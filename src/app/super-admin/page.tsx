import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/server/db/client";

export default async function SuperAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/super-admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: {
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive || user.role !== "SUPER_ADMIN") {
    redirect("/super-admin/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <p className="text-sm font-medium text-muted-foreground">Super Admin</p>
      <h1 className="text-3xl font-semibold tracking-normal">
        Tenant management console
      </h1>
    </main>
  );
}
