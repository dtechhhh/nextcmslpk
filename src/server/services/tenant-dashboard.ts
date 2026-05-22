import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import { DASHBOARD_VARIANTS, type DashboardVariant } from "@/lib/dashboard-routes";
import { prisma } from "@/server/db/client";
import { verifySecurityStamp } from "@/server/services/security-stamp";

const DASHBOARD_LOGIN_PATH = "/dashboard/login";
const DASHBOARD_SUSPENDED_PATH = "/dashboard/suspended";

type TenantDashboardUser = {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  totpSecret: string | null;
  totpVerified: boolean;
  tenantId: string | null;
  tenant: {
    id: string;
    name: string;
    status: string;
  } | null;
};

export type TenantDashboardPageContext = {
  userId: string;
  username: string;
  tenantId: string;
  tenantName: string;
  mustChangePassword: boolean;
  needsTOTPSetup: boolean;
};

export type DashboardOverviewData = {
  tenantName: string;
  username: string;
  variants: OverviewVariantData[];
};

export type OverviewVariantData = {
  key: DashboardVariant;
  label: string;
  stats: OverviewStat[];
  quickActions: OverviewAction[];
  recentChanges: OverviewRecentChange[];
};

export type OverviewStat = {
  label: string;
  value: string;
  description: string;
};

export type OverviewAction = {
  label: string;
  href: string | null;
  external?: boolean;
};

export type OverviewRecentChange = {
  id: string;
  title: string;
  type: string;
  status?: string;
  updatedAt: string;
};

export async function requireTenantDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TENANT_ADMIN") {
    redirect(DASHBOARD_LOGIN_PATH);
  }

  try {
    await verifySecurityStamp(session);
  } catch {
    await redirectIfSuspendedTenantAdmin(session);
    redirect(DASHBOARD_LOGIN_PATH);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId,
    },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      totpSecret: true,
      totpVerified: true,
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  if (isSuspendedTenantAdmin(user)) {
    redirect(DASHBOARD_SUSPENDED_PATH);
  }

  if (!isActiveTenantAdmin(user)) {
    redirect(DASHBOARD_LOGIN_PATH);
  }

  return {
    userId: user.id,
    username: user.username,
    tenantId: user.tenant.id,
    tenantName: user.tenant.name,
    mustChangePassword: user.mustChangePassword,
    needsTOTPSetup: !user.totpVerified || !user.totpSecret,
  } satisfies TenantDashboardPageContext;
}

export async function getTenantDashboardOverviewData() {
  const context = await requireTenantDashboardPage();
  const variantRows = await prisma.variant.findMany({
    where: {
      tenantId: context.tenantId,
      key: {
        in: ["indonesia", "japan"],
      },
    },
    select: {
      id: true,
      key: true,
      label: true,
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
          isPrimary: true,
        },
      },
    },
  });
  const variantByKey = new Map(
    variantRows
      .filter((variant) => isDashboardVariantKey(variant.key))
      .map((variant) => [variant.key as DashboardVariant, variant]),
  );

  const variants = await Promise.all(
    (["indonesia", "japan"] as DashboardVariant[]).map(async (variantKey) => {
      const config = DASHBOARD_VARIANTS[variantKey];
      const variant = variantByKey.get(variantKey);
      const variantId = variant?.id ?? null;
      const [
        publishedPages,
        totalCollectionItems,
        publishedCollectionItems,
        activeOffers,
        activeJobs,
        recentChanges,
      ] = variantId
        ? await Promise.all([
            prisma.contentPage.count({
              where: {
                tenantId: context.tenantId,
                variantId,
                status: "PUBLISHED",
              },
            }),
            prisma.contentItem.count({
              where: {
                tenantId: context.tenantId,
                variantId,
              },
            }),
            prisma.contentItem.count({
              where: {
                tenantId: context.tenantId,
                variantId,
                status: "PUBLISHED",
              },
            }),
            countActiveCollectionItems({
              tenantId: context.tenantId,
              variantId,
              collectionKey: "offer",
            }),
            countActiveCollectionItems({
              tenantId: context.tenantId,
              variantId,
              collectionKey: "job",
            }),
            getRecentChanges({
              tenantId: context.tenantId,
              variantId,
              userId: context.userId,
            }),
          ])
        : [0, 0, 0, 0, 0, []];

      return {
        key: variantKey,
        label: config.label,
        stats: buildStats({
          variantKey,
          publishedPages,
          totalPages: config.pages.length,
          publishedCollectionItems,
          totalCollectionItems,
          activeOffers,
          activeJobs,
        }),
        quickActions: buildQuickActions({
          variantKey,
          publicSiteUrl: getPublicSiteUrl(variant),
        }),
        recentChanges,
      } satisfies OverviewVariantData;
    }),
  );

  return {
    tenantName: context.tenantName,
    username: context.username,
    variants,
  } satisfies DashboardOverviewData;
}

export async function getTenantDashboardSuspendedPageData() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TENANT_ADMIN") {
    redirect(DASHBOARD_LOGIN_PATH);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId,
    },
    select: {
      username: true,
      role: true,
      isActive: true,
      tenant: {
        select: {
          name: true,
          status: true,
        },
      },
    },
  });

  if (!user?.isActive || user.role !== "TENANT_ADMIN" || !user.tenant) {
    redirect(DASHBOARD_LOGIN_PATH);
  }

  if (user.tenant.status !== "SUSPENDED") {
    redirect("/dashboard");
  }

  return {
    tenantName: user.tenant.name,
    username: user.username,
  };
}

function isActiveTenantAdmin(
  user: TenantDashboardUser | null,
): user is TenantDashboardUser & {
  tenant: NonNullable<TenantDashboardUser["tenant"]>;
} {
  return (
    Boolean(user?.isActive) &&
    user?.role === "TENANT_ADMIN" &&
    user.tenant?.status === "ACTIVE"
  );
}

function isSuspendedTenantAdmin(user: TenantDashboardUser | null) {
  return (
    Boolean(user?.isActive) &&
    user?.role === "TENANT_ADMIN" &&
    user.tenant?.status === "SUSPENDED"
  );
}

async function redirectIfSuspendedTenantAdmin(session: Session) {
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId,
    },
    select: {
      role: true,
      isActive: true,
      tenant: {
        select: {
          status: true,
        },
      },
    },
  });

  if (
    user?.isActive &&
    user.role === "TENANT_ADMIN" &&
    user.tenant?.status === "SUSPENDED"
  ) {
    redirect(DASHBOARD_SUSPENDED_PATH);
  }
}

function isDashboardVariantKey(value: string): value is DashboardVariant {
  return value === "indonesia" || value === "japan";
}

async function countActiveCollectionItems({
  tenantId,
  variantId,
  collectionKey,
}: {
  tenantId: string;
  variantId: string;
  collectionKey: string;
}) {
  const now = new Date();

  return prisma.contentItem.count({
    where: {
      tenantId,
      variantId,
      collectionKey,
      status: "PUBLISHED",
      OR: [
        {
          expiredAt: null,
        },
        {
          expiredAt: {
            gt: now,
          },
        },
      ],
    },
  });
}

async function getRecentChanges({
  tenantId,
  variantId,
  userId,
}: {
  tenantId: string;
  variantId: string;
  userId: string;
}) {
  const [pages, items, globals] = await Promise.all([
    prisma.contentPage.findMany({
      where: {
        tenantId,
        variantId,
        updatedBy: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        pageKey: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.contentItem.findMany({
      where: {
        tenantId,
        variantId,
        updatedBy: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        collectionKey: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.variantGlobalConfig.findMany({
      where: {
        tenantId,
        variantId,
        updatedBy: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        configKey: true,
        updatedAt: true,
      },
    }),
  ]);

  return [
    ...pages.map((page) => ({
      id: `page:${page.id}`,
      title: page.title,
      type: `Page / ${page.pageKey}`,
      status: page.status,
      updatedAt: page.updatedAt.toISOString(),
    })),
    ...items.map((item) => ({
      id: `item:${item.id}`,
      title: item.title,
      type: `Collection / ${item.collectionKey}`,
      status: item.status,
      updatedAt: item.updatedAt.toISOString(),
    })),
    ...globals.map((globalConfig) => ({
      id: `global:${globalConfig.id}`,
      title: globalConfig.configKey,
      type: "Global config",
      updatedAt: globalConfig.updatedAt.toISOString(),
    })),
  ]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
}

function buildStats({
  variantKey,
  publishedPages,
  totalPages,
  publishedCollectionItems,
  totalCollectionItems,
  activeOffers,
  activeJobs,
}: {
  variantKey: DashboardVariant;
  publishedPages: number;
  totalPages: number;
  publishedCollectionItems: number;
  totalCollectionItems: number;
  activeOffers: number;
  activeJobs: number;
}) {
  const stats: OverviewStat[] = [
    {
      label: "Published Pages",
      value: `${publishedPages}/${totalPages}`,
      description: "Published pages out of total configured pages",
    },
    {
      label: "Collection Items",
      value: `${publishedCollectionItems}/${totalCollectionItems}`,
      description: "Published items out of all collection items",
    },
  ];

  if (variantKey === "indonesia") {
    stats.push(
      {
        label: "Active Offers",
        value: activeOffers.toLocaleString("id-ID"),
        description: "Published offers that are not expired",
      },
      {
        label: "Active Jobs",
        value: activeJobs.toLocaleString("id-ID"),
        description: "Published jobs that are not expired",
      },
    );
  }

  return stats;
}

function buildQuickActions({
  variantKey,
  publicSiteUrl,
}: {
  variantKey: DashboardVariant;
  publicSiteUrl: string | null;
}) {
  const config = DASHBOARD_VARIANTS[variantKey];
  const primaryCollection = config.collections[0];

  return [
    {
      label: "Go to Homepage editor",
      href: config.pages[0]?.href ?? config.workspaceHref,
    },
    {
      label: `Create new ${primaryCollection.label.toLowerCase()}`,
      href: primaryCollection.createHref,
    },
    {
      label: "View public site",
      href: publicSiteUrl,
      external: true,
    },
  ] satisfies OverviewAction[];
}

function getPublicSiteUrl(
  variant:
    | {
        domains: {
          host: string;
          isPrimary: boolean;
        }[];
      }
    | null
    | undefined,
) {
  const domain =
    variant?.domains.find((item) => item.isPrimary) ?? variant?.domains[0];

  return domain ? `https://${domain.host}` : null;
}
