import { prisma } from "@/server/db/client";
import {
  decryptTOTPSecret,
  encryptTOTPSecret,
  generateTOTPSecret,
  getTOTPQRCodeDataUri,
} from "@/server/services/auth";

type TenantAdminUser = {
  role: string;
  isActive: boolean;
  tenant: {
    status: string;
  } | null;
};

export async function getTenantDashboardLandingState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mustChangePassword: true,
      totpSecret: true,
      totpVerified: true,
      role: true,
      isActive: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!isActiveTenantAdmin(user)) {
    return null;
  }

  return {
    mustChangePassword: user.mustChangePassword,
    needsTOTPSetup: !user.totpVerified || !user.totpSecret,
  };
}

export async function canAccessTenantDashboardAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isActive: true,
      role: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  return isActiveTenantAdmin(user);
}

export async function getTenantAdminTOTPSetupState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      role: true,
      totpSecret: true,
      totpVerified: true,
      mustChangePassword: true,
      isActive: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!isActiveTenantAdmin(user)) {
    return { status: "unauthorized" } as const;
  }

  if (user.mustChangePassword) {
    return { status: "mustChangePassword" } as const;
  }

  if (user.totpVerified && user.totpSecret) {
    return { status: "alreadyVerified" } as const;
  }

  return {
    status: "ready",
    qrCodeDataUri: await getOrCreateTOTPQRCode({
      userId,
      username: user.username,
      encryptedSecret: user.totpSecret,
    }),
  } as const;
}

export async function getTenantDashboardAccountState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      totpVerified: true,
      totpSecret: true,
      role: true,
      isActive: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!isActiveTenantAdmin(user)) {
    return null;
  }

  return {
    username: user.username,
    totpVerified: user.totpVerified,
    hasTotpSecret: Boolean(user.totpSecret),
  };
}

function isActiveTenantAdmin<T extends TenantAdminUser>(user: T | null): user is T {
  return (
    Boolean(user?.isActive) &&
    user?.role === "TENANT_ADMIN" &&
    user.tenant?.status === "ACTIVE"
  );
}

async function getOrCreateTOTPQRCode({
  userId,
  username,
  encryptedSecret,
}: {
  userId: string;
  username: string;
  encryptedSecret: string | null;
}) {
  if (encryptedSecret) {
    try {
      const secret = decryptTOTPSecret(encryptedSecret);

      return getTOTPQRCodeDataUri(secret, `Tenant Admin:${username}`);
    } catch {
      // Rotate unreadable pending TOTP secrets so setup can continue.
    }
  }

  const generated = await generateTOTPSecret(`Tenant Admin:${username}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret: encryptTOTPSecret(generated.secret),
      totpVerified: false,
    },
  });

  return generated.qrCodeDataUri;
}
