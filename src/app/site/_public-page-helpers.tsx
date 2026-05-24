import type { Metadata } from "next";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getSiteContext } from "@/app/site/site-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  resolveActiveOffer,
  resolveCollectionItem,
  resolveCollectionList,
  resolveMediaUrl,
  resolveOptionSet,
  resolvePageData,
  resolvePreviewToken,
  type PublicCollectionItem,
  type PublicJson,
  type PublicPageSearchParams,
} from "@/server/resolvers/public";
import { Button } from "@/themes/starter/components/ui/Button";
import { Container } from "@/themes/starter/components/ui/Container";
import { Card, CardContent } from "@/themes/starter/components/ui/Card";
import { CardGrid } from "@/themes/starter/components/sections/CardGrid";
import { CollectionDetail } from "@/themes/starter/components/sections/CollectionDetail";
import { CollectionList } from "@/themes/starter/components/sections/CollectionList";
import { ContactInfo } from "@/themes/starter/components/sections/ContactInfo";
import { ContentBlocks } from "@/themes/starter/components/sections/ContentBlocks";
import { CTABanner } from "@/themes/starter/components/sections/CTABanner";
import { ExpiredBadge } from "@/themes/starter/components/sections/ExpiredBadge";
import { FAQ } from "@/themes/starter/components/sections/FAQ";
import { HeroSection } from "@/themes/starter/components/sections/HeroSection";
import { OfferBanner } from "@/themes/starter/components/sections/OfferBanner";
import { RelatedItems } from "@/themes/starter/components/sections/RelatedItems";
import { StatsBar } from "@/themes/starter/components/sections/StatsBar";
import { StepFlow } from "@/themes/starter/components/sections/StepFlow";
import { TestimonialCarousel } from "@/themes/starter/components/sections/TestimonialCarousel";

export type PageSearchParams = Promise<PublicPageSearchParams>;
export type SlugParams = Promise<{ slug: string }>;

type PageLoadOptions = {
  pageKey: string;
  path: string;
  cacheTags: string[] | ((variantId: string) => string[]);
  revalidate: number;
  searchParams: PageSearchParams;
};

type ListPageOptions = {
  pageKey: string;
  collectionKey: string;
  path: string;
  detailPathPrefix: string;
  optionSetKeys: string[];
  cacheTags: string[] | ((variantId: string) => string[]);
  revalidate: number;
  searchParams: PageSearchParams;
  activeOnly?: boolean;
};

type DetailPageOptions = {
  collectionKey: string;
  slug: string;
  pathPrefix: string;
  cacheTags: string[] | ((variantId: string) => string[]);
  revalidate: number;
  searchParams?: PageSearchParams;
};

export async function loadPublicPage(options: PageLoadOptions) {
  const context = await getOkContext();
  const params = await options.searchParams;
  const preview = await getPreviewState(params, context.tenant.id, options.path);

  if (preview.isPreview) {
    noStore();
    const page = await resolvePageData(context.variantId, options.pageKey, {
      preview: true,
      token: preview.token,
    });
    return { context, page, isPreview: true };
  }

  const page = await unstable_cache(
    () => resolvePageData(context.variantId, options.pageKey),
    ["public-page", context.variantId, options.pageKey],
    { revalidate: options.revalidate, tags: resolveTags(options.cacheTags, context.variantId) },
  )();

  return { context, page, isPreview: false };
}

export async function renderHomepage({ searchParams }: { searchParams: PageSearchParams }) {
  const { context, page, isPreview } = await loadPublicPage({
    pageKey: "homepage",
    path: "/",
    cacheTags: (variantId) => [`page:${variantId}:homepage`],
    revalidate: 60,
    searchParams,
  });

  if (!page) {
    notFound();
  }

  const data = page.dataJson;
  const whatsappHref = getWhatsappHref(context.globalConfig, context.tenant.name);
  const [heroImage, programs, jobs, blogs, activeOffer] = await Promise.all([
    resolveMediaUrl(stringValue(record(data.hero).image_id)),
    resolveCollectionList(context.variantId, "program", {
      source: "featured",
      pageSize: numberValue(record(data.featured_programs).max_items) || 3,
    }),
    resolveCollectionList(context.variantId, "job", {
      source: "latest_active",
      pageSize: numberValue(record(data.latest_jobs).max_items) || 5,
      activeOnly: true,
    }),
    resolveCollectionList(context.variantId, "blog", {
      source: "latest_published",
      pageSize: numberValue(record(data.latest_blogs).max_items) || 5,
    }),
    resolveActiveOffer(context.variantId),
  ]);
  const hero = record(data.hero);
  const offerSection = record(data.offer_section);
  const offerData = activeOffer?.dataJson ?? {};

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      {heroImage ? (
        <HeroSection
          mediaType="image"
          mediaSrc={heroImage}
          mediaAlt={stringValue(hero.media_alt) || stringValue(hero.headline)}
          headline={stringValue(hero.headline) || page.title}
          subheadline={stringValue(hero.subheadline)}
          eyebrowLabel={stringValue(hero.eyebrow_label)}
          primaryCTA={{
            label: stringValue(hero.primary_cta_label) || "Konsultasi Gratis",
            href: whatsappHref,
            variant: "whatsapp",
          }}
          secondaryCTA={
            stringValue(hero.secondary_cta_label)
              ? {
                  label: stringValue(hero.secondary_cta_label),
                  href: stringValue(hero.secondary_cta_href) || "/program",
                }
              : undefined
          }
          priority
        />
      ) : (
        <PlainHero title={stringValue(hero.headline) || page.title} subtitle={stringValue(hero.subheadline)} />
      )}
      <OfferBanner
        isEnabled={booleanValue(offerSection.is_enabled, Boolean(activeOffer))}
        badgeLabel={stringValue(offerData.badge_label) || stringValue(offerSection.fallback_badge_label)}
        headline={
          activeOffer?.title ||
          stringValue(offerSection.fallback_headline) ||
          "Promo Program"
        }
        description={activeOffer?.excerpt || stringValue(offerSection.fallback_description)}
        imageSrc={activeOffer?.thumbnailSrc}
        ctaLabel="Lihat Penawaran"
        ctaHref={activeOffer ? `/offer/${activeOffer.slug}` : undefined}
      />
      <StatsBar items={arrayOfRecords(data.stats).map(toStatItem)} />
      <CardGrid
        title="Kenapa Memilih Kami"
        items={arrayOfRecords(data.trust_cards).map((item, index) => ({
          id: String(index),
          title: stringValue(item.headline) || stringValue(item.title),
          description: stringValue(item.description),
          iconKey: stringValue(item.icon_key),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title="Program Unggulan"
        items={programs.items.map((item) => collectionCard(item, "/program"))}
        ctaLabel="Lihat Semua Program"
        ctaHref="/program"
      />
      <CollectionList
        items={jobs.items.map(toListItem)}
        total={jobs.total}
        page={jobs.page}
        pageSize={jobs.pageSize}
        totalPages={jobs.totalPages}
        detailPathPrefix="/job"
      />
      <StepFlow
        title="Alur Pendaftaran"
        items={arrayOfRecords(data.steps).map((item, index) => ({
          iconKey: stringValue(item.icon_key) || "check",
          title: stringValue(item.title),
          description: stringValue(item.description),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <TestimonialCarousel
        title="Cerita Alumni"
        items={arrayOfRecords(data.testimonials).map((item) => ({
          name: stringValue(item.name),
          roleOrProgram: stringValue(item.role_or_program),
          quote: stringValue(item.quote),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <FAQ title="Pertanyaan Umum" items={arrayOfRecords(data.faqs).map(toFaqItem)} />
      <CardGrid
        title="Artikel Terbaru"
        items={blogs.items.map((item) => collectionCard(item, "/blog"))}
        ctaLabel="Lihat Semua Artikel"
        ctaHref="/blog"
      />
      <ContactSection globalConfig={context.globalConfig} whatsappHref={whatsappHref} />
      <CTABanner
        headline="Siap mulai perjalanan kerja ke Jepang?"
        description="Tim kami siap membantu memilih program yang sesuai."
        primaryCTA={{ label: "Chat WhatsApp", href: whatsappHref, variant: "whatsapp" }}
      />
    </>
  );
}

export async function renderListPage(options: ListPageOptions) {
  const { context, page, isPreview } = await loadPublicPage(options);

  if (!page) {
    notFound();
  }

  const params = await options.searchParams;
  const filters = readFilters(params);
  const currentPage = numberFromParam(params.page) || 1;
  const [collection, filterDefs] = await Promise.all([
    unstable_cache(
      () =>
        resolveCollectionList(context.variantId, options.collectionKey, {
          filters,
          page: currentPage,
          pageSize: 12,
          activeOnly: options.activeOnly,
        }),
      ["public-collection", context.variantId, options.collectionKey, JSON.stringify(filters), String(currentPage)],
      {
        revalidate: options.revalidate,
        tags: resolveTags(options.cacheTags, context.variantId),
      },
    )(),
    Promise.all(options.optionSetKeys.map((key) => resolveOptionSet(context.variantId, key))),
  ]);
  const hero = record(page.dataJson.hero);

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <PlainHero title={stringValue(hero.headline) || page.title} subtitle={stringValue(hero.subheadline)} />
      <CollectionList
        items={collection.items.map(toListItem)}
        total={collection.total}
        page={collection.page}
        pageSize={collection.pageSize}
        totalPages={collection.totalPages}
        currentFilters={filters}
        filters={options.optionSetKeys.map((key, index) => ({
          key,
          label: formatLabel(key),
          isEnabled: true,
          options: filterDefs[index].map((option) => ({
            label: option.label,
            value: option.id,
          })),
        }))}
        detailPathPrefix={options.detailPathPrefix}
      />
    </>
  );
}

export async function renderDetailPage(options: DetailPageOptions) {
  const context = await getOkContext();
  const params = options.searchParams ? await options.searchParams : {};
  const path = `${options.pathPrefix}/${options.slug}`;
  const preview = await getPreviewState(params, context.tenant.id, path);
  const item = preview.isPreview
    ? await resolveCollectionItem(context.variantId, options.collectionKey, options.slug, {
        preview: true,
        token: preview.token,
      })
    : await unstable_cache(
        () => resolveCollectionItem(context.variantId, options.collectionKey, options.slug),
        ["public-item", context.variantId, options.collectionKey, options.slug],
        { revalidate: options.revalidate, tags: resolveTags(options.cacheTags, context.variantId) },
      )();

  if (!item) {
    notFound();
  }

  if (preview.isPreview) {
    noStore();
  }

  return (
    <>
      <PreviewBanner isPreview={preview.isPreview} />
      <CollectionDetail
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: formatLabel(options.collectionKey), href: options.pathPrefix },
          { label: item.title },
        ]}
        mainContent={<DetailMain item={item} collectionKey={options.collectionKey} />}
        sidebar={<DetailSidebar item={item} globalConfig={context.globalConfig} tenantName={context.tenant.name} />}
      />
      {options.collectionKey === "blog" ? (
        <RelatedForBlog variantId={context.variantId} currentSlug={item.slug} />
      ) : null}
    </>
  );
}

export async function generatePublicMetadata({
  pageKey,
  path,
  titleFallback,
  searchParams,
}: {
  pageKey: string;
  path: string;
  titleFallback: string;
  searchParams?: PageSearchParams;
}): Promise<Metadata> {
  const context = await getOkContext();
  const params = searchParams ? await searchParams : {};
  const isPreview = readParam(params.preview) === "true";
  const page = await resolvePageData(context.variantId, pageKey);
  const data = page?.dataJson ?? {};
  const hero = record(data.hero);
  const imageUrl = await resolveMediaUrl(stringValue(hero.image_id));
  const fallbackImageUrl = await resolveDefaultOgImage(context.globalConfig);

  return buildMetadata({
    title: `${stringValue(hero.headline) || page?.title || titleFallback} | ${context.tenant.name}`,
    description: stringValue(hero.subheadline),
    imageUrl: imageUrl || fallbackImageUrl,
    path,
    robots: isPreview ? "noindex" : "index, follow",
  });
}

export async function generateItemMetadata({
  collectionKey,
  slug,
  path,
  searchParams,
}: {
  collectionKey: string;
  slug: string;
  path: string;
  searchParams?: PageSearchParams;
}): Promise<Metadata> {
  const context = await getOkContext();
  const params = searchParams ? await searchParams : {};
  const isPreview = readParam(params.preview) === "true";
  const item = await resolveCollectionItem(context.variantId, collectionKey, slug);
  const fallbackImageUrl = await resolveDefaultOgImage(context.globalConfig);

  return buildMetadata({
    title: `${item?.title || formatLabel(collectionKey)} | ${context.tenant.name}`,
    description: item?.excerpt,
    imageUrl: item?.heroSrc || item?.thumbnailSrc || fallbackImageUrl,
    path,
    robots: isPreview ? "noindex" : "index, follow",
  });
}

async function getOkContext() {
  const context = await getSiteContext();

  if (context.result.type !== "ok") {
    notFound();
  }

  return {
    ...context,
    tenant: context.result.tenant,
    variant: context.result.variant,
    variantId: context.result.variant.id,
    variantKey: context.result.variant.variantKey,
    globalConfig: context.globalConfig ?? {},
  };
}

async function getPreviewState(
  params: PublicPageSearchParams,
  tenantId: string,
  normalPath: string,
) {
  const token = readParam(params.token);
  const isPreview = readParam(params.preview) === "true" && Boolean(token);

  if (!isPreview || !token) {
    return { isPreview: false, token: undefined };
  }

  const valid = await resolvePreviewToken(token, tenantId);

  if (!valid.valid) {
    redirect(normalPath);
  }

  return { isPreview: true, token };
}

async function buildMetadata({
  title,
  description,
  imageUrl,
  path,
  robots,
}: {
  title: string;
  description?: string;
  imageUrl?: string | null;
  path: string;
  robots: "index, follow" | "noindex";
}): Promise<Metadata> {
  const host = (await headers()).get("host") || "";
  const canonical = host ? `https://${host}${path}` : path;
  const defaultOgImage = host ? `https://${host}/opengraph-image` : "/opengraph-image";

  return {
    title,
    description: truncate(description || "", 160),
    openGraph: { images: [{ url: imageUrl || defaultOgImage }] },
    robots,
    alternates: { canonical },
  };
}

async function resolveDefaultOgImage(globalConfig: Record<string, PublicJson>) {
  const brandHeader = record(globalConfig.brand_header);
  const footer = record(globalConfig.footer);
  const candidateIds = [
    stringValue(record(brandHeader.brand).logo_image_id),
    stringValue(record(brandHeader.brand).logo_light_image_id),
    stringValue(record(footer.brand).logo_image_id),
  ].filter(Boolean);

  for (const mediaId of candidateIds) {
    const mediaUrl = await resolveMediaUrl(mediaId);

    if (mediaUrl) {
      return mediaUrl;
    }
  }

  return null;
}

function DetailMain({
  item,
  collectionKey,
}: {
  item: PublicCollectionItem;
  collectionKey: string;
}) {
  const blocks = arrayOfRecords(item.dataJson.blocks);

  return (
    <article>
      <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h1>
      {item.isExpired ? <ExpiredBadge type={collectionKey === "job" ? "job" : "offer"} /> : null}
      {item.excerpt ? <p className="mt-4 text-lg leading-8 text-neutral-600">{item.excerpt}</p> : null}
      {blocks.length > 0 ? (
        <div className="mt-8">
          <ContentBlocks
            variant="indonesia"
            blocks={blocks.map((block, index) => ({
              type: stringValue(block.type) as never,
              sortOrder: numberValue(block.sort_order) ?? numberValue(block.sortOrder) ?? index,
              data: record(block.data),
            }))}
          />
        </div>
      ) : (
        <FallbackDataView data={item.dataJson} />
      )}
    </article>
  );
}

function DetailSidebar({
  item,
  globalConfig,
  tenantName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
}) {
  const whatsappHref = getWhatsappHref(globalConfig, tenantName, {
    program_name: item.title,
    job_title: item.title,
  });

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Informasi</h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {item.publishedAt ? <MetaRow label="Publish" value={formatDate(item.publishedAt)} /> : null}
          {item.expiredAt ? <MetaRow label="Berlaku sampai" value={formatDate(item.expiredAt)} /> : null}
          <MetaRow label="Status" value={item.isExpired ? "Expired" : item.status} />
        </dl>
        <Button
          render={<a href={item.isExpired ? "#" : whatsappHref} />}
          disabled={item.isExpired}
          variant="whatsapp"
          className="mt-6 w-full"
        >
          {item.isExpired ? "Pendaftaran ditutup" : "Daftar via WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

async function RelatedForBlog({
  variantId,
  currentSlug,
}: {
  variantId: string;
  currentSlug: string;
}) {
  const related = await resolveCollectionList(variantId, "blog", {
    source: "latest_published",
    pageSize: 4,
  });

  return (
    <RelatedItems
      items={related.items
        .filter((item) => item.slug !== currentSlug)
        .slice(0, 3)
        .map((item) => ({
          title: item.title,
          excerpt: item.excerpt,
          slug: item.slug,
          thumbnailSrc: item.thumbnailSrc,
          publishedAt: item.publishedAt ? formatDate(item.publishedAt) : undefined,
          detailPath: `/blog/${item.slug}`,
        }))}
    />
  );
}

function ContactSection({
  globalConfig,
  whatsappHref,
}: {
  globalConfig: Record<string, PublicJson>;
  whatsappHref: string;
}) {
  const whatsappContact = record(globalConfig.whatsapp_contact);
  const contact = record(whatsappContact.contact);
  const socialLinks = record(whatsappContact.social_links);

  return (
    <ContactInfo
      headline="Hubungi Kami"
      phone={stringValue(contact.phone_label)}
      email={stringValue(contact.email)}
      address={stringValue(contact.address)}
      mapUrl={stringValue(contact.map_url)}
      operationalHours={stringValue(contact.operational_hours)}
      socialLinks={{
        instagram: stringValue(socialLinks.instagram),
        youtube: stringValue(socialLinks.youtube),
        tiktok: stringValue(socialLinks.tiktok),
        facebook: stringValue(socialLinks.facebook),
        line: stringValue(socialLinks.line),
      }}
      ctaLabel="Chat WhatsApp"
      ctaHref={whatsappHref}
      ctaVariant="whatsapp"
    />
  );
}

function PlainHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-neutral-950 py-20 text-white md:py-24">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p> : null}
      </Container>
    </section>
  );
}

function PreviewBanner({ isPreview }: { isPreview: boolean }) {
  return isPreview ? (
    <div className="sticky top-0 z-50 bg-amber-100 px-4 py-3 text-center text-sm font-semibold text-amber-950">
      Preview mode - konten draft, tidak di-cache
    </div>
  ) : null;
}

function FallbackDataView({ data }: { data: PublicJson }) {
  const entries = Object.entries(data).filter(([, value]) => Boolean(value));

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4 text-neutral-700">
      {entries.map(([key, value]) => (
        <section key={key}>
          <h2 className="text-xl font-semibold text-neutral-900">{formatLabel(key)}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6">
            {typeof value === "string" || typeof value === "number"
              ? String(value)
              : JSON.stringify(value, null, 2)}
          </p>
        </section>
      ))}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function toListItem(item: PublicCollectionItem) {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.excerpt,
    slug: item.slug,
    thumbnailSrc: item.thumbnailSrc,
    status: item.status,
    meta: item.publishedAt ? formatDate(item.publishedAt) : undefined,
    expiredAt: item.expiredAt ? `Berakhir ${formatDate(item.expiredAt)}` : undefined,
    isExpired: item.isExpired,
    isFeatured: item.isFeatured,
    badge: stringValue(item.dataJson.highlight_label),
  };
}

function collectionCard(item: PublicCollectionItem, pathPrefix: string) {
  return {
    id: item.id,
    title: item.title,
    description: item.excerpt,
    href: `${pathPrefix}/${item.slug}`,
    imageSrc: item.thumbnailSrc,
    badge: stringValue(item.dataJson.highlight_label),
    isEnabled: true,
  };
}

function toStatItem(item: PublicJson) {
  return {
    iconKey: stringValue(item.icon_key) || "check",
    value: stringValue(item.value),
    label: stringValue(item.label),
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function toFaqItem(item: PublicJson, index: number) {
  return {
    question: stringValue(item.question),
    answer: stringValue(item.answer),
    sortOrder: numberValue(item.sort_order) ?? index,
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function getWhatsappHref(
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  replacements: Record<string, string> = {},
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);
  const template =
    stringValue(whatsapp.default_message_template) ||
    "Halo, saya ingin konsultasi dengan {lpk_name}.";

  return number
    ? buildWhatsAppUrl(number, template, { lpk_name: lpkName, ...replacements })
    : "#";
}

function resolveTags(
  tags: string[] | ((variantId: string) => string[]),
  variantId: string,
) {
  return typeof tags === "function" ? tags(variantId) : tags;
}

function readFilters(params: PublicPageSearchParams) {
  const ignoredKeys = new Set(["page", "preview", "token"]);

  return Object.entries(params).reduce<Record<string, string>>((filters, [key, value]) => {
    const param = readParam(value);

    if (param && !ignoredKeys.has(key)) {
      filters[key] = param;
    }

    return filters;
  }, {});
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberFromParam(value: string | string[] | undefined) {
  const number = Number(readParam(value));
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : undefined;
}

function record(value: unknown): PublicJson {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as PublicJson)
    : {};
}

function arrayOfRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function isRecord(value: unknown): value is PublicJson {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", { dateStyle: "medium" });
}
