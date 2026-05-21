import { prisma } from "@/server/db/client";

export type PublicDomainResolution =
  | {
      status: "unknown";
      host: string;
    }
  | {
      status: "active";
      host: string;
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
      variantId: string;
      variantKey: string;
    }
  | {
      status: "suspended";
      host: string;
      tenantName: string;
    }
  | {
      status: "disabled";
      host: string;
    };

export async function resolvePublicDomainByHost(
  hostInput: string,
): Promise<PublicDomainResolution> {
  const host = normalizeHost(hostInput);

  if (!host) {
    return {
      status: "unknown",
      host,
    };
  }

  const domain = await prisma.domain.findUnique({
    where: {
      host,
    },
    select: {
      status: true,
      variant: {
        select: {
          id: true,
          key: true,
          status: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!domain) {
    return {
      status: "unknown",
      host,
    };
  }

  if (domain.variant.tenant.status === "SUSPENDED") {
    return {
      status: "suspended",
      host,
      tenantName: domain.variant.tenant.name,
    };
  }

  if (domain.status !== "ACTIVE" || domain.variant.status !== "ACTIVE") {
    return {
      status: "disabled",
      host,
    };
  }

  return {
    status: "active",
    host,
    tenantId: domain.variant.tenant.id,
    tenantName: domain.variant.tenant.name,
    tenantSlug: domain.variant.tenant.slug,
    variantId: domain.variant.id,
    variantKey: domain.variant.key,
  };
}

function normalizeHost(value: string) {
  return value.trim().replace(/\.$/, "").toLowerCase();
}
