import type { TenantModel, VariantModel } from "@/generated/prisma/models";
import { unstable_cache } from "next/cache";
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

const PUBLIC_DOMAIN_CACHE_SECONDS = 300;

export async function resolveDomain(hostInput: string): Promise<DomainResolution> {
  const host = normalizeHost(hostInput);

  if (!host) {
    return { type: "not_found" };
  }

  const domain = await unstable_cache(
    () => findActiveDomainByHost(host),
    ["public-domain", host],
    { revalidate: PUBLIC_DOMAIN_CACHE_SECONDS, tags: [`public-domain:${host}`] },
  )();

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

async function findActiveDomainByHost(host: string) {
  const hostWithoutPort = stripPort(host);
  const hostFilters =
    host === hostWithoutPort
      ? [{ host }, { host: { startsWith: `${host}:` } }]
      : [{ host }, { host: hostWithoutPort }];

  const domains = await prisma.domain.findMany({
    where: {
      status: "ACTIVE",
      OR: hostFilters,
    },
    include: {
      variant: {
        include: {
          tenant: true,
        },
      },
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return (
    domains.find((domain) => normalizeHost(domain.host) === host) ??
    domains.find((domain) => stripPort(normalizeHost(domain.host)) === hostWithoutPort) ??
    null
  );
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

function stripPort(host: string) {
  if (host.startsWith("[")) {
    const bracketEnd = host.indexOf("]");

    return bracketEnd >= 0 ? host.slice(0, bracketEnd + 1) : host;
  }

  const [hostname, port, ...rest] = host.split(":");

  if (hostname && port && rest.length === 0 && /^\d{1,5}$/.test(port)) {
    return hostname;
  }

  return host;
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
  return unstable_cache(
    () => resolveVariantHomepageUrlUncached(tenantId, targetVariantKey),
    ["public-variant-homepage-url", tenantId, targetVariantKey],
    { revalidate: PUBLIC_DOMAIN_CACHE_SECONDS, tags: [`tenant:${tenantId}`] },
  )();
}

async function resolveVariantHomepageUrlUncached(
  tenantId: string,
  targetVariantKey: string,
) {
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
