"use server";

import { createHmac, randomUUID } from "node:crypto";

import { headers } from "next/headers";
import { z } from "zod";

import { auth, unstable_update as updateSession } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { env } from "@/lib/env";
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
  getClientIp,
  limitLoginAttempt,
  limitPasswordAttempt,
  limitSetupAttempt,
  limitTOTPVerifyAttempt,
} from "@/server/services/rate-limit";

const GENERIC_LOGIN_ERROR = "Username atau password salah";
const LOGIN_RATE_LIMIT_ERROR = "Terlalu banyak percobaan login. Coba lagi nanti.";
const SETUP_RATE_LIMIT_ERROR = "Terlalu banyak percobaan setup. Coba lagi nanti.";
const PASSWORD_RATE_LIMIT_ERROR = "Terlalu banyak percobaan ubah password. Coba lagi nanti.";
const TOTP_RATE_LIMIT_ERROR = "Terlalu banyak percobaan TOTP. Coba lagi nanti.";
const PASSWORD_MIN_LENGTH = 12;
const SETUP_TOKEN_TTL_MS = 10 * 60 * 1000;

const loginCheckSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  scope: z.enum(["super-admin", "dashboard"]),
});

const setupStartSchema = z.object({
  setupSecret: z.string().min(1),
  username: z.string().trim().min(3),
  password: z.string().min(PASSWORD_MIN_LENGTH),
});

const setupCompleteSchema = z.object({
  setupToken: z.string().min(1),
  totpCode: z.string().regex(/^\d{6}$/),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(PASSWORD_MIN_LENGTH),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password baru tidak sama.",
  });

const verifyTotpSetupSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/),
});

const refreshActivitySchema = z.object({
  lastActivity: z.number().int().positive(),
});

type SetupTokenPayload = {
  username: string;
  passwordHash: string;
  encryptedTotpSecret: string;
  expiresAt: number;
};

export async function checkLoginCredentialsAction(input: unknown) {
  const parsed = loginCheckSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  try {
    const { username, password, scope } = parsed.data;
    const rateLimit = await limitServerActionLoginAttempt(username);

    if (!rateLimit.success) {
      return { ok: false, error: LOGIN_RATE_LIMIT_ERROR };
    }

    const expectedRole = scope === "super-admin" ? "SUPER_ADMIN" : "TENANT_ADMIN";
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        passwordHash: true,
        role: true,
        isActive: true,
        totpSecret: true,
        totpVerified: true,
        tenant: {
          select: {
            status: true,
          },
        },
      },
    });

    if (
      !user ||
      !user.isActive ||
      user.role !== expectedRole ||
      (user.role === "TENANT_ADMIN" && user.tenant?.status !== "ACTIVE") ||
      (user.totpVerified && !user.totpSecret)
    ) {
      return { ok: false, error: GENERIC_LOGIN_ERROR };
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return { ok: false, error: GENERIC_LOGIN_ERROR };
    }

    return {
      ok: true,
      requiresTotp: Boolean(user.totpVerified && user.totpSecret),
    };
  } catch {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
}

export async function startSuperAdminSetupAction(input: unknown) {
  const parsed = setupStartSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Data setup tidak valid." };
  }

  try {
    const requestHeaders = await getRequestHeaders();
    const setupRateLimit = await limitSetupAttempt(getClientIp(requestHeaders));

    if (!setupRateLimit.success) {
      return { ok: false, error: SETUP_RATE_LIMIT_ERROR };
    }

    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (superAdminCount > 0 || !safeEqual(parsed.data.setupSecret, env.SETUP_SECRET)) {
      return { ok: false, error: "Data setup tidak valid." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: parsed.data.username },
      select: { id: true },
    });

    if (existingUser) {
      return { ok: false, error: "Data setup tidak valid." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const totp = await generateTOTPSecret(`Super Admin:${parsed.data.username}`);
    const setupToken = createSetupToken({
      username: parsed.data.username,
      passwordHash,
      encryptedTotpSecret: encryptTOTPSecret(totp.secret),
      expiresAt: Date.now() + SETUP_TOKEN_TTL_MS,
    });

    return {
      ok: true,
      setupToken,
      qrCodeDataUri: totp.qrCodeDataUri,
    };
  } catch {
    return { ok: false, error: "Data setup tidak valid." };
  }
}

export async function completeSuperAdminSetupAction(input: unknown) {
  const parsed = setupCompleteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Kode TOTP tidak valid." };
  }

  try {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (superAdminCount > 0) {
      return { ok: false, error: "Setup tidak tersedia." };
    }

    const payload = readSetupToken(parsed.data.setupToken);
    const rateLimit = await limitServerActionTOTPAttempt(payload.username);

    if (!rateLimit.success) {
      return { ok: false, error: TOTP_RATE_LIMIT_ERROR };
    }

    const secret = decryptTOTPSecret(payload.encryptedTotpSecret);

    if (!verifyTOTPCode(secret, parsed.data.totpCode)) {
      return { ok: false, error: "Kode TOTP tidak valid." };
    }

    await prisma.$transaction(
      async (tx) => {
        const superAdminCount = await tx.user.count({
          where: { role: "SUPER_ADMIN" },
        });

        if (superAdminCount > 0) {
          throw new Error("Super admin setup is already locked.");
        }

        await tx.user.create({
          data: {
            username: payload.username,
            passwordHash: payload.passwordHash,
            role: "SUPER_ADMIN",
            tenantId: null,
            totpSecret: payload.encryptedTotpSecret,
            totpVerified: true,
            mustChangePassword: false,
            isActive: true,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      ok: true,
      redirectTo: "/super-admin/login",
    };
  } catch {
    return { ok: false, error: "Setup tidak tersedia." };
  }
}

export async function changePasswordAction(input: unknown) {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "Sesi tidak valid.", redirectTo: "/dashboard/login" };
  }

  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Password minimal 12 karakter dan konfirmasi harus sama." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: {
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      return { ok: false, error: "Sesi tidak valid.", redirectTo: "/dashboard/login" };
    }

    const rateLimit = await limitPasswordAttempt(session.user.userId);

    if (!rateLimit.success) {
      return { ok: false, error: PASSWORD_RATE_LIMIT_ERROR };
    }

    const currentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordValid) {
      return { ok: false, error: "Password saat ini salah." };
    }

    const securityStamp = randomUUID();

    await prisma.user.update({
      where: { id: session.user.userId },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        mustChangePassword: false,
        securityStamp,
      },
    });

    return {
      ok: true,
      redirectTo: user.role === "SUPER_ADMIN" ? "/super-admin/login" : "/dashboard/login",
    };
  } catch {
    return { ok: false, error: "Password gagal diubah." };
  }
}

export async function refreshAuthActivityAction(input: unknown) {
  const parsed = refreshActivitySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false };
  }

  try {
    const session = await auth();

    if (!session?.user) {
      return { ok: false };
    }

    await updateSession({
      lastActivity: parsed.data.lastActivity,
    } as Parameters<typeof updateSession>[0]);

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function verifyTOTPSetupAction(input: unknown) {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "Sesi tidak valid.", redirectTo: "/dashboard/login" };
  }

  const parsed = verifyTotpSetupSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "Kode TOTP tidak valid." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: {
        username: true,
        totpSecret: true,
        role: true,
      },
    });

    if (!user?.totpSecret) {
      return { ok: false, error: "Kode TOTP tidak valid." };
    }

    const secret = decryptTOTPSecret(user.totpSecret);
    const rateLimit = await limitServerActionTOTPAttempt(user.username);

    if (!rateLimit.success) {
      return { ok: false, error: TOTP_RATE_LIMIT_ERROR };
    }

    if (!verifyTOTPCode(secret, parsed.data.totpCode)) {
      return { ok: false, error: "Kode TOTP tidak valid." };
    }

    await prisma.user.update({
      where: { id: session.user.userId },
      data: {
        totpVerified: true,
        mustChangePassword: false,
      },
    });

    return {
      ok: true,
      redirectTo: user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard",
    };
  } catch {
    return { ok: false, error: "Kode TOTP tidak valid." };
  }
}

async function limitServerActionLoginAttempt(username: string) {
  const requestHeaders = await getRequestHeaders();

  return limitLoginAttempt({
    ipAddress: getClientIp(requestHeaders),
    username,
  });
}

async function limitServerActionTOTPAttempt(username: string) {
  const requestHeaders = await getRequestHeaders();

  return limitTOTPVerifyAttempt({
    ipAddress: getClientIp(requestHeaders),
    username,
  });
}

async function getRequestHeaders() {
  try {
    return await headers();
  } catch {
    return new Headers();
  }
}

function createSetupToken(payload: SetupTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signSetupTokenPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function readSetupToken(token: string): SetupTokenPayload {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid setup token.");
  }

  const expectedSignature = signSetupTokenPayload(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    throw new Error("Invalid setup token signature.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as SetupTokenPayload;

  if (payload.expiresAt < Date.now()) {
    throw new Error("Expired setup token.");
  }

  return payload;
}

function signSetupTokenPayload(encodedPayload: string) {
  return createHmac("sha256", env.AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}
