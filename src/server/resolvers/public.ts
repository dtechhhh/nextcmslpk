import { PAGE_EDITOR_DEFINITIONS } from "@/lib/page-editor-definitions";
import {
  findCollectionByPublicPath,
  getPublicItemPath,
} from "@/lib/collection-definitions";
import { prisma } from "@/server/db/client";
import {
  resolvePublicDomainByHost,
  type PublicDomainResolution,
} from "@/server/resolvers/domain";
import { verifyPreviewToken } from "@/server/services/preview-token";
import type { VariantKey } from "@/types";

export type PublicPageSearchParams = Record<string, string | string[] | undefined>;

export type PublicContentPageResolution =
  | {
      status: "ok";
      isPreview: boolean;
      noStore: boolean;
      page: {
        id: string;
        title: string;
        pageKey: string;
        publicPath: string;
        variantKey: VariantKey;
        dataJson: Record<string, unknown>;
        updatedAt: string;
      };
    }
  | {
      status: "invalid_preview";
      normalPath: string;
    }
  | {
      status: "not_found" | "unknown_domain" | "disabled" | "suspended";
    };

type ResolvePublicContentPageInput = {
  host: string;
  publicPath: string;
  searchParams: PublicPageSearchParams;
};

export async function resolvePublicContentPage({
  host,
  publicPath,
  searchParams,
}: ResolvePublicContentPageInput): Promise<PublicContentPageResolution> {
  const normalizedPath = normalizePublicPath(publicPath);

  if (isPreviewRequest(searchParams)) {
    return resolvePreviewContentPage({
      host,
      publicPath: normalizedPath,
      searchParams,
    });
  }

  const domain = await resolvePublicDomainByHost(host);

  if (domain.status !== "active") {
    return {
      status: domain.status === "unknown" ? "unknown_domain" : domain.status,
    };
  }

  return resolvePublishedContentPage(domain, normalizedPath);
}

async function resolvePublishedContentPage(
  domain: Extract<PublicDomainResolution, { status: "active" }>,
  publicPath: string,
): Promise<PublicContentPageResolution> {
  const variantKey = toVariantKey(domain.variantKey);

  if (!variantKey) {
    return {
      status: "not_found",
    };
  }

  const pageDefinition = findPageDefinitionByPublicPath(variantKey, publicPath);

  if (!pageDefinition) {
    return resolvePublishedContentItem(domain, publicPath);
  }

  const page = await prisma.contentPage.findFirst({
    where: {
      tenantId: domain.tenantId,
      variantId: domain.variantId,
      pageKey: pageDefinition.pageKey,
    },
    select: {
      id: true,
      title: true,
      pageKey: true,
      status: true,
      publishedDataJson: true,
      updatedAt: true,
    },
  });

  if (
    !page ||
    page.status !== "PUBLISHED" ||
    !isRecord(page.publishedDataJson)
  ) {
    return {
      status: "not_found",
    };
  }

  return {
    status: "ok",
    isPreview: false,
    noStore: false,
    page: {
      id: page.id,
      title: page.title,
      pageKey: page.pageKey,
      publicPath: pageDefinition.publicPath,
      variantKey,
      dataJson: cloneRecord(page.publishedDataJson),
      updatedAt: page.updatedAt.toISOString(),
    },
  };
}

async function resolvePublishedContentItem(
  domain: Extract<PublicDomainResolution, { status: "active" }>,
  publicPath: string,
): Promise<PublicContentPageResolution> {
  const variantKey = toVariantKey(domain.variantKey);

  if (!variantKey) {
    return {
      status: "not_found",
    };
  }

  const collectionMatch = findCollectionByPublicPath(variantKey, publicPath);

  if (!collectionMatch) {
    return {
      status: "not_found",
    };
  }

  const item = await prisma.contentItem.findFirst({
    where: {
      tenantId: domain.tenantId,
      variantId: domain.variantId,
      collectionKey: collectionMatch.definition.key,
      slug: collectionMatch.slug,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      collectionKey: true,
      status: true,
      publishedDataJson: true,
      updatedAt: true,
    },
  });

  if (
    !item ||
    item.status !== "PUBLISHED" ||
    !isRecord(item.publishedDataJson)
  ) {
    return {
      status: "not_found",
    };
  }

  return {
    status: "ok",
    isPreview: false,
    noStore: false,
    page: {
      id: item.id,
      title: item.title,
      pageKey: item.collectionKey,
      publicPath: getPublicItemPath(collectionMatch.definition.key, item.slug),
      variantKey,
      dataJson: cloneRecord(item.publishedDataJson),
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}

async function resolvePreviewContentPage({
  host,
  publicPath,
  searchParams,
}: ResolvePublicContentPageInput): Promise<PublicContentPageResolution> {
  const token = readParam(searchParams.token);

  if (!token) {
    return invalidPreview(publicPath);
  }

  const verifiedToken = verifyPreviewToken(token);

  if (!verifiedToken.ok) {
    return invalidPreview(publicPath);
  }

  const payload = verifiedToken.payload;

  if (payload.type === "content_item") {
    return resolvePreviewContentItem({
      host,
      publicPath,
      payload,
    });
  }

  if (payload.type !== "content_page") {
    return invalidPreview(publicPath);
  }

  if (!payload.pageKey) {
    return invalidPreview(publicPath);
  }

  const page = await prisma.contentPage.findFirst({
    where: {
      id: payload.sub,
      tenantId: payload.tenantId,
      variantId: payload.variantId,
      pageKey: payload.pageKey,
    },
    select: {
      id: true,
      title: true,
      pageKey: true,
      dataJson: true,
      updatedAt: true,
      variant: {
        select: {
          key: true,
          status: true,
          tenant: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (
    !page ||
    page.variant.tenant.status !== "ACTIVE" ||
    page.variant.status !== "ACTIVE"
  ) {
    return invalidPreview(publicPath);
  }

  const variantKey = toVariantKey(page.variant.key);

  if (!variantKey) {
    return invalidPreview(publicPath);
  }

  const pageDefinition = findPageDefinition(variantKey, page.pageKey);

  if (!pageDefinition || normalizePublicPath(pageDefinition.publicPath) !== publicPath) {
    return invalidPreview(publicPath);
  }

  const domain = await resolvePublicDomainByHost(host);

  if (
    domain.status === "active" &&
    (domain.tenantId !== payload.tenantId ||
      domain.variantId !== payload.variantId)
  ) {
    return invalidPreview(publicPath);
  }

  return {
    status: "ok",
    isPreview: true,
    noStore: true,
    page: {
      id: page.id,
      title: page.title,
      pageKey: page.pageKey,
      publicPath: pageDefinition.publicPath,
      variantKey,
      dataJson: normalizePageData(page.dataJson),
      updatedAt: page.updatedAt.toISOString(),
    },
  };
}

async function resolvePreviewContentItem({
  host,
  publicPath,
  payload,
}: {
  host: string;
  publicPath: string;
  payload: {
    sub: string;
    tenantId: string;
    variantId: string;
    collectionKey?: string;
  };
}): Promise<PublicContentPageResolution> {
  if (!payload.collectionKey) {
    return invalidPreview(publicPath);
  }

  const item = await prisma.contentItem.findFirst({
    where: {
      id: payload.sub,
      tenantId: payload.tenantId,
      variantId: payload.variantId,
      collectionKey: payload.collectionKey,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      collectionKey: true,
      dataJson: true,
      updatedAt: true,
      variant: {
        select: {
          key: true,
          status: true,
          tenant: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (
    !item ||
    item.variant.tenant.status !== "ACTIVE" ||
    item.variant.status !== "ACTIVE"
  ) {
    return invalidPreview(publicPath);
  }

  const variantKey = toVariantKey(item.variant.key);

  if (!variantKey) {
    return invalidPreview(publicPath);
  }

  const collectionMatch = findCollectionByPublicPath(variantKey, publicPath);

  if (
    !collectionMatch ||
    collectionMatch.definition.key !== item.collectionKey ||
    collectionMatch.slug !== item.slug
  ) {
    return invalidPreview(publicPath);
  }

  const domain = await resolvePublicDomainByHost(host);

  if (
    domain.status === "active" &&
    (domain.tenantId !== payload.tenantId ||
      domain.variantId !== payload.variantId)
  ) {
    return invalidPreview(publicPath);
  }

  return {
    status: "ok",
    isPreview: true,
    noStore: true,
    page: {
      id: item.id,
      title: item.title,
      pageKey: item.collectionKey,
      publicPath: getPublicItemPath(collectionMatch.definition.key, item.slug),
      variantKey,
      dataJson: normalizePageData(item.dataJson),
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}

function invalidPreview(publicPath: string): PublicContentPageResolution {
  return {
    status: "invalid_preview",
    normalPath: publicPath,
  };
}

function isPreviewRequest(searchParams: PublicPageSearchParams) {
  return readParam(searchParams.preview) === "true";
}

function findPageDefinitionByPublicPath(
  variantKey: VariantKey,
  publicPath: string,
) {
  const normalizedPath = normalizePublicPath(publicPath);

  return Object.values(PAGE_EDITOR_DEFINITIONS).find(
    (definition) =>
      definition.variantKey === variantKey &&
      normalizePublicPath(definition.publicPath) === normalizedPath,
  );
}

function findPageDefinition(variantKey: VariantKey, pageKey: string) {
  return Object.values(PAGE_EDITOR_DEFINITIONS).find(
    (definition) =>
      definition.variantKey === variantKey && definition.pageKey === pageKey,
  );
}

function normalizePublicPath(value: string) {
  const trimmedValue = value.trim();
  const path = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
  const withoutTrailingSlash = path.replace(/\/+$/, "");

  return withoutTrailingSlash === "" ? "/" : withoutTrailingSlash;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toVariantKey(value: string): VariantKey | null {
  return value === "indonesia" || value === "japan" ? value : null;
}

function normalizePageData(value: unknown) {
  return isRecord(value) ? cloneRecord(value) : {};
}

function cloneRecord(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
