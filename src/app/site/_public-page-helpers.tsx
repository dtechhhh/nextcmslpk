import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";

import { getSiteContext } from "@/app/site/site-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  resolveActiveOffer,
  resolveCollectionItem,
  resolveCollectionList,
  resolveMediaUrl,
  resolveMediaUrls,
  resolveOptionLabel,
  resolveOptionSet,
  resolvePageData,
  resolvePreviewToken,
  type PublicCollectionItem,
  type PublicJson,
  type PublicPageSearchParams,
} from "@/server/resolvers/public";
import {
  JapanAboutPage,
  JapanCandidateProfilePage,
  JapanContactPage,
  JapanHomepage,
  JapanNewsDetailPage,
  JapanNewsListPage,
  JapanRecruitmentNetworkPage,
  JapanSectorDetailPage,
  JapanSectorListPage,
  JapanTrainingMethodPage,
} from "@/themes/starter/pages/japan/JapanPublicPages";
import { Badge } from "@/themes/starter/components/ui/Badge";
import { Button } from "@/themes/starter/components/ui/Button";
import { Container } from "@/themes/starter/components/ui/Container";
import { Card, CardContent } from "@/themes/starter/components/ui/Card";
import { CardGrid } from "@/themes/starter/components/sections/CardGrid";
import { CollectionDetail } from "@/themes/starter/components/sections/CollectionDetail";
import { CollectionList } from "@/themes/starter/components/sections/CollectionList";
import { ContactInfo } from "@/themes/starter/components/sections/ContactInfo";
import { ContentBlocks, type ContentBlock, type ContentBlockType } from "@/themes/starter/components/sections/ContentBlocks";
import { CTABanner } from "@/themes/starter/components/sections/CTABanner";
import { ExpiredBadge } from "@/themes/starter/components/sections/ExpiredBadge";
import { FAQ } from "@/themes/starter/components/sections/FAQ";
import { DocumentDownload } from "@/themes/starter/components/sections/DocumentDownload";
import { FacilityGallery } from "@/themes/starter/components/sections/FacilityGallery";
import { HeroSection } from "@/themes/starter/components/sections/HeroSection";
import { OfferBanner } from "@/themes/starter/components/sections/OfferBanner";
import { RelatedItems } from "@/themes/starter/components/sections/RelatedItems";
import { StatsBar } from "@/themes/starter/components/sections/StatsBar";
import { StepFlow } from "@/themes/starter/components/sections/StepFlow";
import { TeamGrid } from "@/themes/starter/components/sections/TeamGrid";
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
  cardLabelOptionKeys?: string[];
  cardMetaKeys?: string[];
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
  if (context.variantKey === "japan") {
    const latestNewsConfig = record(data.latest_news);
    const latestNews = await resolveCollectionList(context.variantId, "news", {
      source: "latest_published",
      pageSize: numberValue(latestNewsConfig.max_items) || 4,
    });

    return (
      <JapanHomepage
        page={page}
        globalConfig={context.globalConfig}
        tenantName={getLpkName(context.globalConfig, context.tenant.name)}
        variantId={context.variantId}
        isPreview={isPreview}
        latestNews={latestNews.items}
      />
    );
  }

  const hero = record(data.hero);
  const lpkName = getLpkName(context.globalConfig, context.tenant.name);
  const defaultWhatsappHref = getWhatsappHref(context.globalConfig, context.tenant.name);
  const heroWhatsappMessage = stringValue(hero.primary_cta_whatsapp_message);
  const whatsappHref = heroWhatsappMessage
    ? buildHeroWhatsappHref(context.globalConfig, lpkName, heroWhatsappMessage)
    : defaultWhatsappHref;
  const heroMediaId = stringValue(hero.media_id) || stringValue(hero.image_id);
  const featuredProgramsConfig = record(data.featured_programs);
  const offerSection = record(data.offer_section);
  const contactSection = record(data.contact_section);
  const [heroImage, programs, jobs, blogs, offerPayload] = await Promise.all([
    resolveMediaUrl(heroMediaId),
    resolveFeaturedPrograms(context.variantId, featuredProgramsConfig),
    resolveCollectionList(context.variantId, "job", {
      source: "latest_active",
      pageSize: numberValue(record(data.latest_jobs).max_items) || 5,
      activeOnly: true,
    }),
    resolveCollectionList(context.variantId, "blog", {
      source: "latest_published",
      pageSize: numberValue(record(data.latest_blogs).max_items) || 5,
    }),
    resolveOfferSectionPayload(context.variantId, offerSection),
  ]);
  const offerItem = offerPayload.item;
  const offerData = offerItem?.dataJson ?? {};

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
            label: stringValue(hero.primary_cta_label) || "Konsultasi Gratis via WhatsApp",
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
        <PlainHero
          title={stringValue(hero.headline) || page.title}
          subtitle={stringValue(hero.subheadline)}
          primaryCTA={{
            label: stringValue(hero.primary_cta_label) || "Konsultasi Gratis via WhatsApp",
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
        />
      )}
      <OfferBanner
        isEnabled={
          !offerPayload.isDisabled &&
          booleanValue(
            offerSection.is_enabled,
            Boolean(offerItem || stringValue(offerSection.fallback_headline)),
          )
        }
        badgeLabel={stringValue(offerData.badge_label) || stringValue(offerSection.fallback_badge_label)}
        headline={
          offerItem?.title ||
          stringValue(offerSection.fallback_headline) ||
          "Promo Program"
        }
        description={offerItem?.excerpt || stringValue(offerSection.fallback_description)}
        imageSrc={offerItem?.thumbnailSrc || offerPayload.fallbackImageSrc || undefined}
        ctaLabel="Lihat Penawaran"
        ctaHref={offerItem ? `/offer/${offerItem.slug}` : undefined}
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
        items={await Promise.all(programs.items.map((item) => collectionCard(item, "/program", ["program_type"])))}
        ctaLabel="Lihat Semua Program"
        ctaHref="/program"
      />
      <CollectionList
        title="Lowongan Terbaru"
        items={await Promise.all(jobs.items.map(async (item) => {
          const labels = await resolveItemLabels(item, ["job_field", "job_type"]);
          return toListItem(item, labels, ["location_label"]);
        }))}
        total={jobs.total}
        page={jobs.page}
        pageSize={jobs.pageSize}
        totalPages={jobs.totalPages}
        detailPathPrefix="/job"
        ctaLabel="Lihat Semua Lowongan"
        ctaHref="/job"
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
        items={await Promise.all(blogs.items.map((item) => collectionCard(item, "/blog", ["category"])))}
        ctaLabel="Lihat Semua Artikel"
        ctaHref="/blog"
      />
      <ContactSection
        headline={stringValue(contactSection.headline) || "Hubungi Kami"}
        description={stringValue(contactSection.description)}
        globalConfig={context.globalConfig}
        whatsappHref={whatsappHref}
        showGlobalContact={booleanValue(contactSection.use_global_contact, true)}
      />
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
  const currentPage = numberFromParam(params.page) || 1;
  const data = page.dataJson;
  const enabledOptionSetKeys = getEnabledIndonesiaFilterKeys(data, options.optionSetKeys);
  const filters = pickFilters(readFilters(params), enabledOptionSetKeys);
  const hero = record(data.hero);
  const heroMediaId = stringValue(hero.media_id) || stringValue(hero.image_id);
  const lpkName = getLpkName(context.globalConfig, context.tenant.name);
  const defaultWhatsappHref = getWhatsappHref(context.globalConfig, context.tenant.name);
  const heroWhatsappMessage = stringValue(hero.primary_cta_whatsapp_message);
  const whatsappHref = heroWhatsappMessage
    ? buildHeroWhatsappHref(context.globalConfig, lpkName, heroWhatsappMessage)
    : defaultWhatsappHref;
  const finalCta = record(data.final_cta);
  const finalCtaHeadline = stringValue(finalCta.headline);
  const finalCtaDescription = stringValue(finalCta.description);
  const finalCtaLabel = stringValue(finalCta.cta_label);
  const finalCtaMessage = stringValue(finalCta.whatsapp_message_template);
  const finalCtaHref = finalCtaMessage
    ? buildHeroWhatsappHref(context.globalConfig, lpkName, finalCtaMessage)
    : defaultWhatsappHref;

  const listOfferSection = record(data.offer_section);
  const shouldResolveOffer =
    options.pageKey === "blog_page" &&
    booleanValue(listOfferSection.is_enabled, stringValue(listOfferSection.source) !== "disabled");
  const [heroImage, collection, filterDefs, offerPayload] = await Promise.all([
    heroMediaId ? resolveMediaUrl(heroMediaId) : Promise.resolve(null),
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
    Promise.all(enabledOptionSetKeys.map((key) => resolveOptionSet(context.variantId, key))),
    shouldResolveOffer
      ? resolveOfferSectionPayload(context.variantId, listOfferSection)
      : Promise.resolve({ item: null, fallbackImageSrc: null, isDisabled: false }),
  ]);
  const offerItem = offerPayload.item;
  const offerData = offerItem?.dataJson ?? {};

  const itemsWithLabels = options.cardLabelOptionKeys?.length
    ? await Promise.all(
        collection.items.map(async (item) => {
          const labels = await resolveItemLabels(item, options.cardLabelOptionKeys!);
          return toListItem(item, labels, options.cardMetaKeys);
        }),
      )
    : collection.items.map((item) => toListItem(item, undefined, options.cardMetaKeys));

  const heroHeadline = stringValue(hero.headline) || page.title;
  const heroSubheadline = stringValue(hero.subheadline);
  const heroPrimaryCTA = stringValue(hero.primary_cta_label)
    ? { label: stringValue(hero.primary_cta_label), href: whatsappHref, variant: "whatsapp" as const }
    : undefined;
  const heroSecondaryCTA = stringValue(hero.secondary_cta_label)
    ? { label: stringValue(hero.secondary_cta_label), href: stringValue(hero.secondary_cta_href) || "/program" }
    : undefined;

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      {heroImage ? (
        <HeroSection
          mediaType="image"
          mediaSrc={heroImage}
          mediaAlt={stringValue(hero.media_alt) || heroHeadline}
          headline={heroHeadline}
          subheadline={heroSubheadline}
          primaryCTA={heroPrimaryCTA}
          secondaryCTA={heroSecondaryCTA}
          priority
        />
      ) : (
        <PlainHero
          title={heroHeadline}
          subtitle={heroSubheadline}
          primaryCTA={heroPrimaryCTA}
          secondaryCTA={heroSecondaryCTA}
        />
      )}
      {shouldResolveOffer ? (
        <OfferBanner
          isEnabled={Boolean(offerItem)}
          badgeLabel={stringValue(offerData.badge_label)}
          headline={offerItem?.title || "Promo Program"}
          description={offerItem?.excerpt || stringValue(offerData.short_description)}
          imageSrc={offerItem?.thumbnailSrc}
          ctaLabel="Lihat Penawaran"
          ctaHref={offerItem ? `/offer/${offerItem.slug}` : undefined}
        />
      ) : null}
      <StatsBar items={arrayOfRecords(data.stats).map(toStatItem)} />
      <CollectionList
        items={itemsWithLabels}
        total={collection.total}
        page={collection.page}
        pageSize={collection.pageSize}
        totalPages={collection.totalPages}
        currentFilters={filters}
        filters={enabledOptionSetKeys.map((key, index) => ({
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
      <FAQ title="Pertanyaan Umum" items={arrayOfRecords(data.faq).map(toFaqItem)} />
      {finalCtaHeadline || finalCtaDescription || finalCtaLabel ? (
        <CTABanner
          headline={finalCtaHeadline || "Siap mulai perjalanan kerja ke Jepang?"}
          description={finalCtaDescription}
          primaryCTA={{
            label: finalCtaLabel || "Chat WhatsApp",
            href: finalCtaHref,
            variant: "whatsapp",
          }}
        />
      ) : null}
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

  if (options.collectionKey === "program") {
    const lpkName = getLpkName(context.globalConfig, context.tenant.name);
    const fallbackHeroImage = getDetailHeroSrc(item)
      ? undefined
      : await resolveDetailPageHeroSrc(context.variantId, "program_page");

    return (
      <>
        <PreviewBanner isPreview={preview.isPreview} />
        <ProgramDetailHero item={item} fallbackImageSrc={fallbackHeroImage ?? undefined} />
        <CollectionDetail
          breadcrumb={[
            { label: "Beranda", href: "/" },
            { label: "Program", href: "/program" },
            { label: item.title },
          ]}
          mainContent={
            <ProgramDetailMain item={item} globalConfig={context.globalConfig} lpkName={lpkName} />
          }
          sidebar={
            <ProgramDetailSidebar
              item={item}
              globalConfig={context.globalConfig}
              lpkName={lpkName}
            />
          }
        />
      </>
    );
  }

  if (options.collectionKey === "job") {
    const lpkName = getLpkName(context.globalConfig, context.tenant.name);
    const fallbackHeroImage = getDetailHeroSrc(item)
      ? undefined
      : await resolveDetailPageHeroSrc(context.variantId, "job_page");

    return (
      <>
        <PreviewBanner isPreview={preview.isPreview} />
        <JobDetailHero item={item} fallbackImageSrc={fallbackHeroImage ?? undefined} />
        <CollectionDetail
          breadcrumb={[
            { label: "Beranda", href: "/" },
            { label: "Lowongan", href: "/job" },
            { label: item.title },
          ]}
          mainContent={
            <JobDetailMain item={item} globalConfig={context.globalConfig} lpkName={lpkName} />
          }
          sidebar={
            <JobDetailSidebar
              item={item}
              globalConfig={context.globalConfig}
              lpkName={lpkName}
            />
          }
        />
      </>
    );
  }

  if (options.collectionKey === "blog") {
    const lpkName = getLpkName(context.globalConfig, context.tenant.name);
    const blocks = await resolveIndonesiaContentBlocks(
      arrayOfRecords(item.dataJson.content_blocks),
      context.variantId,
      context.globalConfig,
      lpkName,
      item.title,
    );
    const categoryOption = await resolveOptionLabel(
      stringValue(item.dataJson.category_option_id),
    );
    const tagOptionIds = flatStringList(item.dataJson.tag_option_ids);
    const tagOptions = await Promise.all(
      tagOptionIds.map((id) => resolveOptionLabel(id)),
    );
    const tagLabels = tagOptions
      .map((opt) => opt?.label ?? "")
      .filter(Boolean);
    const coverImageUrl = await resolveMediaUrl(
      stringValue(item.dataJson.cover_image_id),
    );
    const authorImageUrl = await resolveMediaUrl(
      stringValue(item.dataJson.author_image_id),
    );

    return (
      <>
        <PreviewBanner isPreview={preview.isPreview} />
        <BlogDetailHero
          item={item}
          coverImageUrl={coverImageUrl}
          categoryLabel={categoryOption?.label}
          tagLabels={tagLabels}
          authorImageUrl={authorImageUrl}
        />
        <CollectionDetail
          breadcrumb={[
            { label: "Beranda", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: item.title },
          ]}
          mainContent={
            <BlogDetailContent item={item} blocks={blocks} />
          }
          sidebar={
            <BlogDetailSidebar
              item={item}
              globalConfig={context.globalConfig}
              tenantName={lpkName}
              categoryLabel={categoryOption?.label}
              tagLabels={tagLabels}
            />
          }
        />
        <RelatedForBlog variantId={context.variantId} currentSlug={item.slug} />
      </>
    );
  }

  if (options.collectionKey === "karir") {
    const lpkName = getLpkName(context.globalConfig, context.tenant.name);
    const fallbackHeroImage = getDetailHeroSrc(item)
      ? undefined
      : await resolveDetailPageHeroSrc(context.variantId, "karir_page");

    return (
      <>
        <PreviewBanner isPreview={preview.isPreview} />
        <KarirDetailHero item={item} fallbackImageSrc={fallbackHeroImage ?? undefined} />
        <CollectionDetail
          breadcrumb={[
            { label: "Beranda", href: "/" },
            { label: "Karir", href: "/karir" },
            { label: item.title },
          ]}
          mainContent={
            <KarirDetailMain item={item} globalConfig={context.globalConfig} lpkName={lpkName} />
          }
          sidebar={
            <KarirDetailSidebar
              item={item}
              globalConfig={context.globalConfig}
              lpkName={lpkName}
            />
          }
        />
      </>
    );
  }

  if (options.collectionKey === "offer") {
    const lpkName = getLpkName(context.globalConfig, context.tenant.name);
    const whatsappHref = getOfferWhatsappHref(item.dataJson, context.globalConfig, lpkName, item.title);

    return (
      <>
        <PreviewBanner isPreview={preview.isPreview} />
        <OfferDetailHero item={item} />
        <CollectionDetail
          breadcrumb={[
            { label: "Beranda", href: "/" },
            { label: "Penawaran" },
            { label: item.title },
          ]}
          mainContent={
            <OfferDetailMain item={item} />
          }
          sidebar={
            <OfferDetailSidebar
              item={item}
              whatsappHref={whatsappHref}
            />
          }
        />
      </>
    );
  }

  return (
    <>
      <PreviewBanner isPreview={preview.isPreview} />
      <GenericDetailHero item={item} />
      <CollectionDetail
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: formatLabel(options.collectionKey), href: options.pathPrefix },
          { label: item.title },
        ]}
        mainContent={
          <DetailMain
            item={item}
            collectionKey={options.collectionKey}
            showHeading={!getDetailHeroSrc(item)}
          />
        }
        sidebar={<DetailSidebar item={item} globalConfig={context.globalConfig} tenantName={context.tenant.name} />}
      />
    </>
  );
}

async function resolveIndonesiaContentBlocks(
  blocks: PublicJson[],
  variantId: string,
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  blogTitle: string,
) {
  const resolved = await Promise.all(
    blocks.map(async (block, index): Promise<ContentBlock | null> => {
      const type = stringValue(block.type) as ContentBlockType;
      const data = record(block.data);
      const sortOrder = numberValue(block.sort_order) ?? index;

      if (type === "image") {
        const src = await resolveMediaUrl(stringValue(data.image_id));
        return src
          ? {
              type,
              sortOrder,
              data: {
                src,
                alt: stringValue(data.alt_text),
                caption: stringValue(data.caption),
              },
            }
          : null;
      }

      if (type === "youtube_embed") {
        const videoId = stringValue(data.video_id);
        return videoId
          ? {
              type,
              sortOrder,
              data: {
                src: `https://www.youtube.com/embed/${videoId}`,
                title: stringValue(data.caption) || "Video YouTube",
              },
            }
          : null;
      }

      if (type === "quote") {
        return {
          type,
          sortOrder,
          data: {
            quote: stringValue(data.text) || stringValue(data.quote),
            author: stringValue(data.author),
          },
        };
      }

      if (type === "offer_callout") {
        const offerId = stringValue(data.offer_id);
        const offer = offerId
          ? (await resolveCollectionList(variantId, "offer", {
              source: "manual",
              manualIds: [offerId],
              pageSize: 1,
            })).items[0]
          : null;
        return offer
          ? {
              type,
              sortOrder,
              data: {
                title: offer.title,
                description:
                  offer.excerpt || stringValue(offer.dataJson.short_description),
                ctaLabel: "Lihat Penawaran",
                ctaHref: `/offer/${offer.slug}`,
              },
            }
          : null;
      }

      if (type === "whatsapp_cta") {
        const label = stringValue(data.label) || "Hubungi via WhatsApp";
        const template = stringValue(data.whatsapp_message_template);
        const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
        const number = stringValue(whatsapp.number);
        const href = number
          ? buildWhatsAppUrl(
              number,
              template || "Halo, saya tertarik dengan artikel ini.",
              { lpk_name: lpkName, blog_title: blogTitle },
            )
          : null;
        return href ? { type, sortOrder, data: { label, href } } : null;
      }

      if (type === "heading" || type === "paragraph") {
        return { type, sortOrder, data };
      }

      return null;
    }),
  );

  return resolved.filter((block): block is ContentBlock => Boolean(block));
}

function BlogDetailHero({
  item,
  coverImageUrl,
  categoryLabel,
  tagLabels,
  authorImageUrl,
}: {
  item: PublicCollectionItem;
  coverImageUrl?: string | null;
  categoryLabel?: string;
  tagLabels: string[];
  authorImageUrl?: string | null;
}) {
  const imageSrc = coverImageUrl || getDetailHeroSrc(item);
  const authorName = stringValue(item.dataJson.author_name);
  const authorTitle = stringValue(item.dataJson.author_title);
  const readingTimeLabel = stringValue(item.dataJson.reading_time_label);

  return (
    <section>
      {imageSrc ? (
        <div className="relative aspect-[21/9] overflow-hidden bg-neutral-200">
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}
      <Container className="py-8">
        <div className="flex flex-wrap items-center gap-3">
          {item.publishedAt ? (
            <time className="text-sm text-neutral-500">
              {formatDate(item.publishedAt)}
            </time>
          ) : null}
          {readingTimeLabel ? (
            <span className="text-sm text-neutral-500">{readingTimeLabel}</span>
          ) : null}
          {categoryLabel ? (
            <Badge variant="outline">{categoryLabel}</Badge>
          ) : null}
          {tagLabels.length > 0
            ? tagLabels.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))
            : null}
        </div>
        {(authorName || authorImageUrl) ? (
          <div className="mt-6 flex items-center gap-4">
            {authorImageUrl ? (
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={authorImageUrl}
                  alt={authorName || ""}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div>
              {authorName ? (
                <span className="text-sm font-semibold text-neutral-900">
                  {authorName}
                </span>
              ) : null}
              {authorTitle ? (
                <p className="text-sm text-neutral-500">{authorTitle}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function BlogDetailContent({
  item,
  blocks,
}: {
  item: PublicCollectionItem;
  blocks: ContentBlock[];
}) {
  return (
    <article>
      <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
        {item.title}
      </h1>
      {item.excerpt ? (
        <p className="mt-4 text-lg leading-8 text-neutral-600">
          {item.excerpt}
        </p>
      ) : null}
      {blocks.length > 0 ? (
        <div className="mt-8">
          <ContentBlocks variant="indonesia" blocks={blocks} />
        </div>
      ) : null}
    </article>
  );
}

function BlogDetailSidebar({
  item,
  globalConfig,
  tenantName,
  categoryLabel,
  tagLabels,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  categoryLabel?: string;
  tagLabels: string[];
}) {
  const whatsappHref = getWhatsappHref(globalConfig, tenantName, {
    blog_title: item.title,
  });
  const authorName = stringValue(item.dataJson.author_name);
  const authorTitle = stringValue(item.dataJson.author_title);
  const authorBio = stringValue(item.dataJson.author_bio);
  const readingTimeLabel = stringValue(item.dataJson.reading_time_label);

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">
          Detail Artikel
        </h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {item.publishedAt ? (
            <MetaRow label="Dipublikasi" value={formatDate(item.publishedAt)} />
          ) : null}
          {readingTimeLabel ? (
            <MetaRow label="Waktu baca" value={readingTimeLabel} />
          ) : null}
          {categoryLabel ? (
            <MetaRow label="Kategori" value={categoryLabel} />
          ) : null}
          {tagLabels.length > 0
            ? tagLabels.map((tag) => (
                <MetaRow key={tag} label="Tag" value={tag} />
              ))
            : null}
          {authorName ? (
            <MetaRow label="Penulis" value={authorName} />
          ) : null}
          {authorTitle ? (
            <MetaRow label="Jabatan" value={authorTitle} />
          ) : null}
        </dl>
        {authorBio ? (
          <p className="mt-4 text-sm leading-6 text-neutral-500">
            {authorBio}
          </p>
        ) : null}
        <Button
          render={<a href={whatsappHref} />}
          variant="whatsapp"
          className="mt-6 w-full"
        >
          Konsultasi via WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}

type JapanStaticPageKind =
  | "about"
  | "training_method"
  | "candidate_profile"
  | "recruitment_network"
  | "contact";

type JapanStaticPageOptions = PageLoadOptions & {
  kind: JapanStaticPageKind;
};

type JapanListPageKind = "sector" | "news";

type JapanListPageOptions = {
  kind: JapanListPageKind;
  pageKey: string;
  collectionKey: "sector" | "news";
  path: string;
  cacheTags: string[] | ((variantId: string) => string[]);
  revalidate: number;
  searchParams: PageSearchParams;
};

type JapanDetailPageOptions = {
  collectionKey: "sector" | "news";
  slug: string;
  pathPrefix: string;
  cacheTags: string[] | ((variantId: string) => string[]);
  revalidate: number;
  searchParams?: PageSearchParams;
};

export async function renderJapanStaticPage(options: JapanStaticPageOptions) {
  const { context, page, isPreview } = await loadPublicPage(options);

  if (context.variantKey !== "japan" || !page) {
    notFound();
  }

  const commonProps = {
    page,
    globalConfig: context.globalConfig,
    tenantName: getLpkName(context.globalConfig, context.tenant.name),
    variantId: context.variantId,
    isPreview,
  };

  if (options.kind === "about") {
    return <JapanAboutPage {...commonProps} />;
  }

  if (options.kind === "training_method") {
    return <JapanTrainingMethodPage {...commonProps} />;
  }

  if (options.kind === "candidate_profile") {
    return <JapanCandidateProfilePage {...commonProps} />;
  }

  if (options.kind === "recruitment_network") {
    return <JapanRecruitmentNetworkPage {...commonProps} />;
  }

  return <JapanContactPage {...commonProps} />;
}

export async function renderJapanListPage(options: JapanListPageOptions) {
  const { context, page, isPreview } = await loadPublicPage({
    pageKey: options.pageKey,
    path: options.path,
    cacheTags: options.cacheTags,
    revalidate: options.revalidate,
    searchParams: options.searchParams,
  });

  if (context.variantKey !== "japan" || !page) {
    notFound();
  }

  const params = await options.searchParams;
  const currentPage = numberFromParam(params.page) || 1;
  const filterConfigs = getJapanFilterConfigs(options.kind, page.dataJson);
  const filters = pickFilters(readFilters(params), filterConfigs.map((config) => config.key));
  const [collection, filterDefs] = await Promise.all([
    unstable_cache(
      () =>
        resolveCollectionList(context.variantId, options.collectionKey, {
          filters,
          page: currentPage,
          pageSize: 12,
        }),
      [
        "public-japan-collection",
        context.variantId,
        options.collectionKey,
        JSON.stringify(filters),
        String(currentPage),
      ],
      {
        revalidate: options.revalidate,
        tags: resolveTags(options.cacheTags, context.variantId),
      },
    )(),
    Promise.all(filterConfigs.map((config) => resolveOptionSet(context.variantId, config.optionSetKey))),
  ]);
  const filterBarFilters = filterConfigs.map((config, index) => ({
    key: config.key,
    label: config.label,
    isEnabled: true,
    options: filterDefs[index].map((option) => ({
      label: option.label,
      value: option.id,
    })),
  }));
  const commonProps = {
    page,
    globalConfig: context.globalConfig,
    tenantName: getLpkName(context.globalConfig, context.tenant.name),
    variantId: context.variantId,
    isPreview,
    collection,
    filters: filterBarFilters,
    currentFilters: filters,
  };

  return options.kind === "sector" ? (
    <JapanSectorListPage {...commonProps} />
  ) : (
    <JapanNewsListPage {...commonProps} />
  );
}

export async function renderJapanDetailPage(options: JapanDetailPageOptions) {
  const context = await getOkContext();

  if (context.variantKey !== "japan") {
    notFound();
  }

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
        ["public-japan-item", context.variantId, options.collectionKey, options.slug],
        {
          revalidate: options.revalidate,
          tags: resolveTags(options.cacheTags, context.variantId),
        },
      )();

  if (!item) {
    notFound();
  }

  if (preview.isPreview) {
    noStore();
  }

  const commonProps = {
    item,
    globalConfig: context.globalConfig,
    tenantName: getLpkName(context.globalConfig, context.tenant.name),
    variantId: context.variantId,
    isPreview: preview.isPreview,
  };

  if (options.collectionKey === "sector") {
    return <JapanSectorDetailPage {...commonProps} />;
  }

  const relatedMaxItems = numberValue(item.dataJson.related_max_items) || 3;
  const relatedItems = await resolveCollectionList(context.variantId, "news", {
    source: "latest_published",
    pageSize: relatedMaxItems + 1,
  });

  return <JapanNewsDetailPage {...commonProps} relatedItems={relatedItems.items} />;
}

export async function renderTentangKami({ searchParams }: { searchParams: PageSearchParams }) {
  const { context, page, isPreview } = await loadPublicPage({
    pageKey: "tentang_kami",
    path: "/tentang-kami",
    cacheTags: (variantId) => [`page:${variantId}:tentang_kami`],
    revalidate: 3600,
    searchParams,
  });

  if (!page) {
    notFound();
  }

  if (context.variantKey !== "indonesia") {
    redirect("/about");
  }

  const data = page.dataJson;
  const hero = record(data.hero);
  const story = record(data.story);
  const visionMission = record(data.vision_mission);
  const contactSection = record(data.contact_section);
  const lpkName = getLpkName(context.globalConfig, context.tenant.name);
  const defaultWhatsappHref = getWhatsappHref(context.globalConfig, lpkName);
  const heroWhatsappMessage = stringValue(hero.primary_cta_whatsapp_message);
  const heroWhatsappHref = heroWhatsappMessage
    ? buildHeroWhatsappHref(context.globalConfig, lpkName, heroWhatsappMessage)
    : defaultWhatsappHref;

  const heroImageId = stringValue(hero.media_id) || stringValue(hero.image_id);
  const heroImage = await resolveMediaUrl(heroImageId);

  const galleryMediaIds = flatStringList(record(data.gallery).media_ids);
  const [galleryUrls, teamMembers, partnerCards] = await Promise.all([
    galleryMediaIds.length > 0
      ? resolveMediaUrls(galleryMediaIds)
      : Promise.resolve(new Map<string, string>()),
    resolveTeamMemberCards(sortedRecords(data.team_members)),
    resolvePartnerCards(sortedRecords(data.partners)),
  ]);

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      {heroImage ? (
        <HeroSection
          mediaType={stringValue(hero.media_type) === "video" ? "video" : "image"}
          mediaSrc={heroImage}
          mediaAlt={stringValue(hero.headline) || page.title}
          headline={stringValue(hero.headline) || page.title}
          subheadline={stringValue(hero.subheadline)}
          primaryCTA={
            stringValue(hero.primary_cta_label)
              ? {
                  label: stringValue(hero.primary_cta_label),
                  href: heroWhatsappHref,
                  variant: "whatsapp" as const,
                }
              : undefined
          }
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
        <PlainHero
          title={stringValue(hero.headline) || page.title}
          subtitle={stringValue(hero.subheadline)}
          primaryCTA={
            stringValue(hero.primary_cta_label)
              ? {
                  label: stringValue(hero.primary_cta_label),
                  href: heroWhatsappHref,
                  variant: "whatsapp" as const,
                }
              : undefined
          }
          secondaryCTA={
            stringValue(hero.secondary_cta_label)
              ? {
                  label: stringValue(hero.secondary_cta_label),
                  href: stringValue(hero.secondary_cta_href) || "/program",
                }
              : undefined
          }
        />
      )}
      <StatsBar
        items={sortedRecords(data.proof_stats).map((item) => ({
          iconKey: "check",
          value: stringValue(item.value),
          label: stringValue(item.label),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <TentangKamiStorySection
        imageId={stringValue(story.image_id)}
        badgeLabel={stringValue(story.badge_label)}
        headline={stringValue(story.headline)}
        body={stringValue(story.body)}
      />
      <TentangKamiVisionMissionSection
        visionHeadline={stringValue(visionMission.vision_headline)}
        visionDescription={stringValue(visionMission.vision_description)}
        missionHeadline={stringValue(visionMission.mission_headline)}
        missionDescription={stringValue(visionMission.mission_description)}
      />
      <CardGrid
        title="Nilai-Nilai Kami"
        items={sortedRecords(data.values).map((item, index) => ({
          id: `value-${index}`,
          title: stringValue(item.title) || stringValue(item.headline),
          description: stringValue(item.description),
          iconKey: stringValue(item.icon_key),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <TeamGrid title="Tim Kami" members={teamMembers} />
      <CardGrid
        title="Partner Kami"
        items={partnerCards}
      />
      <FacilityGallery
        title="Galeri"
        items={galleryMediaIds
          .map((mediaId, index) => ({
            mediaSrc: galleryUrls.get(mediaId) || "",
            sortOrder: index,
            isEnabled: true,
          }))
          .filter((item) => item.mediaSrc)}
      />
      <TentangKamiLegalitiesSection items={sortedRecords(data.legalities)} />
      <TentangKamiContactSection
        headline={stringValue(contactSection.headline)}
        description={stringValue(contactSection.description)}
        globalConfig={context.globalConfig}
        whatsappHref={defaultWhatsappHref}
      />
      <CTABanner
        headline="Siap memulai perjalanan Anda?"
        description="Hubungi kami untuk informasi lebih lanjut dan konsultasi gratis."
        primaryCTA={{
          label: "Chat WhatsApp",
          href: defaultWhatsappHref,
          variant: "whatsapp",
        }}
      />
    </>
  );
}

async function TentangKamiStorySection({
  imageId,
  badgeLabel,
  headline,
  body,
}: {
  imageId: string;
  badgeLabel: string;
  headline: string;
  body: string;
}) {
  const imageSrc = await resolveMediaUrl(imageId);

  if (!headline && !body) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {imageSrc ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={imageSrc}
                alt={headline || "Cerita Kami"}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            {badgeLabel ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
                {badgeLabel}
              </p>
            ) : null}
            {headline ? (
              <h2 className="mt-3 text-3xl font-bold text-neutral-900 md:text-4xl">
                {headline}
              </h2>
            ) : null}
            {body ? (
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-neutral-600">
                {body}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function TentangKamiVisionMissionSection({
  visionHeadline,
  visionDescription,
  missionHeadline,
  missionDescription,
}: {
  visionHeadline: string;
  visionDescription: string;
  missionHeadline: string;
  missionDescription: string;
}) {
  if (!visionHeadline && !visionDescription && !missionHeadline && !missionDescription) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-neutral-900">
                {visionHeadline || "Visi"}
              </h2>
              {visionDescription ? (
                <p className="mt-4 leading-7 text-neutral-600">
                  {visionDescription}
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-neutral-900">
                {missionHeadline || "Misi"}
              </h2>
              {missionDescription ? (
                <p className="mt-4 leading-7 text-neutral-600">
                  {missionDescription}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

function TentangKamiLegalitiesSection({
  items,
}: {
  items: PublicJson[];
}) {
  const visible = items.filter(
    (item) =>
      booleanValue(item.is_enabled, true) &&
      (stringValue(item.title) || stringValue(item.description)),
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <h2 className="mb-10 text-center text-3xl font-bold text-neutral-900 md:text-4xl">
          Legalitas
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, index) => (
            <Card key={index} className="p-6">
              <CardContent className="flex flex-1 flex-col p-0">
                {stringValue(item.title) ? (
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {stringValue(item.title)}
                  </h3>
                ) : null}
                {stringValue(item.description) ? (
                  <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">
                    {stringValue(item.description)}
                  </p>
                ) : null}
                {stringValue(item.document_label) && stringValue(item.document_url) ? (
                  <div className="mt-6">
                    <DocumentDownload
                      label={stringValue(item.document_label)}
                      fileUrl={stringValue(item.document_url)}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TentangKamiContactSection({
  headline,
  description,
  globalConfig,
  whatsappHref,
}: {
  headline: string;
  description: string;
  globalConfig: Record<string, PublicJson>;
  whatsappHref: string;
}) {
  const whatsappContact = record(globalConfig.whatsapp_contact);
  const contact = record(whatsappContact.contact);
  const socialLinks = record(whatsappContact.social_links);

  return (
    <ContactInfo
      headline={headline || "Hubungi Kami"}
      description={description}
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

async function resolveTeamMemberCards(items: PublicJson[]) {
  return Promise.all(
    items.map(async (item, index) => ({
      name: stringValue(item.name),
      role: stringValue(item.role),
      bio: stringValue(item.bio),
      imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
      sortOrder: numberValue(item.sort_order) ?? index,
      isEnabled: booleanValue(item.is_enabled, true),
    })),
  );
}

async function resolvePartnerCards(items: PublicJson[]) {
  const resolved = await Promise.all(
    items.map(async (item, index) => {
      const logoUrl = await resolveMediaUrl(stringValue(item.logo_image_id));
      return {
        id: `partner-${index}`,
        title: stringValue(item.name),
        description: stringValue(item.description),
        imageSrc: logoUrl || undefined,
        imageAlt: stringValue(item.name),
        isEnabled: booleanValue(item.is_enabled, true),
      };
    }),
  );

  return resolved.filter((card) => card.isEnabled && (card.title || card.imageSrc));
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
  const heroImageId =
    stringValue(hero.image_id) ||
    stringValue(hero.media_id) ||
    firstString(hero.slider_media_ids);
  const imageUrl = await resolveMediaUrl(heroImageId);
  const fallbackImageUrl = await resolveDefaultOgImage(context.globalConfig);

  return buildMetadata({
    title: `${stringValue(hero.headline) || page?.title || titleFallback} | ${getLpkName(
      context.globalConfig,
      context.tenant.name,
    )}`,
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
    title: `${item?.title || formatLabel(collectionKey)} | ${getLpkName(
      context.globalConfig,
      context.tenant.name,
    )}`,
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
  showHeading = true,
}: {
  item: PublicCollectionItem;
  collectionKey: string;
  showHeading?: boolean;
}) {
  const blocks = arrayOfRecords(item.dataJson.blocks);

  return (
    <article>
      {showHeading ? (
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h1>
      ) : null}
      {item.isExpired ? <ExpiredBadge type={collectionKey === "job" ? "job" : "offer"} /> : null}
      {showHeading && item.excerpt ? (
        <p className="mt-4 text-lg leading-8 text-neutral-600">{item.excerpt}</p>
      ) : null}
      {blocks.length > 0 ? (
        <div className={showHeading ? "mt-8" : undefined}>
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

function GenericDetailHero({ item }: { item: PublicCollectionItem }) {
  const imageSrc = getDetailHeroSrc(item);

  if (!imageSrc) {
    return null;
  }

  return (
    <HeroSection
      mediaType="image"
      mediaSrc={imageSrc}
      mediaAlt={item.title}
      headline={item.title}
      subheadline={item.excerpt}
      priority
    />
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
  headline = "Hubungi Kami",
  description,
  globalConfig,
  whatsappHref,
  showGlobalContact = true,
}: {
  headline?: string;
  description?: string;
  globalConfig: Record<string, PublicJson>;
  whatsappHref: string;
  showGlobalContact?: boolean;
}) {
  const whatsappContact = record(globalConfig.whatsapp_contact);
  const contact = record(whatsappContact.contact);
  const socialLinks = record(whatsappContact.social_links);

  return (
    <ContactInfo
      headline={headline}
      description={description}
      phone={showGlobalContact ? stringValue(contact.phone_label) : undefined}
      email={showGlobalContact ? stringValue(contact.email) : undefined}
      address={showGlobalContact ? stringValue(contact.address) : undefined}
      mapUrl={showGlobalContact ? stringValue(contact.map_url) : undefined}
      operationalHours={showGlobalContact ? stringValue(contact.operational_hours) : undefined}
      socialLinks={showGlobalContact
        ? {
            instagram: stringValue(socialLinks.instagram),
            youtube: stringValue(socialLinks.youtube),
            tiktok: stringValue(socialLinks.tiktok),
            facebook: stringValue(socialLinks.facebook),
            line: stringValue(socialLinks.line),
          }
        : undefined}
      ctaLabel="Chat WhatsApp"
      ctaHref={whatsappHref}
      ctaVariant="whatsapp"
    />
  );
}

function PlainHero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: {
  title: string;
  subtitle?: string;
  primaryCTA?: { label: string; href: string; variant: "whatsapp" | "line" | "default" };
  secondaryCTA?: { label: string; href: string };
}) {
  return (
    <section className="bg-neutral-950 py-20 text-white md:py-24">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p> : null}
        {primaryCTA || secondaryCTA ? (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {primaryCTA ? (
              <Button
                render={<a href={primaryCTA.href} />}
                size="lg"
                variant={primaryCTA.variant}
                className="w-full sm:w-auto"
              >
                {primaryCTA.label}
              </Button>
            ) : null}
            {secondaryCTA ? (
              <Button
                render={<a href={secondaryCTA.href} />}
                size="lg"
                variant="outline"
                className="w-full border-white/70 bg-white/10 text-white hover:bg-white hover:text-neutral-900 sm:w-auto"
              >
                {secondaryCTA.label}
              </Button>
            ) : null}
          </div>
        ) : null}
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

type NormalizedItem = { title: string; description: string };

function NormalizedCardSet({
  title,
  items,
}: {
  title: string;
  items: NormalizedItem[];
}) {
  const visible = items.filter((item) => item.title || item.description);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visible.map((item, index) => (
          <Card key={`${title}-${index}`} className="p-5">
            <CardContent className="p-0">
              <h3 className="font-semibold text-neutral-900">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">
                  {item.description}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

async function ProgramDetailMain({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;

  const optionIds = [
    stringValue(data.program_type_option_id),
    stringValue(data.gender_option_id),
    stringValue(data.education_level_option_id),
    stringValue(data.language_level_option_id),
  ].filter(Boolean);

  const options = await Promise.all(optionIds.map((id) => resolveOptionLabel(id)));
  const optLabel = (id: string) => {
    const index = optionIds.indexOf(id);
    return index >= 0 ? options[index]?.label ?? "" : "";
  };

  const classificationLabels = [
    optLabel(stringValue(data.program_type_option_id)),
    optLabel(stringValue(data.gender_option_id)),
    stringValue(data.duration_label),
    stringValue(data.contract_label),
    stringValue(data.salary_range_label),
    stringValue(data.target_language_label),
    stringValue(data.visa_path_label),
    optLabel(stringValue(data.education_level_option_id)),
    optLabel(stringValue(data.language_level_option_id)),
    stringValue(data.highlight_label),
  ].filter(Boolean);

  const whatsappHref = getProgramWhatsappHref(data, globalConfig, lpkName, item.title);

  return (
    <article className="space-y-12">
      <section>
        <h1 className="sr-only">{item.title}</h1>
        {stringValue(data.subtitle) ? (
          <p className="text-lg font-medium text-primary-500">{stringValue(data.subtitle)}</p>
        ) : null}
        {classificationLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {classificationLabels.map((label) => (
              <Badge key={label} variant="outline">{label}</Badge>
            ))}
          </div>
        ) : null}
        {stringValue(data.overview) ? (
          <div className="mt-6 whitespace-pre-line leading-8 text-neutral-700">
            {stringValue(data.overview)}
          </div>
        ) : null}
      </section>

      <NormalizedCardSet
        title="Mengapa Memilih Program Ini"
        items={normalizeMixedList(data.why_choose_items)}
      />
      <NormalizedCardSet
        title="Kurikulum"
        items={normalizeMixedList(data.curriculum_items)}
      />

      {(() => {
        const timelineItems = parseTimelineItems(data.timeline_items);
        if (timelineItems.length === 0) {
          return null;
        }
        return (
          <StepFlow
            title="Alur Program"
            items={timelineItems.map((step) => ({
              iconKey: "check",
              title: step.title,
              description: step.description,
              sortOrder: step.sortOrder,
              isEnabled: step.isEnabled,
            }))}
          />
        );
      })()}

      {renderRequirementList(data.requirements)}

      {(() => {
        const costItems = parseCostItems(data.cost_items);
        if (costItems.length === 0) {
          return null;
        }
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Biaya</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {costItems.map((cost, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-neutral-900">{cost.title}</h3>
                    {cost.amount ? (
                      <p className="mt-2 text-xl font-bold text-primary-500">{cost.amount}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      <NormalizedCardSet
        title="Peluang Karir"
        items={normalizeMixedList(data.career_opportunity_items)}
      />
      <NormalizedCardSet
        title="Legalitas &amp; Partner"
        items={normalizeMixedList(data.legality_partner_items)}
      />

      {sortedRecords(data.testimonials).length > 0 ? (
        <TestimonialCarousel
          title="Testimoni"
          items={sortedRecords(data.testimonials).map((t) => ({
            name: stringValue(t.name),
            roleOrProgram: stringValue(t.role_or_program),
            quote: stringValue(t.quote),
            isEnabled: booleanValue(t.is_enabled, true),
          }))}
        />
      ) : null}

      {sortedRecords(data.faqs).length > 0 ? (
        <FAQ
          title="Pertanyaan Umum"
          items={sortedRecords(data.faqs).map((faq, index) => ({
            question: stringValue(faq.question),
            answer: stringValue(faq.answer),
            sortOrder: numberValue(faq.sort_order) ?? index,
            isEnabled: booleanValue(faq.is_enabled, true),
          }))}
        />
      ) : null}

      {whatsappHref !== "#" ? (
        <CTABanner
          headline={stringValue(data.primary_cta_label) || "Tertarik dengan program ini?"}
          description="Hubungi kami untuk informasi lebih lanjut dan pendaftaran."
          primaryCTA={{
            label: stringValue(data.primary_cta_label) || "Chat WhatsApp",
            href: whatsappHref,
            variant: "whatsapp",
          }}
        />
      ) : null}
    </article>
  );
}

function ProgramDetailSidebar({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;
  const whatsappHref = getProgramWhatsappHref(data, globalConfig, lpkName, item.title);

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Informasi Program</h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {stringValue(data.duration_label) ? (
            <MetaRow label="Durasi" value={stringValue(data.duration_label)} />
          ) : null}
          {stringValue(data.contract_label) ? (
            <MetaRow label="Kontrak" value={stringValue(data.contract_label)} />
          ) : null}
          {stringValue(data.salary_range_label) ? (
            <MetaRow label="Gaji" value={stringValue(data.salary_range_label)} />
          ) : null}
          {stringValue(data.target_language_label) ? (
            <MetaRow label="Bahasa" value={stringValue(data.target_language_label)} />
          ) : null}
          {stringValue(data.visa_path_label) ? (
            <MetaRow label="Jalur Visa" value={stringValue(data.visa_path_label)} />
          ) : null}
          {stringValue(data.highlight_label) ? (
            <MetaRow label="Highlight" value={stringValue(data.highlight_label)} />
          ) : null}
        </dl>
        <Button
          render={<a href={whatsappHref} />}
          variant="whatsapp"
          className="mt-6 w-full"
        >
          {stringValue(data.primary_cta_label) || "Daftar via WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProgramDetailHero({
  item,
  fallbackImageSrc,
}: {
  item: PublicCollectionItem;
  fallbackImageSrc?: string;
}) {
  const imageSrc = getDetailHeroSrc(item, fallbackImageSrc);
  const data = item.dataJson;

  return imageSrc ? (
    <HeroSection
      mediaType="image"
      mediaSrc={imageSrc}
      mediaAlt={item.title}
      headline={item.title}
      subheadline={
        item.excerpt ||
        stringValue(data.subtitle) ||
        stringValue(data.short_description)
      }
      priority
    />
  ) : (
    <section className="bg-neutral-950 py-16 text-white md:py-20">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{item.title}</h1>
        {(item.excerpt ||
          stringValue(data.subtitle) ||
          stringValue(data.short_description)) ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
            {item.excerpt ||
              stringValue(data.subtitle) ||
              stringValue(data.short_description)}
          </p>
        ) : null}
      </Container>
    </section>
  );
}

async function JobDetailMain({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;

  const optionIds = [
    stringValue(data.job_type_option_id),
    stringValue(data.job_field_option_id),
    stringValue(data.gender_option_id),
    stringValue(data.language_level_option_id),
    stringValue(data.education_level_option_id),
  ].filter(Boolean);

  const options = await Promise.all(optionIds.map((id) => resolveOptionLabel(id)));
  const optLabel = (id: string) => {
    const index = optionIds.indexOf(id);
    return index >= 0 ? options[index]?.label ?? "" : "";
  };

  const classificationLabels = [
    optLabel(stringValue(data.job_type_option_id)),
    optLabel(stringValue(data.job_field_option_id)),
    optLabel(stringValue(data.gender_option_id)),
    optLabel(stringValue(data.language_level_option_id)),
    optLabel(stringValue(data.education_level_option_id)),
    stringValue(data.contract_label),
  ].filter(Boolean);

  const subtitle = stringValue(data.subtitle);
  const shortDescription = stringValue(data.short_description);
  const overview = stringValue(data.overview);
  const jobDescription = stringValue(data.job_description);

  const whatsappHref = getJobWhatsappHref(data, globalConfig, lpkName, item.title);

  const galleryMediaIds = flatStringList(data.gallery_media_ids);
  const galleryUrls = galleryMediaIds.length > 0
    ? await resolveMediaUrls(galleryMediaIds)
    : new Map<string, string>();

  return (
    <article className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h1>
        {subtitle ? (
          <p className="mt-2 text-lg font-medium text-primary-500">{subtitle}</p>
        ) : null}
        {classificationLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {classificationLabels.map((label) => (
              <Badge key={label} variant="outline">{label}</Badge>
            ))}
          </div>
        ) : null}
        {item.isExpired ? (
          <ExpiredBadge type="job" ctaLabel={stringValue(data.primary_cta_label)} />
        ) : null}
        {shortDescription ? (
          <p className="mt-4 text-lg leading-8 text-neutral-600">{shortDescription}</p>
        ) : null}
        {overview ? (
          <div className="mt-6 whitespace-pre-line leading-8 text-neutral-700">{overview}</div>
        ) : null}
      </section>

      {arrayOfRecords(data.overview_items).filter((v) => stringValue(v.title) || stringValue(v.description)).length >
      0 ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Sekilas Lowongan</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            {sortedRecords(data.overview_items)
              .filter((v) => stringValue(v.title) || stringValue(v.description))
              .map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <dt className="font-semibold text-neutral-900">{stringValue(item.title)}</dt>
                    {stringValue(item.description) ? (
                      <dd className="mt-1 text-sm leading-6 text-neutral-600">
                        {stringValue(item.description)}
                      </dd>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
          </dl>
        </section>
      ) : null}

      {jobDescription ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Deskripsi Pekerjaan</h2>
          <div className="mt-5 whitespace-pre-line leading-7 text-neutral-700">{jobDescription}</div>
        </section>
      ) : null}

      {(() => {
        const benefitRecords = sortedRecords(data.benefit_items).filter((v) => stringValue(v.title));
        const stringBenefits = flatStringList(data.benefit_items);
        const benefitItems: NormalizedItem[] =
          benefitRecords.length > 0
            ? benefitRecords.map((b) => ({ title: stringValue(b.title), description: stringValue(b.description) }))
            : stringBenefits.map((s) => ({ title: s, description: "" }));
        if (benefitItems.length === 0) return null;
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Benefit</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {benefitItems.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Check aria-hidden="true" className="size-5 shrink-0 text-primary-500" />
                      {benefit.title}
                    </h3>
                    {benefit.description ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{benefit.description}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      {renderRequirementList(data.qualification_items)}

      {(() => {
        const steps = parseTimelineItems(data.recruitment_steps);
        if (steps.length === 0) return null;
        return (
          <StepFlow
            title="Alur Rekrutmen"
            items={steps.map((step) => ({
              iconKey: "check",
              title: step.title,
              description: step.description,
              sortOrder: step.sortOrder,
              isEnabled: step.isEnabled,
            }))}
          />
        );
      })()}

      {galleryMediaIds.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Galeri</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {galleryMediaIds.map((mediaId) => {
              const src = galleryUrls.get(mediaId);
              return src ? (
                <div key={mediaId} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : null;
            })}
          </div>
        </section>
      ) : null}

      {sortedRecords(data.faqs).length > 0 ? (
        <FAQ
          title="Pertanyaan Umum"
          items={sortedRecords(data.faqs).map((faq, index) => ({
            question: stringValue(faq.question),
            answer: stringValue(faq.answer),
            sortOrder: numberValue(faq.sort_order) ?? index,
            isEnabled: booleanValue(faq.is_enabled, true),
          }))}
        />
      ) : null}

      {!item.isExpired && whatsappHref !== "#" ? (
        <CTABanner
          headline={stringValue(data.primary_cta_label) || "Tertarik dengan lowongan ini?"}
          description="Hubungi kami untuk informasi lebih lanjut dan pendaftaran."
          primaryCTA={{
            label: stringValue(data.primary_cta_label) || "Chat WhatsApp",
            href: whatsappHref,
            variant: "whatsapp",
          }}
        />
      ) : null}
    </article>
  );
}

function JobDetailSidebar({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;
  const whatsappHref = getJobWhatsappHref(data, globalConfig, lpkName, item.title);
  const minAge = numberValue(data.min_age);
  const maxAge = numberValue(data.max_age);
  const ageLabel = minAge && maxAge ? `${minAge} - ${maxAge} tahun` : minAge ? `Min ${minAge} tahun` : maxAge ? `Max ${maxAge} tahun` : "";

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Informasi Lowongan</h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {stringValue(data.location_label) ? (
            <MetaRow label="Lokasi" value={stringValue(data.location_label)} />
          ) : null}
          {stringValue(data.salary_range_label) ? (
            <MetaRow label="Gaji" value={stringValue(data.salary_range_label)} />
          ) : null}
          {stringValue(data.contract_label) ? (
            <MetaRow label="Jenis Kontrak" value={stringValue(data.contract_label)} />
          ) : null}
          {stringValue(data.deadline_label) ? (
            <MetaRow label="Batas Pendaftaran" value={stringValue(data.deadline_label)} />
          ) : null}
          {item.expiredAt ? (
            <MetaRow label="Berlaku Sampai" value={formatDate(item.expiredAt)} />
          ) : null}
          {stringValue(data.quota_label) ? (
            <MetaRow label="Kuota" value={stringValue(data.quota_label)} />
          ) : null}
          {ageLabel ? <MetaRow label="Usia" value={ageLabel} /> : null}
          {stringValue(data.certificate_required_label) ? (
            <MetaRow label="Sertifikat" value={stringValue(data.certificate_required_label)} />
          ) : null}
          {stringValue(data.experience_required_label) ? (
            <MetaRow label="Pengalaman" value={stringValue(data.experience_required_label)} />
          ) : null}
          {booleanValue(data.ex_japan_required, false) ? (
            <MetaRow label="Eks Jepang" value="Diutamakan" />
          ) : null}
          {item.publishedAt ? (
            <MetaRow label="Dipublikasi" value={formatDate(item.publishedAt)} />
          ) : null}
        </dl>

        {flatStringList(data.required_documents).length > 0 ? (
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <h3 className="text-sm font-semibold text-neutral-900">Dokumen Diperlukan</h3>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              {flatStringList(data.required_documents).map((doc, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-500" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Button
          render={<a href={item.isExpired ? "#" : whatsappHref} />}
          disabled={item.isExpired}
          variant="whatsapp"
          className="mt-6 w-full"
          title={item.isExpired ? "Lowongan ini sudah tidak tersedia" : undefined}
        >
          {item.isExpired ? "Pendaftaran Ditutup" : stringValue(data.primary_cta_label) || "Daftar via WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

function JobDetailHero({
  item,
  fallbackImageSrc,
}: {
  item: PublicCollectionItem;
  fallbackImageSrc?: string;
}) {
  const imageSrc = getDetailHeroSrc(item, fallbackImageSrc);
  const data = item.dataJson;
  const subtitle = stringValue(data.subtitle) || stringValue(data.short_description);

  return imageSrc ? (
    <HeroSection
      mediaType="image"
      mediaSrc={imageSrc}
      mediaAlt={item.title}
      headline={item.title}
      subheadline={subtitle}
      priority
    />
  ) : (
    <section className="bg-neutral-950 py-16 text-white md:py-20">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{item.title}</h1>
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p>
        ) : null}
      </Container>
    </section>
  );
}

function getJobWhatsappHref(
  data: PublicJson,
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  jobTitle: string,
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);

  if (!number) {
    return "#";
  }

  const jobTemplate = stringValue(data.whatsapp_message_template);
  const globalTemplate =
    stringValue(whatsapp.default_message_template) ||
    "Halo, saya ingin konsultasi dengan {lpk_name}.";
  const template = jobTemplate || globalTemplate;

  return buildWhatsAppUrl(number, template, {
    lpk_name: lpkName,
    job_title: jobTitle,
  });
}

function getKarirWhatsappHref(
  data: PublicJson,
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  karirTitle: string,
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);

  if (!number) {
    return "#";
  }

  const karirTemplate = stringValue(data.whatsapp_message_template);
  const globalTemplate =
    stringValue(whatsapp.default_message_template) ||
    "Halo, saya ingin konsultasi dengan {lpk_name}.";
  const template = karirTemplate || globalTemplate;

  return buildWhatsAppUrl(number, template, {
    lpk_name: lpkName,
    karir_title: karirTitle,
  });
}

function KarirDetailHero({
  item,
  fallbackImageSrc,
}: {
  item: PublicCollectionItem;
  fallbackImageSrc?: string;
}) {
  const imageSrc = getDetailHeroSrc(item, fallbackImageSrc);
  const data = item.dataJson;
  const subtitle = stringValue(data.subtitle) || stringValue(data.short_description);

  return imageSrc ? (
    <HeroSection
      mediaType="image"
      mediaSrc={imageSrc}
      mediaAlt={item.title}
      headline={item.title}
      subheadline={subtitle}
      priority
    />
  ) : (
    <section className="bg-neutral-950 py-16 text-white md:py-20">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{item.title}</h1>
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p>
        ) : null}
      </Container>
    </section>
  );
}

async function KarirDetailMain({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;

  const optionIds = [
    stringValue(data.department_option_id),
    stringValue(data.employment_type_option_id),
    stringValue(data.work_arrangement_option_id),
  ].filter(Boolean);

  const options = await Promise.all(optionIds.map((id) => resolveOptionLabel(id)));
  const optLabel = (id: string) => {
    const index = optionIds.indexOf(id);
    return index >= 0 ? options[index]?.label ?? "" : "";
  };

  const classificationLabels = [
    optLabel(stringValue(data.department_option_id)),
    optLabel(stringValue(data.employment_type_option_id)),
    optLabel(stringValue(data.work_arrangement_option_id)),
  ].filter(Boolean);

  const subtitle = stringValue(data.subtitle);
  const shortDescription = stringValue(data.short_description);
  const overview = stringValue(data.overview);
  const roleDescription = stringValue(data.role_description);

  const whatsappHref = getKarirWhatsappHref(data, globalConfig, lpkName, item.title);

  return (
    <article className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h1>
        {subtitle ? (
          <p className="mt-2 text-lg font-medium text-primary-500">{subtitle}</p>
        ) : null}
        {classificationLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {classificationLabels.map((label) => (
              <Badge key={label} variant="outline">{label}</Badge>
            ))}
          </div>
        ) : null}
        {item.isExpired ? (
          <ExpiredBadge type="karir" ctaLabel={stringValue(data.primary_cta_label)} />
        ) : null}
        {shortDescription ? (
          <p className="mt-4 text-lg leading-8 text-neutral-600">{shortDescription}</p>
        ) : null}
        {overview ? (
          <div className="mt-6 whitespace-pre-line leading-8 text-neutral-700">{overview}</div>
        ) : null}
      </section>

      {arrayOfRecords(data.overview_items).filter((v) => stringValue(v.title) || stringValue(v.description)).length >
      0 ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Sekilas Posisi</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            {sortedRecords(data.overview_items)
              .filter((v) => stringValue(v.title) || stringValue(v.description))
              .map((ov, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <dt className="font-semibold text-neutral-900">{stringValue(ov.title)}</dt>
                    {stringValue(ov.description) ? (
                      <dd className="mt-1 text-sm leading-6 text-neutral-600">
                        {stringValue(ov.description)}
                      </dd>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
          </dl>
        </section>
      ) : null}

      {roleDescription ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Deskripsi Peran</h2>
          <div className="mt-5 whitespace-pre-line leading-7 text-neutral-700">{roleDescription}</div>
        </section>
      ) : null}

      {(() => {
        const items = flatStringList(data.responsibilities);
        const recordItems = arrayOfRecords(data.responsibilities);
        const allItems = [
          ...items,
          ...recordItems.map((rec) => stringValue(rec.text) || stringValue(rec.title)),
        ].filter(Boolean);
        if (allItems.length === 0) return null;
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Tanggung Jawab</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {allItems.map((text, index) => (
                <li key={index} className="flex gap-3 rounded-xl border border-neutral-200 p-4">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary-500" />
                  <span className="text-sm leading-6 text-neutral-700">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {renderRequirementList(data.requirements)}

      {(() => {
        const benefitRecords = sortedRecords(data.benefits).filter((v) => stringValue(v.title));
        const stringBenefits = flatStringList(data.benefits);
        const benefitItems: NormalizedItem[] =
          benefitRecords.length > 0
            ? benefitRecords.map((b) => ({ title: stringValue(b.title), description: stringValue(b.description) }))
            : stringBenefits.map((s) => ({ title: s, description: "" }));
        if (benefitItems.length === 0) return null;
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Benefit</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {benefitItems.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Check aria-hidden="true" className="size-5 shrink-0 text-primary-500" />
                      {benefit.title}
                    </h3>
                    {benefit.description ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{benefit.description}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      {(() => {
        const steps = parseTimelineItems(data.recruitment_steps);
        if (steps.length === 0) return null;
        return (
          <StepFlow
            title="Alur Rekrutmen"
            items={steps.map((step) => ({
              iconKey: "check",
              title: step.title,
              description: step.description,
              sortOrder: step.sortOrder,
              isEnabled: step.isEnabled,
            }))}
          />
        );
      })()}

      {sortedRecords(data.faqs).length > 0 ? (
        <FAQ
          title="Pertanyaan Umum"
          items={sortedRecords(data.faqs).map((faq, index) => ({
            question: stringValue(faq.question),
            answer: stringValue(faq.answer),
            sortOrder: numberValue(faq.sort_order) ?? index,
            isEnabled: booleanValue(faq.is_enabled, true),
          }))}
        />
      ) : null}

      {!item.isExpired && whatsappHref !== "#" ? (
        <CTABanner
          headline={stringValue(data.primary_cta_label) || "Tertarik dengan posisi ini?"}
          description="Hubungi kami untuk informasi lebih lanjut dan pendaftaran."
          primaryCTA={{
            label: stringValue(data.primary_cta_label) || "Chat WhatsApp",
            href: whatsappHref,
            variant: "whatsapp",
          }}
        />
      ) : null}
    </article>
  );
}

function KarirDetailSidebar({
  item,
  globalConfig,
  lpkName,
}: {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  lpkName: string;
}) {
  const data = item.dataJson;
  const whatsappHref = getKarirWhatsappHref(data, globalConfig, lpkName, item.title);

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Informasi Posisi</h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {stringValue(data.location_label) ? (
            <MetaRow label="Lokasi" value={stringValue(data.location_label)} />
          ) : null}
          {stringValue(data.salary_label) ? (
            <MetaRow label="Gaji" value={stringValue(data.salary_label)} />
          ) : null}
          {stringValue(data.experience_label) ? (
            <MetaRow label="Pengalaman" value={stringValue(data.experience_label)} />
          ) : null}
          {stringValue(data.education_label) ? (
            <MetaRow label="Pendidikan" value={stringValue(data.education_label)} />
          ) : null}
          {stringValue(data.deadline_label) ? (
            <MetaRow label="Batas Pendaftaran" value={stringValue(data.deadline_label)} />
          ) : null}
          {item.expiredAt ? (
            <MetaRow label="Berlaku Sampai" value={formatDate(item.expiredAt)} />
          ) : null}
          {item.publishedAt ? (
            <MetaRow label="Dipublikasi" value={formatDate(item.publishedAt)} />
          ) : null}
        </dl>

        <Button
          render={<a href={item.isExpired ? "#" : whatsappHref} />}
          disabled={item.isExpired}
          variant="whatsapp"
          className="mt-6 w-full"
          title={item.isExpired ? "Posisi ini sudah tidak tersedia" : undefined}
        >
          {item.isExpired ? "Pendaftaran Ditutup" : stringValue(data.primary_cta_label) || "Daftar via WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

function OfferDetailHero({ item }: { item: PublicCollectionItem }) {
  const imageSrc = getDetailHeroSrc(item);
  const data = item.dataJson;
  const subtitle = stringValue(data.subtitle) || stringValue(data.short_description);

  return imageSrc ? (
    <HeroSection
      mediaType="image"
      mediaSrc={imageSrc}
      mediaAlt={item.title}
      headline={item.title}
      subheadline={subtitle}
      priority
    />
  ) : (
    <section className="bg-neutral-950 py-16 text-white md:py-20">
      <Container>
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{item.title}</h1>
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p>
        ) : null}
      </Container>
    </section>
  );
}

async function OfferDetailMain({ item }: { item: PublicCollectionItem }) {
  const data = item.dataJson;

  const optionIds = [
    stringValue(data.offer_type_option_id),
    stringValue(data.target_audience_option_id),
  ].filter(Boolean);

  const options = await Promise.all(optionIds.map((id) => resolveOptionLabel(id)));
  const optLabel = (id: string) => {
    const index = optionIds.indexOf(id);
    return index >= 0 ? options[index]?.label ?? "" : "";
  };

  const classificationLabels = [
    optLabel(stringValue(data.offer_type_option_id)),
    optLabel(stringValue(data.target_audience_option_id)),
  ].filter(Boolean);

  const overview = stringValue(data.overview);
  const detailDescription = stringValue(data.detail_description);
  const termsConditions = stringValue(data.terms_conditions);

  return (
    <article className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{item.title}</h1>
        {stringValue(data.subtitle) ? (
          <p className="mt-2 text-lg font-medium text-primary-500">{stringValue(data.subtitle)}</p>
        ) : null}
        {classificationLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {classificationLabels.map((label) => (
              <Badge key={label} variant="outline">{label}</Badge>
            ))}
          </div>
        ) : null}
        {item.isExpired ? <ExpiredBadge type="offer" /> : null}
        {stringValue(data.short_description) ? (
          <p className="mt-4 text-lg leading-8 text-neutral-600">{stringValue(data.short_description)}</p>
        ) : null}
        {overview ? (
          <div className="mt-6 whitespace-pre-line leading-8 text-neutral-700">{overview}</div>
        ) : null}
      </section>

      {(() => {
        const benefitRecords = sortedRecords(data.benefit_items).filter((v) => stringValue(v.title));
        const stringBenefits = flatStringList(data.benefit_items);
        const benefitItems: NormalizedItem[] =
          benefitRecords.length > 0
            ? benefitRecords.map((b) => ({ title: stringValue(b.title), description: stringValue(b.description) }))
            : stringBenefits.map((s) => ({ title: s, description: "" }));
        if (benefitItems.length === 0) return null;
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Keuntungan</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {benefitItems.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Check aria-hidden="true" className="size-5 shrink-0 text-primary-500" />
                      {benefit.title}
                    </h3>
                    {benefit.description ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{benefit.description}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      {renderRequirementList(data.detail_checklist, "Detail Penawaran")}

      {detailDescription ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Deskripsi Penawaran</h2>
          <div className="mt-5 whitespace-pre-line leading-7 text-neutral-700">{detailDescription}</div>
        </section>
      ) : null}

      {(() => {
        const bonusRecords = sortedRecords(data.bonus_items).filter((v) => stringValue(v.title));
        const stringBonuses = flatStringList(data.bonus_items);
        const bonusItems: NormalizedItem[] =
          bonusRecords.length > 0
            ? bonusRecords.map((b) => ({ title: stringValue(b.title), description: stringValue(b.description) }))
            : stringBonuses.map((s) => ({ title: s, description: "" }));
        if (bonusItems.length === 0) return null;
        return (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900">Bonus</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {bonusItems.map((bonus, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Check aria-hidden="true" className="size-5 shrink-0 text-primary-500" />
                      {bonus.title}
                    </h3>
                    {bonus.description ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{bonus.description}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })()}

      <NormalizedCardSet
        title="Cocok Untuk"
        items={normalizeMixedList(data.suitable_for_items)}
      />

      {sortedRecords(data.faqs).length > 0 ? (
        <FAQ
          title="Pertanyaan Umum"
          items={sortedRecords(data.faqs).map((faq, index) => ({
            question: stringValue(faq.question),
            answer: stringValue(faq.answer),
            sortOrder: numberValue(faq.sort_order) ?? index,
            isEnabled: booleanValue(faq.is_enabled, true),
          }))}
        />
      ) : null}

      {termsConditions ? (
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Syarat &amp; Ketentuan</h2>
          <div className="mt-5 whitespace-pre-line text-sm leading-6 text-neutral-600">{termsConditions}</div>
        </section>
      ) : null}
    </article>
  );
}

function OfferDetailSidebar({
  item,
  whatsappHref,
}: {
  item: PublicCollectionItem;
  whatsappHref: string;
}) {
  const data = item.dataJson;

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Informasi Penawaran</h2>
        <dl className="mt-4 space-y-3 text-sm text-neutral-600">
          {stringValue(data.price_label) ? (
            <MetaRow label="Harga" value={stringValue(data.price_label)} />
          ) : null}
          {stringValue(data.original_price_label) ? (
            <MetaRow label="Harga Asli" value={stringValue(data.original_price_label)} />
          ) : null}
          {stringValue(data.urgency_label) ? (
            <MetaRow label="Ketersediaan" value={stringValue(data.urgency_label)} />
          ) : null}
          {stringValue(data.schedule_label) ? (
            <MetaRow label="Jadwal" value={stringValue(data.schedule_label)} />
          ) : null}
          {stringValue(data.duration_label) ? (
            <MetaRow label="Durasi" value={stringValue(data.duration_label)} />
          ) : null}
          {stringValue(data.format_label) ? (
            <MetaRow label="Format" value={stringValue(data.format_label)} />
          ) : null}
          {stringValue(data.quota_label) ? (
            <MetaRow label="Kuota" value={stringValue(data.quota_label)} />
          ) : null}
          {item.expiredAt ? (
            <MetaRow label="Berlaku Sampai" value={formatDate(item.expiredAt)} />
          ) : null}
          {item.startAt ? (
            <MetaRow label="Mulai" value={formatDate(item.startAt)} />
          ) : null}
        </dl>
        <Button
          render={<a href={item.isExpired ? "#" : whatsappHref} />}
          disabled={item.isExpired}
          variant="whatsapp"
          className="mt-6 w-full"
          title={item.isExpired ? "Penawaran ini sudah tidak tersedia" : undefined}
        >
          {item.isExpired ? "Penawaran Berakhir" : stringValue(data.primary_cta_label) || "Daftar via WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

function getOfferWhatsappHref(
  data: PublicJson,
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  offerTitle: string,
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);

  if (!number) {
    return "#";
  }

  const offerTemplate = stringValue(data.whatsapp_message_template);
  const fallbackTemplate = `Halo {lpk_name}, saya tertarik dengan penawaran {offer_title}.`;
  const template = offerTemplate || fallbackTemplate;

  return buildWhatsAppUrl(number, template, {
    lpk_name: lpkName,
    offer_title: offerTitle,
  });
}

function getProgramWhatsappHref(
  data: PublicJson,
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  programTitle: string,
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);

  if (!number) {
    return "#";
  }

  const programTemplate = stringValue(data.whatsapp_message_template);
  const globalTemplate =
    stringValue(whatsapp.default_message_template) ||
    "Halo, saya ingin konsultasi dengan {lpk_name}.";
  const template = programTemplate || globalTemplate;

  return buildWhatsAppUrl(number, template, {
    lpk_name: lpkName,
    program_name: programTitle,
  });
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

function toListItem(item: PublicCollectionItem, labels?: string[], metaKeys?: string[]) {
  let meta: string | undefined;
  if (metaKeys?.length) {
    const values = metaKeys
      .map((key) => stringValue(item.dataJson[key]))
      .filter((v) => v !== "");
    meta = values.length > 0 ? values.join(" · ") : undefined;
  }
  if (!meta) {
    meta = item.publishedAt ? formatDate(item.publishedAt) : undefined;
  }
  return {
    id: item.id,
    title: item.title,
    subtitle: item.excerpt,
    slug: item.slug,
    thumbnailSrc: item.thumbnailSrc,
    status: item.status,
    meta,
    expiredAt: item.expiredAt ? `Berakhir ${formatDate(item.expiredAt)}` : undefined,
    isExpired: item.isExpired,
    isFeatured: item.isFeatured,
    badge: stringValue(item.dataJson.highlight_label),
    labels,
  };
}

async function resolveItemLabels(
  item: PublicCollectionItem,
  optionKeys: string[],
): Promise<string[]> {
  const ids = optionKeys
    .map((key) => stringValue(item.dataJson[`${key}_option_id`]) || stringValue(item.dataJson[key]))
    .filter(Boolean);
  if (ids.length === 0) return [];
  const resolved = await Promise.all(ids.map((id) => resolveOptionLabel(id)));
  return resolved.map((r) => r?.label ?? "").filter(Boolean);
}

async function collectionCard(
  item: PublicCollectionItem,
  pathPrefix: string,
  optionKeys?: string[],
) {
  const labels = optionKeys?.length ? await resolveItemLabels(item, optionKeys) : [];
  return {
    id: item.id,
    title: item.title,
    description: item.excerpt,
    href: `${pathPrefix}/${item.slug}`,
    imageSrc: item.thumbnailSrc,
    badge: stringValue(item.dataJson.highlight_label),
    labels,
    isEnabled: true,
  };
}

function getDetailHeroSrc(item: PublicCollectionItem, fallbackImageSrc?: string) {
  return item.heroSrc || item.thumbnailSrc || fallbackImageSrc;
}

async function resolveDetailPageHeroSrc(variantId: string, pageKey: string) {
  const page = await resolvePageData(variantId, pageKey);
  const hero = record(page?.dataJson.hero);
  const mediaId = stringValue(hero.media_id) || stringValue(hero.image_id);

  return mediaId ? resolveMediaUrl(mediaId) : null;
}

async function resolveFeaturedPrograms(variantId: string, config: PublicJson) {
  const pageSize = numberValue(config.max_items) || 3;
  const source = stringValue(config.source) || "featured";

  if (source !== "manual") {
    return resolveCollectionList(variantId, "program", {
      source: "featured",
      pageSize,
    });
  }

  const manualIds = flatStringList(config.manual_program_ids).slice(0, pageSize);

  if (manualIds.length === 0) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const result = await resolveCollectionList(variantId, "program", {
    source: "manual",
    manualIds,
    pageSize,
  });
  const byId = new Map(result.items.map((item) => [item.id, item]));

  return {
    ...result,
    items: manualIds.map((id) => byId.get(id)).filter((item): item is PublicCollectionItem => Boolean(item)),
  };
}

async function resolveOfferSectionPayload(variantId: string, config: PublicJson) {
  const source = stringValue(config.source) || "active_featured_offer";
  const fallbackImageSrc = await resolveMediaUrl(stringValue(config.fallback_image_id));

  if (source === "disabled") {
    return { item: null, fallbackImageSrc, isDisabled: true };
  }

  if (source === "manual") {
    const manualOfferId = stringValue(config.manual_offer_id);

    if (!manualOfferId) {
      return { item: null, fallbackImageSrc, isDisabled: false };
    }

    const result = await resolveCollectionList(variantId, "offer", {
      source: "manual",
      manualIds: [manualOfferId],
      pageSize: 1,
      activeOnly: true,
    });

    return { item: result.items[0] ?? null, fallbackImageSrc, isDisabled: false };
  }

  return { item: await resolveActiveOffer(variantId), fallbackImageSrc, isDisabled: false };
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

function buildHeroWhatsappHref(
  globalConfig: Record<string, PublicJson>,
  lpkName: string,
  messageTemplate: string,
) {
  const whatsapp = record(record(globalConfig.whatsapp_contact).whatsapp);
  const number = stringValue(whatsapp.number);

  if (!number) {
    return "#";
  }

  return buildWhatsAppUrl(number, messageTemplate, { lpk_name: lpkName });
}

function getLpkName(globalConfig: Record<string, PublicJson>, fallback: string) {
  const brand = record(record(globalConfig.brand_header).brand);

  return stringValue(brand.lpk_name) || fallback;
}

function getJapanFilterConfigs(kind: JapanListPageKind, data: PublicJson) {
  const filterConfig = record(data.filter_config);

  if (kind === "sector") {
    return booleanValue(filterConfig.enable_sector_category_filter, true)
      ? [
          {
            key: "sector_category",
            label: "業種カテゴリ",
            optionSetKey: "japan_sector_category",
          },
        ]
      : [];
  }

  return [
    booleanValue(filterConfig.enable_category_filter, true)
      ? {
          key: "category",
          label: "カテゴリ",
          optionSetKey: "japan_news_category",
        }
      : null,
    booleanValue(filterConfig.enable_tag_filter, true)
      ? {
          key: "tag",
          label: "タグ",
          optionSetKey: "japan_news_tag",
        }
      : null,
  ].filter(
    (
      config,
    ): config is {
      key: string;
      label: string;
      optionSetKey: string;
    } => Boolean(config),
  );
}

function resolveTags(
  tags: string[] | ((variantId: string) => string[]),
  variantId: string,
) {
  return Array.from(
    new Set([
      `variant:${variantId}`,
      ...(typeof tags === "function" ? tags(variantId) : tags),
    ]),
  );
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

function pickFilters(filters: Record<string, string>, enabledKeys: string[]) {
  const allowedKeys = new Set(enabledKeys);

  return Object.entries(filters).reduce<Record<string, string>>((picked, [key, value]) => {
    if (allowedKeys.has(key)) {
      picked[key] = value;
    }

    return picked;
  }, {});
}

function getEnabledIndonesiaFilterKeys(data: PublicJson, optionSetKeys: string[]) {
  const filterConfig = record(data.filter_config);

  return optionSetKeys.filter((key) =>
    booleanValue(filterConfig[getIndonesiaFilterConfigField(key)], true),
  );
}

function getIndonesiaFilterConfigField(key: string) {
  const filterConfigFields: Record<string, string> = {
    education_level: "enable_education_filter",
    language_level: "enable_language_filter",
  };

  return filterConfigFields[key] ?? `enable_${key}_filter`;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numberFromParam(value: string | string[] | undefined) {
  const number = Number(readParam(value));
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : undefined;
}

function firstString(value: unknown) {
  return Array.isArray(value)
    ? stringValue(value.find((item) => typeof item === "string"))
    : "";
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

function sortedRecords(value: unknown) {
  return arrayOfRecords(value).sort(
    (a, b) => (numberValue(a.sort_order) ?? 0) - (numberValue(b.sort_order) ?? 0),
  );
}

function flatStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }

  return [];
}

function normalizeMixedList(value: unknown): NormalizedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): NormalizedItem | null => {
      if (typeof item === "string" && item.trim().length > 0) {
        return { title: item.trim(), description: "" };
      }
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const title = stringValue(item.title);
        const description = stringValue(item.description);
        if (title || description) {
          return { title, description };
        }
      }
      return null;
    })
    .filter((item): item is NormalizedItem => item !== null);
}

type TimelineItem = {
  title: string;
  description: string;
  sortOrder: number;
  isEnabled: boolean;
};

function parseTimelineItems(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): TimelineItem | null => {
      if (typeof item === "string" && item.trim().length > 0) {
        const separatorMatch = item.match(/[:→]|->/);
        if (separatorMatch && separatorMatch.index !== undefined && separatorMatch.index > 0) {
          const sepIndex = separatorMatch.index;
          const sepLen = separatorMatch[0].length;
          return {
            title: item.slice(0, sepIndex).trim(),
            description: item.slice(sepIndex + sepLen).trim(),
            sortOrder: index,
            isEnabled: true,
          };
        }
        return { title: item.trim(), description: "", sortOrder: index, isEnabled: true };
      }
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const title = stringValue(item.title);
        const description = stringValue(item.description);
        if (title || description) {
          return {
            title,
            description,
            sortOrder: numberValue(item.sort_order) ?? index,
            isEnabled: booleanValue(item.is_enabled, true),
          };
        }
      }
      return null;
    })
    .filter((item): item is TimelineItem => item !== null);
}

type CostItem = { title: string; amount: string };

function parseCostItems(value: unknown): CostItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): CostItem | null => {
      if (typeof item === "string" && item.trim().length > 0) {
        const colonIndex = item.indexOf(":");
        if (colonIndex > 0) {
          return {
            title: item.slice(0, colonIndex).trim(),
            amount: item.slice(colonIndex + 1).trim(),
          };
        }
        return { title: item.trim(), amount: "" };
      }
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const title = stringValue(item.title);
        const amount =
          stringValue(item.amount_label) ||
          stringValue(item.amount) ||
          stringValue(item.detail);
        if (title || amount) {
          return { title, amount };
        }
      }
      return null;
    })
    .filter((item): item is CostItem => item !== null);
}

function renderRequirementList(value: unknown, title = "Persyaratan") {
  const items = flatStringList(value);
  const recordItems = arrayOfRecords(value);

  const allItems = [
    ...items,
    ...recordItems.map((rec) => stringValue(rec.text) || stringValue(rec.title) || stringValue(rec.requirement)),
  ].filter(Boolean);

  if (allItems.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {allItems.map((text, index) => (
          <li key={index} className="flex gap-3 rounded-xl border border-neutral-200 p-4">
            <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary-500" />
            <span className="text-sm leading-6 text-neutral-700">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
