"use server";

import { randomUUID } from "node:crypto";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import {
  COLLECTIONS_INDONESIA,
  COLLECTIONS_JAPAN,
  CONFIG_KEYS_INDONESIA,
  CONFIG_KEYS_JAPAN,
  PAGE_KEYS_INDONESIA,
  PAGE_KEYS_JAPAN,
} from "@/lib/constants";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slugify";
import { prisma } from "@/server/db/client";
import { getClientIp } from "@/server/services/rate-limit";
import { verifySecurityStamp } from "@/server/services/security-stamp";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createTenantSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan dash."),
});

const updateTenantSchema = createTenantSchema.extend({
  id: z.string().cuid(),
});

const tenantIdSchema = z.union([
  z.string().cuid().transform((id) => ({ id })),
  z.object({
    id: z.string().cuid(),
  }),
]);

const tenantSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(slugPattern),
  excludeTenantId: z.string().cuid().optional(),
});

const variantActionSchema = z.object({
  tenantId: z.string().cuid(),
  variantId: z.string().cuid(),
});

const changeVariantThemeSchema = variantActionSchema.extend({
  themeKey: z.literal("starter"),
});

const variantSeeds = [
  {
    key: "indonesia",
    label: "Variant Indonesia",
    collections: COLLECTIONS_INDONESIA,
    pageKeys: PAGE_KEYS_INDONESIA,
    configKeys: CONFIG_KEYS_INDONESIA,
    optionSets: [
      optionSet("program_type", "Program Type", [
        "Magang",
        "Tokutei Ginou",
        "Gijinkoku",
        "Kelas Bahasa",
      ]),
      optionSet("gender", "Gender", [
        "Laki-laki",
        "Perempuan",
        "Laki-laki & Perempuan",
      ]),
      optionSet("education_level", "Education Level", ["SMA/SMK", "D3", "S1"]),
      optionSet("language_level", "Language Level", ["N5", "N4", "N3", "N2", "N1"]),
      optionSet("job_type", "Job Type", ["Full-time", "Part-time", "Kontrak"]),
      optionSet("job_field", "Job Field", [
        "Manufaktur",
        "Konstruksi",
        "Pertanian",
        "Perikanan",
        "Makanan",
        "Perhotelan",
        "Perawatan",
      ]),
      optionSet("blog_category", "Blog Category", [
        "Tips",
        "Pengalaman",
        "Berita",
        "Edukasi",
      ]),
      optionSet("blog_tag", "Blog Tag", []),
      optionSet("offer_type", "Offer Type", [
        "Promo",
        "Event",
        "Kelas Gratis",
        "Paket Kelas",
      ]),
      optionSet("target_audience", "Target Audience", [
        "Umum",
        "Pelajar",
        "Fresh Graduate",
        "Eks Jepang",
      ]),
      optionSet("career_department", "Career Department", []),
      optionSet("career_employment_type", "Career Employment Type", [
        "Full-time",
        "Part-time",
        "Magang",
      ]),
      optionSet("career_work_arrangement", "Career Work Arrangement", [
        "On-site",
        "Hybrid",
        "Remote",
      ]),
    ],
  },
  {
    key: "japan",
    label: "Variant Jepang",
    collections: COLLECTIONS_JAPAN,
    pageKeys: PAGE_KEYS_JAPAN,
    configKeys: CONFIG_KEYS_JAPAN,
    optionSets: [
      optionSet("japan_news_category", "Japan News Category", [
        { value: "news", label: "ニュース" },
        { value: "event", label: "イベント" },
        { value: "notice", label: "お知らせ" },
        { value: "partner-visit", label: "パートナー訪問" },
        { value: "training-activity", label: "研修活動" },
        { value: "candidate-dispatch", label: "候補者派遣" },
      ]),
      optionSet("japan_news_tag", "Japan News Tag", []),
      optionSet("japan_sector_category", "Japan Sector Category", [
        { value: "manufacturing", label: "製造業" },
        { value: "construction", label: "建設業" },
        { value: "agriculture", label: "農業" },
        { value: "caregiving", label: "介護" },
        { value: "food-processing", label: "食品加工" },
        { value: "restaurant", label: "外食業" },
        { value: "accommodation", label: "宿泊業" },
      ]),
      optionSet("japan_candidate_pathway", "Japan Candidate Pathway", [
        { value: "technical-intern-training", label: "技能実習" },
        { value: "specified-skilled-worker", label: "特定技能" },
        {
          value: "engineer-humanities-international-services",
          label: "技術・人文知識・国際業務",
        },
      ]),
      optionSet("japan_language_support", "Japan Language Support", [
        { value: "japanese", label: "日本語" },
        { value: "english", label: "English" },
        { value: "bahasa-indonesia", label: "Bahasa Indonesia" },
      ]),
    ],
  },
] as const;

type OptionValueSeed = {
  value: string;
  label: string;
};

type ActionSuccess<T extends object = object> = {
  ok: true;
} & T;

type ActionFailure = {
  ok: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  redirectTo?: string;
};

type TenantActionResult<T extends object = object> =
  | ActionSuccess<T>
  | ActionFailure;

export async function checkTenantSlugAvailability(
  input: unknown,
): Promise<TenantActionResult<{ available: boolean }>> {
  try {
    await requireSuperAdminSession();

    const parsed = tenantSlugSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        slug: ["Slug tidak valid."],
      });
    }

    const existing = await prisma.tenant.findFirst({
      where: {
        slug: parsed.data.slug,
        id: parsed.data.excludeTenantId
          ? {
              not: parsed.data.excludeTenantId,
            }
          : undefined,
      },
      select: {
        id: true,
      },
    });

    return {
      ok: true,
      available: !existing,
    };
  } catch (error) {
    return toActionError(error, "Slug gagal dicek.");
  }
}

export async function createTenant(
  input: unknown,
): Promise<TenantActionResult<{ tenantId: string; redirectTo: string }>> {
  try {
    const session = await requireSuperAdminSession();
    const parsed = createTenantSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    const tenant = await prisma.$transaction(
      async (tx) => {
        const existingSlug = await tx.tenant.findUnique({
          where: {
            slug: parsed.data.slug,
          },
          select: {
            id: true,
          },
        });

        if (existingSlug) {
          throw new ValidationError({
            slug: ["Slug sudah digunakan."],
          });
        }

        const createdTenant = await tx.tenant.create({
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug,
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        for (const seed of variantSeeds) {
          const variant = await tx.variant.create({
            data: {
              tenantId: createdTenant.id,
              key: seed.key,
              label: seed.label,
              themeKey: "starter",
              status: "ACTIVE",
            },
            select: {
              id: true,
            },
          });

          await tx.contentCollection.createMany({
            data: seed.collections.map((collection) => ({
              tenantId: createdTenant.id,
              variantId: variant.id,
              key: collection.key,
              label: collection.label,
            })),
          });

          for (const optionSetSeed of seed.optionSets) {
            const createdOptionSet = await tx.optionSet.create({
              data: {
                tenantId: createdTenant.id,
                variantId: variant.id,
                key: optionSetSeed.key,
                label: optionSetSeed.label,
              },
              select: {
                id: true,
              },
            });

            if (optionSetSeed.values.length > 0) {
              await tx.optionValue.createMany({
                data: optionSetSeed.values.map((value, index) => ({
                  optionSetId: createdOptionSet.id,
                  value: value.value,
                  label: value.label,
                  sortOrder: index,
                  isActive: true,
                })),
              });
            }
          }

          await tx.contentPage.createMany({
            data: seed.pageKeys.map((pageKey) => ({
              tenantId: createdTenant.id,
              variantId: variant.id,
              pageKey,
              title: titleFromKey(pageKey),
              slug: pageKey.replace(/_/g, "-"),
              status: "DRAFT",
              dataJson: {},
              publishedDataJson: Prisma.JsonNull,
            })),
          });

          await tx.variantGlobalConfig.createMany({
            data: seed.configKeys.map((configKey) => ({
              tenantId: createdTenant.id,
              variantId: variant.id,
              configKey,
              dataJson: {},
            })),
          });
        }

        await tx.auditLog.create({
          data: {
            tenantId: createdTenant.id,
            userId: session.userId,
            action: "tenant.create",
            targetType: "Tenant",
            targetId: createdTenant.id,
            metadata: {
              name: createdTenant.name,
              slug: createdTenant.slug,
              variants: variantSeeds.map((seed) => seed.key),
            },
            ipAddress,
          },
        });

        return createdTenant;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/tenants");

    return {
      ok: true,
      tenantId: tenant.id,
      redirectTo: `/super-admin/tenants/${tenant.id}`,
    };
  } catch (error) {
    return toActionError(error, "Tenant gagal dibuat.");
  }
}

export async function updateTenant(input: unknown): Promise<TenantActionResult> {
  try {
    const session = await requireSuperAdminSession();
    const parsed = updateTenantSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const existing = await tx.tenant.findUnique({
          where: {
            id: parsed.data.id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        if (!existing) {
          throw new AppError("NOT_FOUND", "Tenant tidak ditemukan.", 404);
        }

        if (existing.slug !== parsed.data.slug) {
          const [slugOwner, domainCount] = await Promise.all([
            tx.tenant.findUnique({
              where: {
                slug: parsed.data.slug,
              },
              select: {
                id: true,
              },
            }),
            tx.domain.count({
              where: {
                variant: {
                  tenantId: parsed.data.id,
                },
              },
            }),
          ]);

          if (slugOwner && slugOwner.id !== parsed.data.id) {
            throw new ValidationError({
              slug: ["Slug sudah digunakan."],
            });
          }

          if (domainCount > 0) {
            throw new ValidationError({
              slug: ["Slug tidak bisa diubah setelah domain ditambahkan."],
            });
          }
        }

        const updated = await tx.tenant.update({
          where: {
            id: parsed.data.id,
          },
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: updated.id,
            userId: session.userId,
            action: "tenant.update",
            targetType: "Tenant",
            targetId: updated.id,
            metadata: {
              oldName: existing.name,
              newName: updated.name,
              oldSlug: existing.slug,
              newSlug: updated.slug,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/tenants");
    revalidatePath(`/super-admin/tenants/${parsed.data.id}`);
    revalidatePath("/site");

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Tenant gagal diperbarui.");
  }
}

export async function suspendTenant(input: unknown): Promise<TenantActionResult> {
  return setTenantStatus(input, "SUSPENDED", "tenant.suspend");
}

export async function activateTenant(input: unknown): Promise<TenantActionResult> {
  return setTenantStatus(input, "ACTIVE", "tenant.activate");
}

export async function toggleVariantStatus(
  input: unknown,
): Promise<TenantActionResult<{ status: "ACTIVE" | "DISABLED" }>> {
  try {
    const session = await requireSuperAdminSession();
    const parsed = variantActionSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    const updated = await prisma.$transaction(
      async (tx) => {
        const variant = await tx.variant.findFirst({
          where: {
            id: parsed.data.variantId,
            tenantId: parsed.data.tenantId,
          },
          select: {
            id: true,
            key: true,
            status: true,
          },
        });

        if (!variant) {
          throw new AppError("NOT_FOUND", "Variant tidak ditemukan.", 404);
        }

        const nextStatus = variant.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

        const result = await tx.variant.update({
          where: {
            id: variant.id,
          },
          data: {
            status: nextStatus,
          },
          select: {
            id: true,
            key: true,
            status: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: nextStatus === "ACTIVE" ? "variant.activate" : "variant.disable",
            targetType: "Variant",
            targetId: result.id,
            metadata: {
              key: result.key,
              oldStatus: variant.status,
              newStatus: result.status,
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

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/tenants");
    revalidatePath(`/super-admin/tenants/${parsed.data.tenantId}`);
    revalidatePath("/site");

    return {
      ok: true,
      status: updated.status,
    };
  } catch (error) {
    return toActionError(error, "Status variant gagal diubah.");
  }
}

export async function changeVariantTheme(
  input: unknown,
): Promise<TenantActionResult> {
  try {
    const session = await requireSuperAdminSession();
    const parsed = changeVariantThemeSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError(toFieldErrors(parsed.error));
    }

    const ipAddress = await getRequestIpAddress();

    await prisma.$transaction(
      async (tx) => {
        const variant = await tx.variant.findFirst({
          where: {
            id: parsed.data.variantId,
            tenantId: parsed.data.tenantId,
          },
          select: {
            id: true,
            key: true,
            themeKey: true,
          },
        });

        if (!variant) {
          throw new AppError("NOT_FOUND", "Variant tidak ditemukan.", 404);
        }

        const updated = await tx.variant.update({
          where: {
            id: variant.id,
          },
          data: {
            themeKey: parsed.data.themeKey,
          },
          select: {
            id: true,
            key: true,
            themeKey: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: parsed.data.tenantId,
            userId: session.userId,
            action: "variant.changeTheme",
            targetType: "Variant",
            targetId: updated.id,
            metadata: {
              key: updated.key,
              oldThemeKey: variant.themeKey,
              newThemeKey: updated.themeKey,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/tenants");
    revalidatePath(`/super-admin/tenants/${parsed.data.tenantId}`);
    revalidatePath("/site");

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Theme variant gagal diubah.");
  }
}

async function setTenantStatus(
  input: unknown,
  status: "ACTIVE" | "SUSPENDED",
  action: "tenant.activate" | "tenant.suspend",
): Promise<TenantActionResult> {
  try {
    const session = await requireSuperAdminSession();
    const parsed = tenantIdSchema.safeParse(input);

    if (!parsed.success) {
      throw new ValidationError({
        id: ["Tenant tidak valid."],
      });
    }

    const ipAddress = await getRequestIpAddress();
    const securityStamp = randomUUID();

    await prisma.$transaction(
      async (tx) => {
        const existing = await tx.tenant.findUnique({
          where: {
            id: parsed.data.id,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!existing) {
          throw new AppError("NOT_FOUND", "Tenant tidak ditemukan.", 404);
        }

        const updated = await tx.tenant.update({
          where: {
            id: parsed.data.id,
          },
          data: {
            status,
          },
          select: {
            id: true,
            status: true,
          },
        });

        const invalidatedUsers = await tx.user.updateMany({
          where: {
            tenantId: parsed.data.id,
          },
          data: {
            securityStamp,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: updated.id,
            userId: session.userId,
            action,
            targetType: "Tenant",
            targetId: updated.id,
            metadata: {
              oldStatus: existing.status,
              newStatus: updated.status,
              invalidatedUsers: invalidatedUsers.count,
            },
            ipAddress,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/tenants");
    revalidatePath(`/super-admin/tenants/${parsed.data.id}`);

    return {
      ok: true,
    };
  } catch (error) {
    return toActionError(error, "Status tenant gagal diubah.");
  }
}

async function requireSuperAdminSession() {
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

async function getRequestIpAddress() {
  try {
    return getClientIp(await headers());
  } catch {
    return "unknown";
  }
}

function optionSet(
  key: string,
  label: string,
  values: Array<string | OptionValueSeed>,
) {
  return {
    key,
    label,
    values: values.map((value) =>
      typeof value === "string"
        ? {
            value: generateSlug(value),
            label: value,
          }
        : value,
    ),
  };
}

function titleFromKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, value ?? []]),
  );
}

function toActionError(error: unknown, fallback: string): ActionFailure {
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
