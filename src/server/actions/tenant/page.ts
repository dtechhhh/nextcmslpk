"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import {
  PAGE_KEYS_INDONESIA,
  PAGE_KEYS_JAPAN,
  type PageKey,
} from "@/lib/constants";
import { AppError, AuthError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  PAGE_EDITOR_DEFINITIONS,
  type PageEditorField,
  type PageEditorDefinitionKey,
} from "@/lib/page-editor-definitions";
import {
  getContentPageSchema,
  isAllowedPageKey,
} from "@/lib/validations/pages";
import { zodErrorToFieldErrors } from "@/lib/validations/global/_shared";
import { tenantDb } from "@/server/db/tenant-scoped";
import { createAuditLog } from "@/server/services/audit";
import { signPreviewToken } from "@/server/services/preview-token";
import { verifySecurityStamp } from "@/server/services/security-stamp";
import type { VariantKey } from "@/types";

const pageKeySchema = z.enum([
  "homepage",
  "program_page",
  "job_page",
  "blog_page",
  "tentang_kami",
  "karir_page",
  "metode_pelatihan",
  "profil_kandidat",
  "jaringan_rekrutmen",
  "sector_page",
  "news_page",
  "contact",
]);

const pageLookupSchema = z.object({
  variantId: z.string().min(1),
  pageKey: pageKeySchema,
});

const pageIdSchema = z.string().min(1);

const saveDraftSchema = z.object({
  pageId: pageIdSchema,
  dataJson: z.unknown(),
});

export async function getPage(variantId: unknown, pageKey: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = pageLookupSchema.safeParse({ variantId, pageKey });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input page tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const variant = await getOwnedVariant(db, parsed.data.variantId);
    const normalizedPageKey = assertAllowedContentPageKey(
      variant.key,
      parsed.data.pageKey,
    );
    const page = await db.contentPage.findFirst({
      where: {
        variantId: variant.id,
        pageKey: normalizedPageKey,
      },
      select: {
        id: true,
        tenantId: true,
        variantId: true,
        pageKey: true,
        title: true,
        slug: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!page) {
      throw new NotFoundError("ContentPage", normalizedPageKey);
    }

    return {
      ok: true,
      page: {
        id: page.id,
        tenantId: context.tenantId,
        variantId: variant.id,
        variantKey: variant.key,
        pageKey: normalizedPageKey,
        title: page.title,
        slug: page.slug,
        status: page.status,
        dataJson: normalizePageData(page.dataJson),
        publishedDataJson: normalizeNullablePageData(page.publishedDataJson),
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Page gagal dimuat.");
  }
}

export async function saveDraft(pageId: unknown, dataJson: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = saveDraftSchema.safeParse({ pageId, dataJson });

    if (!parsed.success) {
      throw new ValidationError({
        form: ["Input draft tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const page = await getOwnedPageForMutation(db, parsed.data.pageId);
    const schema = getContentPageSchema(page.variantKey, page.pageKey);

    if (!schema) {
      throw new ValidationError({
        pageKey: ["Page key tidak tersedia untuk variant ini."],
      });
    }

    const validated = schema.safeParse(parsed.data.dataJson);

    if (!validated.success) {
      throw new ValidationError(zodErrorToFieldErrors(validated.error));
    }

    const updated = await db.contentPage.update({
      where: {
        id: page.id,
      },
      data: {
        dataJson: toPrismaJson(validated.data),
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "content.saveDraft",
      targetType: "ContentPage",
      targetId: page.id,
      metadata: {
        variantId: page.variantId,
        variantKey: page.variantKey,
        pageKey: page.pageKey,
        status: updated.status,
      },
      ipAddress: null,
    });

    return {
      ok: true,
      page: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizePageData(updated.dataJson),
        publishedDataJson: normalizeNullablePageData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Draft gagal disimpan.");
  }
}

export async function publishPage(pageId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = pageIdSchema.safeParse(pageId);

    if (!parsed.success) {
      throw new ValidationError({
        pageId: ["Page tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const page = await getOwnedPageForMutation(db, parsed.data);
    const schema = getContentPageSchema(page.variantKey, page.pageKey);

    if (!schema) {
      throw new ValidationError({
        pageKey: ["Page key tidak tersedia untuk variant ini."],
      });
    }

    const validated = schema.safeParse(page.dataJson);

    if (!validated.success) {
      throw new ValidationError(zodErrorToFieldErrors(validated.error));
    }

    const publishData = normalizePageData(validated.data);

    validatePagePublishRequirements(page.variantKey, page.pageKey, publishData);

    const publishedDataJson = toPrismaJson(publishData);
    const updated = await db.contentPage.update({
      where: {
        id: page.id,
      },
      data: {
        publishedDataJson,
        status: "PUBLISHED",
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await revalidateTag(`page:${page.variantId}:${page.pageKey}`, { expire: 0 });
    await revalidateTag(`variant:${page.variantId}`, { expire: 0 });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "content.publish",
      targetType: "ContentPage",
      targetId: page.id,
      metadata: {
        variantId: page.variantId,
        variantKey: page.variantKey,
        pageKey: page.pageKey,
        oldStatus: page.status,
        newStatus: "PUBLISHED",
      },
      ipAddress: null,
    });

    revalidatePath(getPublicPath(page.variantKey, page.pageKey));

    return {
      ok: true,
      page: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizePageData(updated.dataJson),
        publishedDataJson: normalizeNullablePageData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Page gagal dipublish.");
  }
}

export async function unpublishPage(pageId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = pageIdSchema.safeParse(pageId);

    if (!parsed.success) {
      throw new ValidationError({
        pageId: ["Page tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const page = await getOwnedPageForMutation(db, parsed.data);
    const updated = await db.contentPage.update({
      where: {
        id: page.id,
      },
      data: {
        status: "DRAFT",
        updatedBy: context.userId,
      },
      select: {
        id: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        updatedAt: true,
      },
    });

    await revalidateTag(`page:${page.variantId}:${page.pageKey}`, { expire: 0 });

    await createAuditLog({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "content.unpublish",
      targetType: "ContentPage",
      targetId: page.id,
      metadata: {
        variantId: page.variantId,
        variantKey: page.variantKey,
        pageKey: page.pageKey,
        oldStatus: page.status,
        newStatus: "DRAFT",
      },
      ipAddress: null,
    });

    revalidatePath(getPublicPath(page.variantKey, page.pageKey));

    return {
      ok: true,
      page: {
        id: updated.id,
        status: updated.status,
        dataJson: normalizePageData(updated.dataJson),
        publishedDataJson: normalizeNullablePageData(updated.publishedDataJson),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return toActionError(error, "Page gagal di-unpublish.");
  }
}

export async function generatePreviewToken(pageId: unknown) {
  try {
    const context = await requireTenantActionContext();
    const parsed = pageIdSchema.safeParse(pageId);

    if (!parsed.success) {
      throw new ValidationError({
        pageId: ["Page tidak valid."],
      });
    }

    const db = tenantDb(context.session);
    const page = await db.contentPage.findFirst({
      where: {
        id: parsed.data,
      },
      select: {
        id: true,
        tenantId: true,
        variantId: true,
        pageKey: true,
        variant: {
          select: {
            key: true,
            domains: {
              where: {
                status: "ACTIVE",
              },
              orderBy: [
                {
                  isPrimary: "desc",
                },
                {
                  createdAt: "asc",
                },
              ],
              select: {
                host: true,
              },
            },
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError("ContentPage", parsed.data);
    }

    const variantKey = toVariantKey(page.variant.key);
    const pageKey = assertAllowedContentPageKey(variantKey, toPageKey(page.pageKey));
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60;
    const token = signPreviewToken({
      iss: "nextcmslpk",
      sub: page.id,
      type: "content_page",
      tenantId: context.tenantId,
      variantId: page.variantId,
      pageKey,
      iat: issuedAt,
      exp: expiresAt,
    });
    const previewUrl = buildPreviewUrl({
      host: page.variant.domains[0]?.host,
      publicPath: getPublicPath(variantKey, pageKey),
      token,
    });

    return {
      ok: true,
      token,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      previewUrl,
    };
  } catch (error) {
    return toActionError(error, "Preview token gagal dibuat.");
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

  return {
    ...variant,
    key: toVariantKey(variant.key),
  };
}

async function getOwnedPageForMutation(
  db: ReturnType<typeof tenantDb>,
  pageId: string,
) {
  const page = await db.contentPage.findFirst({
    where: {
      id: pageId,
    },
    select: {
      id: true,
      tenantId: true,
      variantId: true,
      pageKey: true,
      status: true,
      dataJson: true,
      variant: {
        select: {
          key: true,
        },
      },
    },
  });

  if (!page) {
    throw new NotFoundError("ContentPage", pageId);
  }

  const variantKey = toVariantKey(page.variant.key);
  const pageKey = assertAllowedContentPageKey(variantKey, toPageKey(page.pageKey));

  return {
    id: page.id,
    tenantId: page.tenantId,
    variantId: page.variantId,
    variantKey,
    pageKey,
    status: page.status,
    dataJson: normalizePageData(page.dataJson),
  };
}

function assertAllowedContentPageKey(variantKey: VariantKey, pageKey: PageKey) {
  if (!isAllowedPageKey(variantKey, pageKey)) {
    throw new ValidationError({
      pageKey: ["Page key tidak tersedia untuk variant ini."],
    });
  }

  return pageKey;
}

function validatePagePublishRequirements(
  variantKey: VariantKey,
  pageKey: PageKey,
  data: Record<string, unknown>,
) {
  const definitionKey = `${variantKey}.${pageKey}` as PageEditorDefinitionKey;
  const definition = PAGE_EDITOR_DEFINITIONS[definitionKey];

  if (!definition) {
    return;
  }

  const errors: Record<string, string[]> = {};

  for (const section of definition.sections) {
    if (section.classification !== "required") {
      continue;
    }

    for (const field of section.fields) {
      collectPublishFieldErrors({
        data,
        field,
        defaultData: definition.defaultData,
        errors,
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function collectPublishFieldErrors({
  data,
  field,
  defaultData,
  errors,
}: {
  data: Record<string, unknown>;
  field: PageEditorField;
  defaultData: Record<string, unknown>;
  errors: Record<string, string[]>;
}) {
  if (field.kind === "array") {
    const items = getAtPath(data, field.path);
    const defaultItems = getAtPath(defaultData, field.path);
    const minimumItems =
      Array.isArray(defaultItems) && defaultItems.length > 0
        ? defaultItems.length
        : 1;
    const completeItems = Array.isArray(items)
      ? items.filter((item) => isPublishReadyArrayItem(item, field.fields))
      : [];

    if (completeItems.length < minimumItems) {
      errors[field.path] = [
        `${field.label} wajib berisi minimal ${minimumItems} item lengkap sebelum publish.`,
      ];
    }

    return;
  }

  if (field.kind === "string-array") {
    if (!isPublishRequiredStringArrayField(field.path)) {
      return;
    }

    const items = getAtPath(data, field.path);
    const hasItem = Array.isArray(items)
      ? items.some((item) => typeof item === "string" && item.trim() !== "")
      : false;

    if (!hasItem) {
      errors[field.path] = [
        `${field.label} wajib berisi minimal 1 item sebelum publish.`,
      ];
    }

    return;
  }

  if (!isPublishRequiredTextField(field)) {
    return;
  }

  if (!readString(getAtPath(data, field.path))) {
    errors[field.path] = [`${field.label} wajib diisi sebelum publish.`];
  }
}

function isPublishReadyArrayItem(item: unknown, fields: PageEditorField[]) {
  if (!isRecord(item)) {
    return false;
  }

  if (item.is_enabled === false) {
    return false;
  }

  const requiredFields = fields.filter(isPublishRequiredTextField);

  if (requiredFields.length === 0) {
    return true;
  }

  return requiredFields.every((field) => readString(getAtPath(item, field.path)));
}

function isPublishRequiredTextField(field: PageEditorField) {
  if (field.kind !== "text" && field.kind !== "textarea") {
    return false;
  }

  const path = field.path.toLowerCase();
  const fieldName = path.split(".").pop() ?? path;

  if (
    fieldName.endsWith("_id") ||
    path.includes("secondary_") ||
    path.includes("message_template") ||
    path.includes("_message") ||
    fieldName === "eyebrow_label" ||
    fieldName === "href" ||
    fieldName.endsWith("_href") ||
    fieldName === "map_url" ||
    fieldName === "map_embed_url" ||
    fieldName === "email_subject_template"
  ) {
    return false;
  }

  return true;
}

function isPublishRequiredStringArrayField(path: string) {
  const normalizedPath = path.toLowerCase();
  const fieldName = normalizedPath.split(".").pop() ?? normalizedPath;

  return !fieldName.endsWith("_ids") && !normalizedPath.includes("manual_");
}

function getPublicPath(variantKey: VariantKey, pageKey: PageKey) {
  const definitionKey = `${variantKey}.${pageKey}` as PageEditorDefinitionKey;
  const definition = PAGE_EDITOR_DEFINITIONS[definitionKey];

  return definition?.publicPath ?? `/${pageKey.replace(/_/g, "-")}`;
}

function buildPreviewUrl({
  host,
  publicPath,
  token,
}: {
  host?: string;
  publicPath: string;
  token: string;
}) {
  const baseUrl = host
    ? `${getPreviewProtocol(host)}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL(publicPath, baseUrl);

  url.searchParams.set("preview", "true");
  url.searchParams.set("token", token);

  return url.toString();
}

function getPreviewProtocol(host: string) {
  if (
    process.env.NODE_ENV !== "production" &&
    (host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]") ||
      host.includes(".local"))
  ) {
    return "http";
  }

  return "https";
}

function toVariantKey(value: string): VariantKey {
  if (value === "indonesia" || value === "japan") {
    return value;
  }

  throw new ForbiddenError("Variant tidak didukung.");
}

function toPageKey(value: string): PageKey {
  if (
    (PAGE_KEYS_INDONESIA as readonly string[]).includes(value) ||
    (PAGE_KEYS_JAPAN as readonly string[]).includes(value)
  ) {
    return value as PageKey;
  }

  throw new ValidationError({
    pageKey: ["Page key tidak valid."],
  });
}

function normalizePageData(value: unknown) {
  if (isRecord(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  return {};
}

function normalizeNullablePageData(value: unknown) {
  if (isRecord(value)) {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  return null;
}

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);

      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (isRecord(current)) {
      return current[segment];
    }

    return undefined;
  }, source);
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
