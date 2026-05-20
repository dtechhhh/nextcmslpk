import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { TOTPSetupForm } from "@/components/auth/totp-setup-form";
import { prisma } from "@/server/db/client";
import {
  decryptTOTPSecret,
  encryptTOTPSecret,
  generateTOTPSecret,
  getTOTPQRCodeDataUri,
} from "@/server/services/auth";

export default async function TOTPSetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dashboard/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: {
      username: true,
      role: true,
      totpSecret: true,
      totpVerified: true,
      mustChangePassword: true,
      isActive: true,
    },
  });

  if (!user?.isActive || user.role !== "TENANT_ADMIN") {
    redirect("/dashboard/login");
  }

  if (user.mustChangePassword) {
    redirect("/dashboard/account/change-password");
  }

  if (user.totpVerified && user.totpSecret) {
    redirect("/dashboard");
  }

  const qrCodeDataUri = await getOrCreateTOTPQRCode({
    userId: session.user.userId,
    username: user.username,
    encryptedSecret: user.totpSecret,
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <TOTPSetupForm qrCodeDataUri={qrCodeDataUri} />
    </main>
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
      // Fall through and rotate an unreadable pending TOTP secret.
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
