"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { CONFIG_KEYS_INDONESIA, CONFIG_KEYS_JAPAN, type ConfigKey } from "@/lib/constants";
import { AppError, AuthError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  getGlobalConfigSchema,
  isAllowedGlobalConfigKey,
} from "@/lib/validations/global";
import { zodErrorToFieldErrors } from "@/lib/validations/global/_shared";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import { verifySecurityStamp } from "@/server/services/security-stamp";
import type { VariantKey } from "@/types";

const globalConfigKeySchema = z.enum([
  "brand_header",
  "whatsapp_contact",
  "line_business_contact",
  "footer",
]);

const globalConfigLookupSchema = z.object({
  variantId: z.string().min(1),
  configKey: globalConfigKeySchema,
});

const updateGlobalConfigSchema = globalConfigLookupSchema.extend({
  dataJson: z.unknown(),
});

type GlobalConfigKey = z.infer<typeof globalConfigKeySchema>;

export async function getGlobalConfig(variantId: unknown, configKey: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = globalConfigLookupSchema.safeParse({ variantId, configKey });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input global config tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const normalizedConfigKey = assertAllowedConfigKey(
      variant.key,
      parsed.data.configKey,
    );
    const config = await ensureGlobalConfig(db, {
      tenantId: context.tenantId,
      variantId: variant.id,
      configKey: normalizedConfigKey,
    });

    return {
      ok: true,
      config: {
        id: config.id,
        tenantId: context.tenantId,
        variantId: variant.id,
        variantKey: variant.key,
        configKey: normalizedConfigKey,
        dataJson: normalizeConfigData(config.dataJson),
        updatedAt: config.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Global config gagal dimuat.");
  }
}

export async function updateGlobalConfig(
  variantId: unknown,
  configKey: unknown,
  dataJson: unknown,
) {
  try {
    const context = await requireTenantActionContext();
    const parsed = updateGlobalConfigSchema.safeParse({
      variantId,
      configKey,
      dataJson,
    });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input global config tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const normalizedConfigKey = assertAllowedConfigKey(
      variant.key,
      parsed.data.configKey,
    );
    const validationSchema = getGlobalConfigSchema(variant.key, normalizedConfigKey);

    if (!validationSchema) {
      throw new ValidationError({
        configKey: ["Config key tidak tersedia untuk variant ini."],
      });
    }

    const validated = validationSchema.safeParse(parsed.data.dataJson);

    if (!validated.success) {
      throw new ValidationError(zodErrorToFieldErrors(validated.error));
    }

    const existingConfig = await ensureGlobalConfig(db, {
      tenantId: context.tenantId,
      variantId: variant.id,
      configKey: normalizedConfigKey,
    });
    const updatedConfig = await db.variantGlobalConfig.update({
      where: {
        id: existingConfig.id,
      },
      data: {
        dataJson: toPrismaJson(validated.data),
        updatedBy: context.userId,
      },
      select: {
        id: true,
        dataJson: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "config.update",
      targetType: "VariantGlobalConfig",
      targetId: updatedConfig.id,
      metadata: {
        variantId: variant.id,
        variantKey: variant.key,
        configKey: normalizedConfigKey,
      },
      ipAddress: null,
    });

    return {
      ok: true,
      config: {
        id: updatedConfig.id,
        variantId: variant.id,
        variantKey: variant.key,
        configKey: normalizedConfigKey,
        dataJson: normalizeConfigData(updatedConfig.dataJson),
        updatedAt: updatedConfig.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Global config gagal disimpan.");
  }
}

async function requireTenantActionContext() {
  const session = await auth();
  const user = session?.user;

  if (!session || !user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (user.role !== "TENANT_ADMIN" || !user.tenantId) {
    throw new ForbiddenError("Akses tenant diperlukan.");
  }

  await verifySecurityStamp(session);

  return {
    session,
    userId: user.userId,
    tenantId: user.tenantId,
  };
}

async function getOwnedVariant(
  db: ReturnType<typeof tenantDb>,
  variantId: string,
) {
  const variant = await db.variant.findFirst({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      key: true,
      label: true,
    },
  });

  if (!variant) {
    throw new NotFoundError("Variant", variantId);
  }

  const variantKey = toVariantKey(variant.key);

  return {
    ...variant,
    key: variantKey,
  };
}

async function ensureGlobalConfig(
  db: ReturnType<typeof tenantDb>,
  input: {
    tenantId: string;
    variantId: string;
    configKey: ConfigKey;
  },
) {
  const existing = await db.variantGlobalConfig.findFirst({
    where: {
      variantId: input.variantId,
      configKey: input.configKey,
    },
    select: {
      id: true,
      dataJson: true,
      updatedAt: true,
    },
  });

  if (existing) {
    return existing;
  }

  return db.variantGlobalConfig.create({
    data: {
      tenantId: input.tenantId,
      variantId: input.variantId,
      configKey: input.configKey,
      dataJson: {},
    },
    select: {
      id: true,
      dataJson: true,
      updatedAt: true,
    },
  });
}

function assertAllowedConfigKey(
  variantKey: VariantKey,
  configKey: GlobalConfigKey,
) {
  if (!isKnownConfigKey(configKey) || !isAllowedGlobalConfigKey(variantKey, configKey)) {
    throw new ValidationError({
      configKey: ["Config key tidak tersedia untuk variant ini."],
    });
  }

  return configKey;
}

function isKnownConfigKey(value: GlobalConfigKey): value is ConfigKey {
  return (
    (CONFIG_KEYS_INDONESIA as readonly string[]).includes(value) ||
    (CONFIG_KEYS_JAPAN as readonly string[]).includes(value)
  );
}

function toVariantKey(value: string): VariantKey {
  if (value === "indonesia" || value === "japan") {
    return value;
  }

  throw new ForbiddenError("Variant tidak didukung.");
}

function normalizeConfigData(value: unknown) {
  if (isRecord(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  return {};
}

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toActionError(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      redirectTo: "/dashboard/login",
    };
  }

  if (error instanceof AppError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    ok: false,
    error: fallback,
  };
}
