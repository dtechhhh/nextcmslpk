"use server";

import { Prisma } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { AppError, ValidationError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import {
  getRequestIpAddress,
  requireSuperAdminActionSession,
  toActionError,
  toFieldErrors,
  validationError,
  type SuperAdminActionResult,
} from "@/server/actions/super-admin/_shared";
import { revalidateTenantManagement } from "@/server/actions/super-admin/revalidate";
import { z } from "zod";

const domainHostSchema = z
  .string()
  .trim()
  .min(1, "Host wajib diisi.")
  .transform((value) => normalizeHost(value))
  .refine((value) => isValidHost(value), "Host tidak valid.");

const createDomainSchema = z.object({
  tenantId: z.string().cuid(),
  variantId: z.string().cuid(),
  host: domainHostSchema,
});

const domainActionSchema = z.object({
  tenantId: z.string().cuid(),
  domainId: z.string().cuid(),
});

export async function createDomain(
  input: unknown,
): Promise<SuperAdminActionResult<{ domainId: string }>> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = createDomainSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    assertAllowedHost(parsed.data.host);

    const ipAddress = await getRequestIpAddress();

    const domain = await prisma.$transaction(
      async (tx) => {
        const variant = await tx.variant.findFirst({
          where: {
            id: parsed.data.variantId,
            tenantId: parsed.data.tenantId,
          },
          select: {
            id: true,
            key: true,
          },
        });

        if (!variant) {
          throw new AppError("NOT_FOUND", "Variant tidak ditemukan.", 404);
        }

        const existingDomain = await tx.domain.findUnique({
          where: {
            host: parsed.data.host,
          },
          select: {
            id: true,
          },
        });

        if (existingDomain) {
          throw validationError("host", "Host sudah digunakan.");
        }

        const created = await tx.domain.create({
          data: {
            variantId: variant.id,
            host: parsed.data.host,
            status: "PENDING",
            isPrimary: false,
          },
          select: {
            id: true,
            host: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "domain.create",
            targetType: "Domain",
            targetId: created.id,
            metadata: {
              host: created.host,
              variantKey: variant.key,
              status: "PENDING",
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

    revalidateTenantManagement(parsed.data.tenantId);

    return {
      ok: true,
      domainId: domain.id,
    };
  } catch (error) {
    return toActionError(error, "Domain gagal ditambahkan.");
  }
}

export async function verifyDomain(
  input: unknown,
): Promise<SuperAdminActionResult> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = domainActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const domain = await findTenantDomain(tx, parsed.data);

        if (domain.status === "DISABLED") {
          throw validationError(
            "domainId",
            "Domain DISABLED tidak bisa diverifikasi ulang.",
          );
        }

        const activePrimary = await tx.domain.findFirst({
          where: {
            variantId: domain.variantId,
            status: "ACTIVE",
            isPrimary: true,
          },
          select: {
            id: true,
          },
        });

        const updated = await tx.domain.update({
          where: {
            id: domain.id,
          },
          data: {
            status: "ACTIVE",
            verifiedAt: new Date(),
            isPrimary: domain.isPrimary || !activePrimary,
          },
          select: {
            id: true,
            host: true,
            status: true,
            isPrimary: true,
            verifiedAt: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "domain.verify",
            targetType: "Domain",
            targetId: updated.id,
            metadata: {
              host: updated.host,
              oldStatus: domain.status,
              newStatus: updated.status,
              isPrimary: updated.isPrimary,
              verifiedAt: updated.verifiedAt?.toISOString() ?? null,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantManagement(parsed.data.tenantId);

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Domain gagal diverifikasi.");
  }
}

export async function setPrimary(
  input: unknown,
): Promise<SuperAdminActionResult> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = domainActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const domain = await findTenantDomain(tx, parsed.data);

        if (domain.status !== "ACTIVE") {
          throw validationError("domainId", "Hanya domain ACTIVE yang bisa menjadi primary.");
        }

        await tx.domain.updateMany({
          where: {
            variantId: domain.variantId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });

        const updated = await tx.domain.update({
          where: {
            id: domain.id,
          },
          data: {
            isPrimary: true,
          },
          select: {
            id: true,
            host: true,
            isPrimary: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "domain.setPrimary",
            targetType: "Domain",
            targetId: updated.id,
            metadata: {
              host: updated.host,
              isPrimary: updated.isPrimary,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantManagement(parsed.data.tenantId);

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Primary domain gagal diubah.");
  }
}

export async function disableDomain(
  input: unknown,
): Promise<SuperAdminActionResult> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = domainActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const domain = await findTenantDomain(tx, parsed.data);

        if (domain.status !== "ACTIVE") {
          throw validationError("domainId", "Hanya domain ACTIVE yang bisa dinonaktifkan.");
        }

        const replacementPrimary = domain.isPrimary
          ? await tx.domain.findFirst({
              where: {
                variantId: domain.variantId,
                id: {
                  not: domain.id,
                },
                status: "ACTIVE",
              },
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
              },
            })
          : null;

        const updated = await tx.domain.update({
          where: {
            id: domain.id,
          },
          data: {
            status: "DISABLED",
            isPrimary: false,
          },
          select: {
            id: true,
            host: true,
            status: true,
          },
        });

        if (replacementPrimary) {
          await tx.domain.update({
            where: {
              id: replacementPrimary.id,
            },
            data: {
              isPrimary: true,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "domain.disable",
            targetType: "Domain",
            targetId: updated.id,
            metadata: {
              host: updated.host,
              oldStatus: domain.status,
              newStatus: updated.status,
              replacementPrimaryDomainId: replacementPrimary?.id ?? null,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantManagement(parsed.data.tenantId);

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Domain gagal dinonaktifkan.");
  }
}

export async function deleteDomain(
  input: unknown,
): Promise<SuperAdminActionResult> {
  try {
    const session = await requireSuperAdminActionSession();
    const parsed = domainActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const domain = await findTenantDomain(tx, parsed.data);

        if (domain.status !== "PENDING") {
          throw validationError("domainId", "Hanya domain PENDING yang bisa dihapus.");
        }

        await tx.domain.delete({
          where: {
            id: domain.id,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "domain.delete",
            targetType: "Domain",
            targetId: domain.id,
            metadata: {
              host: domain.host,
              oldStatus: domain.status,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateTenantManagement(parsed.data.tenantId);

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Domain gagal dihapus.");
  }
}

type TransactionClient = Prisma.TransactionClient;

async function findTenantDomain(
  tx: TransactionClient,
  input: {
    tenantId: string;
    domainId: string;
  },
) {
  const domain = await tx.domain.findFirst({
    where: {
      id: input.domainId,
      variant: {
        tenantId: input.tenantId,
      },
    },
    select: {
      id: true,
      variantId: true,
      host: true,
      status: true,
      isPrimary: true,
    },
  });

  if (!domain) {
    throw new AppError("NOT_FOUND", "Domain tidak ditemukan.", 404);
  }

  return domain;
}

function assertAllowedHost(host: string) {
  if (
    isSameHost(host, env.SUPER_ADMIN_DOMAIN) ||
    isSameHost(host, env.DASHBOARD_DOMAIN)
  ) {
    throw validationError(
      "host",
      "Host tidak boleh sama dengan domain admin atau dashboard.",
    );
  }
}

function normalizeHost(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}

function isValidHost(hostWithPort: string) {
  if (
    hostWithPort.includes("://") ||
    hostWithPort.includes("/") ||
    hostWithPort.includes("@") ||
    /\s/.test(hostWithPort)
  ) {
    return false;
  }

  const { hostname, port } = splitHost(hostWithPort);

  if (!hostname || hostname.length > 253) {
    return false;
  }

  if (port && (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    return false;
  }

  if (hostname === "localhost") {
    return true;
  }

  const labels = hostname.split(".");

  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9-]+$/.test(label) &&
      !label.startsWith("-") &&
      !label.endsWith("-"),
  );
}

function splitHost(hostWithPort: string) {
  const [hostname, port, ...rest] = hostWithPort.split(":");

  if (rest.length > 0) {
    return {
      hostname: "",
      port: "",
    };
  }

  return {
    hostname,
    port: port ?? "",
  };
}

function isSameHost(a: string, b: string) {
  const left = splitHost(normalizeHost(a));
  const right = splitHost(normalizeHost(b));

  return (
    `${left.hostname}:${left.port}` === `${right.hostname}:${right.port}` ||
    left.hostname === right.hostname
  );
}
