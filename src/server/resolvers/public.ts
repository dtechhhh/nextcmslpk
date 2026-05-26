import { createHmac, timingSafeEqual } from "node:crypto";

import type { PublishStatus } from "@/generated/prisma/enums";
import type { ContentItemModel, ContentItemWhereInput } from "@/generated/prisma/models";
import { getPublicUrl } from "@/server/services/storage";
import { prisma } from "@/server/db/client";

export type PublicPageSearchParams = Record<string, string | string[] | undefined>;

export type PublicJson = Record<string, unknown>;

export type PreviewTokenResolution = {
  valid: boolean;
  itemId?: string;
  pageId?: string;
  tenantId?: string;
  variantId?: string;
  pageKey?: string;
  collectionKey?: string;
};

export type PublicCollectionItem = {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  excerpt?: string;
  thumbnailImageId?: string;
  thumbnailSrc?: string;
  heroImageId?: string;
  heroSrc?: string;
  isFeatured: boolean;
  publishedAt?: string;
  startAt?: string;
  expiredAt?: string;
  sortOrder: number;
  dataJson: PublicJson;
  isExpired: boolean;
};

export async function resolveGlobalConfig(variantId: string) {
  const configs = await prisma.variantGlobalConfig.findMany({
    where: { variantId },
    select: { configKey: true, dataJson: true },
  });

  return configs.reduce<Record<string, PublicJson>>((globalConfig, config) => {
    globalConfig[config.configKey] = normalizeJson(config.dataJson);
    return globalConfig;
  }, {});
}

export async function resolvePageData(
  variantId: string,
  pageKey: string,
  opts?: { preview?: boolean; token?: string },
) {
  if (opts?.preview) {
    const preview = opts.token ? await resolvePreviewTokenForVariant(opts.token, variantId) : null;

    if (!preview?.valid || preview.pageKey !== pageKey) {
      return null;
    }

    const page = await prisma.contentPage.findFirst({
      where: {
        id: preview.pageId,
        tenantId: preview.tenantId,
        variantId,
        pageKey,
      },
      select: { id: true, title: true, pageKey: true, dataJson: true, updatedAt: true },
    });

    return page
      ? {
          id: page.id,
          title: page.title,
          pageKey: page.pageKey,
          dataJson: normalizeJson(page.dataJson),
          updatedAt: page.updatedAt.toISOString(),
          isPreview: true,
        }
      : null;
  }

  const page = await prisma.contentPage.findFirst({
    where: { variantId, pageKey, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      pageKey: true,
      publishedDataJson: true,
      updatedAt: true,
    },
  });

  if (!page || !isRecord(page.publishedDataJson)) {
    return null;
  }

  return {
    id: page.id,
    title: page.title,
    pageKey: page.pageKey,
    dataJson: cloneRecord(page.publishedDataJson),
    updatedAt: page.updatedAt.toISOString(),
    isPreview: false,
  };
}

export async function resolveMediaUrl(mediaId: string) {
  if (!mediaId) {
    return null;
  }

  const mediaUrls = await resolveMediaUrls([mediaId]);
  return mediaUrls.get(mediaId) ?? null;
}

export async function resolveMediaUrls(mediaIds: Array<string | null | undefined>) {
  const uniqueMediaIds = [...new Set(mediaIds.filter((mediaId): mediaId is string => Boolean(mediaId)))];

  if (!uniqueMediaIds.length) {
    return new Map<string, string>();
  }

  const mediaAssets = await prisma.mediaAsset.findMany({
    where: { id: { in: uniqueMediaIds }, status: "ACTIVE" },
    select: { id: true, storagePath: true },
  });

  return new Map(mediaAssets.map((media) => [media.id, getPublicUrl(media.storagePath)]));
}

function getResolvedMediaUrl(mediaUrls: Map<string, string> | undefined, mediaId?: string | null) {
  if (!mediaId) {
    return null;
  }

  return mediaUrls ? (mediaUrls.get(mediaId) ?? null) : undefined;
}

async function resolveFallbackMediaUrl(mediaUrls: Map<string, string> | undefined, mediaId?: string | null) {
  const resolved = getResolvedMediaUrl(mediaUrls, mediaId);

  if (resolved !== undefined) {
    return resolved;
  }

  return mediaId ? resolveMediaUrl(mediaId) : null;
}

export async function resolveOptionLabel(optionId: string) {
  if (!optionId) {
    return null;
  }

  return prisma.optionValue.findUnique({
    where: { id: optionId },
    select: { label: true, value: true },
  });
}

export async function resolveOptionSet(variantId: string, key: string) {
  const optionSet = await prisma.optionSet.findUnique({
    where: { variantId_key: { variantId, key } },
    select: {
      values: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: { id: true, label: true, value: true },
      },
    },
  });

  return optionSet?.values ?? [];
}

export async function resolveCollectionList(
  variantId: string,
  collectionKey: string,
  opts: {
    filters?: Record<string, string>;
    page?: number;
    pageSize?: number;
    source?: "featured" | "latest_active" | "latest_published" | "manual";
    max?: number;
    activeOnly?: boolean;
    manualIds?: string[];
  } = {},
) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.max(1, Math.min(50, opts.pageSize ?? opts.max ?? 12));
  const skip = (page - 1) * pageSize;
  const now = new Date();
  const source = opts.source;

  const where = buildCollectionListWhere({
    variantId,
    collectionKey,
    now,
    source,
    opts,
  });
  const orderBy =
    source === "latest_active" || source === "latest_published"
      ? [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }]
      : [
          { sortOrder: "asc" as const },
          { publishedAt: "desc" as const },
          { updatedAt: "desc" as const },
        ];
  const rows = await prisma.contentItem.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  const total =
    rows.length < pageSize && (rows.length > 0 || page === 1)
      ? skip + rows.length
      : await prisma.contentItem.count({ where });
  const mediaUrls = await resolveMediaUrls(
    rows.flatMap((row) => [row.thumbnailImageId, row.heroImageId]),
  );
  const items = await Promise.all(rows.map((row) => mapContentItem(row, false, mediaUrls)));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function resolveCollectionItem(
  variantId: string,
  collectionKey: string,
  slug: string,
  opts?: { preview?: boolean; token?: string },
) {
  if (opts?.preview) {
    const preview = opts.token ? await resolvePreviewTokenForVariant(opts.token, variantId) : null;

    if (
      !preview?.valid ||
      preview.collectionKey !== collectionKey ||
      !preview.itemId
    ) {
      return null;
    }

    const item = await prisma.contentItem.findFirst({
      where: {
        id: preview.itemId,
        tenantId: preview.tenantId,
        variantId,
        collectionKey,
        slug,
      },
    });

    return item ? { ...(await mapContentItem(item, true)), isPreview: true } : null;
  }

  const item = await prisma.contentItem.findFirst({
    where: { variantId, collectionKey, slug, status: "PUBLISHED" },
  });

  return item && isRecord(item.publishedDataJson)
    ? {
        ...(await mapContentItem(
          item,
          false,
          await resolveMediaUrls([item.thumbnailImageId, item.heroImageId]),
        )),
        isPreview: false,
      }
    : null;
}

export async function resolveActiveOffer(variantId: string) {
  const offer = await prisma.contentItem.findFirst({
    where: {
      variantId,
      collectionKey: "offer",
      status: "PUBLISHED",
      OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
  });

  return offer && isRecord(offer.publishedDataJson)
    ? mapContentItem(
        offer,
        false,
        await resolveMediaUrls([offer.thumbnailImageId, offer.heroImageId]),
      )
    : null;
}

export async function resolvePreviewToken(token: string, tenantId: string) {
  const payload = verifyJwt(token);

  if (!payload || payload.tenantId !== tenantId) {
    return { valid: false };
  }

  return {
    valid: true,
    tenantId: payload.tenantId,
    variantId: payload.variantId,
    itemId: payload.type === "content_item" ? payload.sub : undefined,
    pageId: payload.type === "content_page" ? payload.sub : undefined,
    pageKey: payload.pageKey,
    collectionKey: payload.collectionKey,
  };
}

async function resolvePreviewTokenForVariant(token: string, variantId: string) {
  const payload = verifyJwt(token);

  if (!payload || payload.variantId !== variantId) {
    return null;
  }

  return {
    valid: true,
    tenantId: payload.tenantId,
    variantId: payload.variantId,
    itemId: payload.type === "content_item" ? payload.sub : undefined,
    pageId: payload.type === "content_page" ? payload.sub : undefined,
    pageKey: payload.pageKey,
    collectionKey: payload.collectionKey,
  } satisfies PreviewTokenResolution;
}

async function mapContentItem(
  item: ContentItemModel,
  useDraftData = false,
  mediaUrls?: Map<string, string>,
): Promise<PublicCollectionItem> {
  const [thumbnailSrc, heroSrc] = await Promise.all([
    resolveFallbackMediaUrl(mediaUrls, item.thumbnailImageId),
    resolveFallbackMediaUrl(mediaUrls, item.heroImageId),
  ]);
  const dataJson = useDraftData ? item.dataJson : item.publishedDataJson;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status,
    excerpt: item.excerpt ?? undefined,
    thumbnailImageId: item.thumbnailImageId ?? undefined,
    thumbnailSrc: thumbnailSrc ?? undefined,
    heroImageId: item.heroImageId ?? undefined,
    heroSrc: heroSrc ?? undefined,
    isFeatured: item.isFeatured,
    publishedAt: item.publishedAt?.toISOString(),
    startAt: item.startAt?.toISOString(),
    expiredAt: item.expiredAt?.toISOString(),
    sortOrder: item.sortOrder,
    dataJson: normalizeJson(dataJson),
    isExpired: Boolean(item.expiredAt && item.expiredAt <= new Date()),
  };
}

function buildCollectionListWhere({
  variantId,
  collectionKey,
  now,
  source,
  opts,
}: {
  variantId: string;
  collectionKey: string;
  now: Date;
  source: "featured" | "latest_active" | "latest_published" | "manual" | undefined;
  opts: {
    filters?: Record<string, string>;
    activeOnly?: boolean;
    manualIds?: string[];
  };
}): ContentItemWhereInput {
  const filterConditions = buildPublishedJsonFilterConditions(opts.filters);

  return {
    variantId,
    collectionKey,
    status: "PUBLISHED",
    ...(opts.activeOnly || source === "latest_active"
      ? { OR: [{ expiredAt: null }, { expiredAt: { gt: now } }] }
      : {}),
    ...(source === "featured" ? { isFeatured: true } : {}),
    ...(source === "manual" && opts.manualIds?.length ? { id: { in: opts.manualIds } } : {}),
    ...(filterConditions.length ? { AND: filterConditions } : {}),
  };
}

function buildPublishedJsonFilterConditions(
  filters?: Record<string, string>,
): ContentItemWhereInput[] {
  const activeFilters = Object.entries(filters ?? {}).filter(([, value]) => value);

  return activeFilters.map(([key, value]) => ({
    OR: filterJsonPaths(key).flatMap((path) => [
      { publishedDataJson: { path: [path], equals: value } },
      { publishedDataJson: { path: [path], array_contains: [value] } },
    ]),
  }));
}

function filterJsonPaths(key: string) {
  return [
    key,
    `${key}_option_id`,
    `${key}_id`,
    `${key}_option_ids`,
    `${key}_ids`,
  ];
}

type PreviewJwtPayload = {
  iss: "nextcmslpk";
  sub: string;
  type: "content_page" | "content_item";
  tenantId: string;
  variantId: string;
  pageKey?: string;
  collectionKey?: string;
  iat: number;
  exp: number;
};

function verifyJwt(token: string): PreviewJwtPayload | null {
  const secret = process.env.PREVIEW_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature, ...extraParts] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature || extraParts.length > 0) {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (!isPreviewPayload(payload)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp <= now;
    const isOlderThanOneHour = payload.iat < now - 60 * 60;

    return isExpired || isOlderThanOneHour ? null : payload;
  } catch {
    return null;
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.byteLength === rightBuffer.byteLength &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isPreviewPayload(value: unknown): value is PreviewJwtPayload {
  return (
    isRecord(value) &&
    value.iss === "nextcmslpk" &&
    (value.type === "content_page" || value.type === "content_item") &&
    typeof value.sub === "string" &&
    typeof value.tenantId === "string" &&
    typeof value.variantId === "string" &&
    typeof value.iat === "number" &&
    typeof value.exp === "number"
  );
}

function normalizeJson(value: unknown): PublicJson {
  return isRecord(value) ? cloneRecord(value) : {};
}

function cloneRecord(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as PublicJson;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
