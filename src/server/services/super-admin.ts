import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/server/db/client";
import { verifySecurityStamp } from "@/server/services/security-stamp";

export async function requireSuperAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/super-admin/login");
  }

  try {
    await verifySecurityStamp(session);
  } catch {
    redirect("/super-admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive || user.role !== "SUPER_ADMIN") {
    redirect("/super-admin/login");
  }

  return {
    userId: user.id,
    username: user.username,
  };
}
