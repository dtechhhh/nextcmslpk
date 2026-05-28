import type { TenantModel, VariantModel } from "@/generated/prisma/models";
import { starterTheme } from "@/themes/starter/registry";
import { prisma } from "@/server/db/client";

export type Theme = typeof starterTheme;

export type ResolvedPublicVariant = VariantModel & {
  variantKey: string;
  theme: Theme;
};

export type DomainResolution =
  | { type: "not_found" }
  | { type: "suspended"; tenant: TenantModel }
  | { type: "unavailable"; variant: VariantModel }
  | { type: "ok"; tenant: TenantModel; variant: ResolvedPublicVariant };

export async function resolveDomain(hostInput: string): Promise<DomainResolution> {
  const host = normalizeHost(hostInput);

  if (!host) {
    return { type: "not_found" };
  }

  const domain = await prisma.domain.findFirst({
    where: { host, status: "ACTIVE" },
    include: {
      variant: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!domain) {
    return { type: "not_found" };
  }

  const { tenant, ...variant } = domain.variant;

  if (tenant.status !== "ACTIVE") {
    return { type: "suspended", tenant };
  }

  if (variant.status !== "ACTIVE") {
    return { type: "unavailable", variant };
  }

  return {
    type: "ok",
    tenant,
    variant: {
      ...variant,
      variantKey: variant.key,
      theme: starterTheme,
    },
  };
}

export type PublicDomainResolution =
  | { status: "unknown"; host: string }
  | {
      status: "active";
      host: string;
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
      variantId: string;
      variantKey: string;
    }
  | { status: "suspended"; host: string; tenantName: string }
  | { status: "disabled"; host: string };

export async function resolvePublicDomainByHost(
  hostInput: string,
): Promise<PublicDomainResolution> {
  const host = normalizeHost(hostInput);
  const result = await resolveDomain(host);

  if (result.type === "not_found") {
    return { status: "unknown", host };
  }

  if (result.type === "suspended") {
    return {
      status: "suspended",
      host,
      tenantName: result.tenant.name,
    };
  }

  if (result.type === "unavailable") {
    return { status: "disabled", host };
  }

  return {
    status: "active",
    host,
    tenantId: result.tenant.id,
    tenantName: result.tenant.name,
    tenantSlug: result.tenant.slug,
    variantId: result.variant.id,
    variantKey: result.variant.variantKey,
  };
}

function normalizeHost(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}

export function getDomainProtocol(host: string): "http" | "https" {
  const h = host.toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h.includes(".local")
  ) {
    return "http";
  }
  return "https";
}

export async function resolveVariantHomepageUrl(
  tenantId: string,
  targetVariantKey: string,
): Promise<string | null> {
  const variant = await prisma.variant.findFirst({
    where: {
      tenantId,
      key: targetVariantKey,
      status: "ACTIVE",
    },
    include: {
      domains: {
        where: { status: "ACTIVE" },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
  });

  if (!variant || variant.domains.length === 0) {
    return null;
  }

  const domain = variant.domains[0];
  const protocol = getDomainProtocol(domain.host);
  return `${protocol}://${domain.host}`;
}
