"use server";

import { randomBytes, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { AppError, ValidationError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import {
  encryptTOTPSecret,
  generateTOTPSecret,
  hashPassword,
} from "@/server/services/auth";
import {
  getRequestIpAddress,
  requireSuperAdminActionSession,
  toActionError,
  toFieldErrors,
  validationError,
  type SuperAdminActionResult,
} from "@/server/actions/super-admin/_shared";

const usernamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,62}[a-zA-Z0-9]$/;

const createTenantAdminSchema = z.object({
  tenantId: z.string().cuid(),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(64, "Username maksimal 64 karakter.")
    .regex(
      usernamePattern,
      "Username hanya boleh huruf, angka, titik, underscore, dan dash.",
    ),
});

const tenantAdminActionSchema = z.object({
  tenantId: z.string().cuid(),
  userId: z.string().cuid(),
});

export async function createTenantAdmin(
  input: unknown,
): Promise<
  SuperAdminActionResult<{
    userId: string;
    temporaryPassword: string;
    qrCodeDataUri: string;
    otpauthUrl: string;
  }>
> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = createTenantAdminSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();
    const temporaryPassword = generateTemporaryPassword();
    const totp = await generateTOTPSecret(`Tenant Admin:${parsed.data.username}`);
    const passwordHash = await hashPassword(temporaryPassword);
    const encryptedTotpSecret = encryptTOTPSecret(totp.secret);

    const user = await prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.findUnique({
          where: {
            id: parsed.data.tenantId,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (!tenant) {
          throw new AppError("NOT_FOUND", "Tenant tidak ditemukan.", 404);
        }

        const [existingTenantAdmin, existingUsername] = await Promise.all([
          tx.user.findFirst({
            where: {
              tenantId: tenant.id,
              role: "TENANT_ADMIN",
            },
            select: {
              id: true,
            },
          }),
          tx.user.findUnique({
            where: {
              username: parsed.data.username,
            },
            select: {
              id: true,
            },
          }),
        ]);

        if (existingTenantAdmin) {
          throw validationError(
            "tenantId",
            "MVP hanya mendukung 1 tenant admin per tenant.",
          );
        }

        if (existingUsername) {
          throw validationError("username", "Username sudah digunakan.");
        }

        const created = await tx.user.create({
          data: {
            tenantId: tenant.id,
            username: parsed.data.username,
            passwordHash,
            role: "TENANT_ADMIN",
            totpSecret: encryptedTotpSecret,
            totpVerified: false,
            mustChangePassword: true,
            securityStamp: randomUUID(),
            isActive: true,
          },
          select: {
            id: true,
            username: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            userId: session.userId,
            action: "user.createTenantAdmin",
            targetType: "User",
            targetId: created.id,
            metadata: {
              username: created.username,
              role: "TENANT_ADMIN",
              tenantName: tenant.name,
            },
            ipAddress,
          },
        });

        return created;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantUserPaths(parsed.data.tenantId);

    return {
      ok: true,
      userId: user.id,
      temporaryPassword,
      qrCodeDataUri: totp.qrCodeDataUri,
      otpauthUrl: totp.otpauthUrl,
    };
  } catch (error) {
    return toActionError(error, "Tenant admin gagal dibuat.");
  }
}

export async function resetPassword(
  input: unknown,
): Promise<SuperAdminActionResult<{ temporaryPassword: string }>> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = tenantAdminActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const securityStamp = randomUUID();

    await prisma.$transaction(
      async (tx) => {
        const user = await findTenantAdminUser(tx, parsed.data);

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            passwordHash,
            mustChangePassword: true,
            securityStamp,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "user.resetPassword",
            targetType: "User",
            targetId: user.id,
            metadata: {
              username: user.username,
              mustChangePassword: true,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantUserPaths(parsed.data.tenantId);

    return {
      ok: true,
      temporaryPassword,
    };
  } catch (error) {
    return toActionError(error, "Password tenant admin gagal direset.");
  }
}

export async function resetTotp(
  input: unknown,
): Promise<
  SuperAdminActionResult<{
    qrCodeDataUri: string;
    otpauthUrl: string;
  }>
> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = tenantAdminActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();
    const user = await prisma.user.findFirst({
      where: {
        id: parsed.data.userId,
        tenantId: parsed.data.tenantId,
        role: "TENANT_ADMIN",
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", "Tenant admin tidak ditemukan.", 404);
    }

    const totp = await generateTOTPSecret(`Tenant Admin:${user.username}`);
    const encryptedTotpSecret = encryptTOTPSecret(totp.secret);
    const securityStamp = randomUUID();

    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            totpSecret: encryptedTotpSecret,
            totpVerified: false,
            securityStamp,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "user.resetTotp",
            targetType: "User",
            targetId: user.id,
            metadata: {
              username: user.username,
              totpVerified: false,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantUserPaths(parsed.data.tenantId);

    return {
      ok: true,
      qrCodeDataUri: totp.qrCodeDataUri,
      otpauthUrl: totp.otpauthUrl,
    };
  } catch (error) {
    return toActionError(error, "TOTP tenant admin gagal direset.");
  }
}

export async function toggleActive(
  input: unknown,
): Promise<SuperAdminActionResult<{ isActive: boolean }>> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = tenantAdminActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();
    const updated = await prisma.$transaction(
      async (tx) => {
        const user = await findTenantAdminUser(tx, parsed.data);
        const nextActive = !user.isActive;

        const result = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            isActive: nextActive,
            securityStamp: randomUUID(),
          },
          select: {
            id: true,
            username: true,
            isActive: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: nextActive ? "user.activate" : "user.deactivate",
            targetType: "User",
            targetId: user.id,
            metadata: {
              username: user.username,
              oldIsActive: user.isActive,
              newIsActive: nextActive,
            },
            ipAddress,
          },
        });

        return result;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantUserPaths(parsed.data.tenantId);

    return {
      ok: true,
      isActive: updated.isActive,
    };
  } catch (error) {
    return toActionError(error, "Status tenant admin gagal diubah.");
  }
}

type TransactionClient = Prisma.TransactionClient;

async function findTenantAdminUser(
  tx: TransactionClient,
  input: {
    tenantId: string;
    userId: string;
  },
) {
  const user = await tx.user.findFirst({
    where: {
      id: input.userId,
      tenantId: input.tenantId,
      role: "TENANT_ADMIN",
    },
    select: {
      id: true,
      username: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "Tenant admin tidak ditemukan.", 404);
  }

  return user;
}

function generateTemporaryPassword() {
  return randomBytes(18).toString("base64url");
}

function revalidateTenantUserPaths(tenantId: string) {
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/tenants");
  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath("/dashboard");
}
