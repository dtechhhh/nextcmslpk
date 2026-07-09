import { randomUUID } from "node:crypto";

import type { Session } from "next-auth";

import { AuthError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import { safeEqual } from "@/server/services/auth";

type SecurityStampSession = Session & {
  user: Session["user"] & {
    securityStamp?: string;
  };
};

export async function verifySecurityStamp(session: SecurityStampSession | null) {
  if (!session?.user?.userId || !session.user.securityStamp) {
    throw new AuthError("Invalid session");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: {
      securityStamp: true,
      isActive: true,
      role: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  if (
    !user?.isActive ||
    (user.role === "TENANT_ADMIN" && user.tenant?.status !== "ACTIVE") ||
    !safeEqual(session.user.securityStamp, user.securityStamp)
  ) {
    throw new AuthError("Session expired");
  }

  return true;
}

export async function invalidateStamp(userId: string) {
  const securityStamp = randomUUID();

  await prisma.user.update({
    where: { id: userId },
    data: { securityStamp },
  });

  return securityStamp;
}

export async function invalidateAllTenantStamps(tenantId: string) {
  const securityStamp = randomUUID();

  const result = await prisma.user.updateMany({
    where: { tenantId },
    data: { securityStamp },
  });

  return {
    securityStamp,
    count: result.count,
  };
}
