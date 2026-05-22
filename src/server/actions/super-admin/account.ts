"use server";

import { createHmac, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { AppError, ValidationError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import {
  decryptTOTPSecret,
  encryptTOTPSecret,
  generateTOTPSecret,
  hashPassword,
  safeEqual,
  verifyPassword,
  verifyTOTPCode,
} from "@/server/services/auth";
import {
  limitPasswordAttempt,
  limitTOTPVerifyAttempt,
} from "@/server/services/rate-limit";
import {
  getRequestIpAddress,
  requireSuperAdminActionSession,
  toActionError,
  toFieldErrors,
  validationError,
  type SuperAdminActionResult,
} from "@/server/actions/super-admin/_shared";

const PASSWORD_MIN_LENGTH = 12;
const RESET_TOTP_TOKEN_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RATE_LIMIT_ERROR =
  "Terlalu banyak percobaan ubah password. Coba lagi nanti.";
const TOTP_RATE_LIMIT_ERROR = "Terlalu banyak percobaan TOTP. Coba lagi nanti.";

const changeSuperAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Password baru minimal 12 karakter."),
    confirmPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Konfirmasi password minimal 12 karakter."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password baru tidak sama.",
  });

const startResetTotpSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
});

const verifyResetTotpSchema = z.object({
  resetToken: z.string().min(1),
  totpCode: z.string().regex(/^\d{6}$/, "Kode TOTP harus 6 digit."),
});

const resetTotpTokenPayloadSchema = z.object({
  userId: z.string().min(1),
  encryptedTotpSecret: z.string().min(1),
  expiresAt: z.number().int().positive(),
});

type ResetTotpTokenPayload = {
  userId: string;
  encryptedTotpSecret: string;
  expiresAt: number;
};

export async function changeSuperAdminPassword(
  input: unknown,
): Promise<SuperAdminActionResult<{ redirectTo: string }>> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = changeSuperAdminPasswordSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const rateLimit = await limitPasswordAttempt(session.userId);

    if (!rateLimit.success) {
      throw new AppError("RATE_LIMITED", PASSWORD_RATE_LIMIT_ERROR, 429);
    }

    const ipAddress = await getRequestIpAddress();
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      throw new AppError("NOT_FOUND", "Super admin tidak ditemukan.", 404);
    }

    const currentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordValid) {
      throw validationError("currentPassword", "Password saat ini salah.");
    }

    const securityStamp = randomUUID();
    const passwordHash = await hashPassword(parsed.data.newPassword);

    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            passwordHash,
            mustChangePassword: false,
            securityStamp,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: null,
            userId: user.id,
            action: "user.changePassword",
            targetType: "User",
            targetId: user.id,
            metadata: {
              username: user.username,
              role: user.role,
              securityStampUpdated: true,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin/account");
    revalidatePath("/super-admin/audit-log");

    return {
      ok: true,
      redirectTo: "/super-admin/login",
    };
  } catch (error) {
    return toActionError(error, "Password gagal diubah.");
  }
}

export async function startSuperAdminTotpReset(
  input: unknown,
): Promise<
  SuperAdminActionResult<{
    resetToken: string;
    qrCodeDataUri: string;
  }>
> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = startResetTotpSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const rateLimit = await limitPasswordAttempt(session.userId);

    if (!rateLimit.success) {
      throw new AppError("RATE_LIMITED", PASSWORD_RATE_LIMIT_ERROR, 429);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      throw new AppError("NOT_FOUND", "Super admin tidak ditemukan.", 404);
    }

    const currentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordValid) {
      throw validationError("currentPassword", "Password saat ini salah.");
    }

    const totp = await generateTOTPSecret(`Super Admin:${user.username}`);
    const encryptedTotpSecret = encryptTOTPSecret(totp.secret);

    return {
      ok: true,
      resetToken: createResetTotpToken({
        userId: user.id,
        encryptedTotpSecret,
        expiresAt: Date.now() + RESET_TOTP_TOKEN_TTL_MS,
      }),
      qrCodeDataUri: totp.qrCodeDataUri,
    };
  } catch (error) {
    return toActionError(error, "Reset TOTP gagal dimulai.");
  }
}

export async function verifySuperAdminTotpReset(
  input: unknown,
): Promise<SuperAdminActionResult<{ redirectTo: string }>> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = verifyResetTotpSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const payload = readResetTotpToken(parsed.data.resetToken);

    if (!safeEqual(payload.userId, session.userId)) {
      throw validationError("totpCode", "Kode TOTP tidak valid.");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      throw new AppError("NOT_FOUND", "Super admin tidak ditemukan.", 404);
    }

    const ipAddress = await getRequestIpAddress();
    const rateLimit = await limitTOTPVerifyAttempt({
      ipAddress,
      username: user.username,
    });

    if (!rateLimit.success) {
      throw new AppError("RATE_LIMITED", TOTP_RATE_LIMIT_ERROR, 429);
    }

    const secret = decryptTOTPSecret(payload.encryptedTotpSecret);

    if (!verifyTOTPCode(secret, parsed.data.totpCode)) {
      throw validationError("totpCode", "Kode TOTP tidak valid.");
    }

    const securityStamp = randomUUID();

    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            totpSecret: payload.encryptedTotpSecret,
            totpVerified: true,
            securityStamp,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: null,
            userId: user.id,
            action: "user.resetTotp",
            targetType: "User",
            targetId: user.id,
            metadata: {
              username: user.username,
              role: user.role,
              totpVerified: true,
              securityStampUpdated: true,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin/account");
    revalidatePath("/super-admin/audit-log");

    return {
      ok: true,
      redirectTo: "/super-admin/login",
    };
  } catch (error) {
    return toActionError(error, "Reset TOTP gagal diverifikasi.");
  }
}

function createResetTotpToken(payload: ResetTotpTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signResetTotpTokenPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function readResetTotpToken(token: string): ResetTotpTokenPayload {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw validationError("totpCode", "Reset TOTP tidak valid.");
  }

  const expectedSignature = signResetTotpTokenPayload(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    throw validationError("totpCode", "Reset TOTP tidak valid.");
  }

  const parsedPayload = resetTotpTokenPayloadSchema.safeParse(
    JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")),
  );

  if (!parsedPayload.success) {
    throw validationError("totpCode", "Reset TOTP tidak valid.");
  }

  const payload = parsedPayload.data;

  if (payload.expiresAt < Date.now()) {
    throw validationError("totpCode", "Reset TOTP sudah kedaluwarsa.");
  }

  return payload;
}

function signResetTotpTokenPayload(encodedPayload: string) {
  return createHmac("sha256", env.AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}
