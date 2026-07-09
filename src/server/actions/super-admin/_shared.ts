import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/auth";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import {
  decryptTOTPSecret,
  verifyPassword,
  verifyTOTPCode,
} from "@/server/services/auth";
import {
  getClientIp,
  limitPasswordAttempt,
  limitTOTPVerifyAttempt,
} from "@/server/services/rate-limit";
import { verifySecurityStamp } from "@/server/services/security-stamp";
import { prisma } from "@/server/db/client";

const PASSWORD_RATE_LIMIT_ERROR =
  "Terlalu banyak percobaan password. Coba lagi nanti.";
const TOTP_RATE_LIMIT_ERROR = "Terlalu banyak percobaan TOTP. Coba lagi nanti.";

export const sensitiveActionCredentialsSchema = z.object({
  currentPassword: z.string().min(1, "Password super admin wajib diisi."),
  totpCode: z.string().regex(/^\d{6}$/, "Kode TOTP harus 6 digit."),
});

export type SensitiveActionCredentials = z.infer<
  typeof sensitiveActionCredentialsSchema
>;

export type ActionSuccess<T extends object = object> = {
  ok: true;
} & T;

export type ActionFailure = {
  ok: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  redirectTo?: string;
};

export type SuperAdminActionResult<T extends object = object> =
  | ActionSuccess<T>
  | ActionFailure;

export async function requireSuperAdminActionSession() {
  const session = await auth();

  if (!session?.user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Akses super admin diperlukan.");
  }

  await verifySecurityStamp(session);

  return {
    userId: session.user.userId,
  };
}

export async function getRequestIpAddress() {
  try {
    return getClientIp(await headers());
  } catch {
    return "unknown";
  }
}

export async function verifySensitiveSuperAdminAction({
  userId,
  credentials,
  ipAddress,
}: {
  userId: string;
  credentials: SensitiveActionCredentials;
  ipAddress: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      role: true,
      totpSecret: true,
      totpVerified: true,
    },
  });

  if (!user || user.role !== "SUPER_ADMIN") {
    throw new AppError("NOT_FOUND", "Super admin tidak ditemukan.", 404);
  }

  const passwordValid = await verifyPassword(
    credentials.currentPassword,
    user.passwordHash,
  );

  if (!passwordValid) {
    const rateLimit = await limitPasswordAttempt(userId);

    if (!rateLimit.success) {
      throw new AppError("RATE_LIMITED", PASSWORD_RATE_LIMIT_ERROR, 429);
    }

    throw validationError("currentPassword", "Password super admin salah.");
  }

  if (!user.totpVerified || !user.totpSecret) {
    throw validationError("totpCode", "TOTP super admin belum aktif.");
  }

  const secret = decryptTOTPSecret(user.totpSecret);

  if (!verifyTOTPCode(secret, credentials.totpCode)) {
    const rateLimit = await limitTOTPVerifyAttempt({
      ipAddress,
      username: user.username,
    });

    if (!rateLimit.success) {
      throw new AppError("RATE_LIMITED", TOTP_RATE_LIMIT_ERROR, 429);
    }

    throw validationError("totpCode", "Kode TOTP tidak valid.");
  }
}

export function toFieldErrors(error: {
  flatten: () => {
    fieldErrors: Record<string, string[] | undefined>;
  };
}): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([key, value]) => [
      key,
      value ?? [],
    ]),
  );
}

export function toActionError(error: unknown, fallback: string): ActionFailure {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      redirectTo: "/super-admin/login",
    };
  }

  if (error instanceof AppError) {
    return {
      ok: false,
      error:
        error instanceof ValidationError
          ? getFirstValidationMessage(error) ?? error.message
          : error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    ok: false,
    error: fallback,
  };
}

export function validationError(field: string, message: string) {
  return new ValidationError({
    [field]: [message],
  });
}

function getFirstValidationMessage(error: ValidationError) {
  const errors = error.details?.errors;

  if (!isValidationErrors(errors)) {
    return null;
  }

  return Object.values(errors).flat()[0] ?? null;
}

function isValidationErrors(
  value: unknown,
): value is Record<string, string[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (messages) =>
        Array.isArray(messages) &&
        messages.every((message) => typeof message === "string"),
    )
  );
}
