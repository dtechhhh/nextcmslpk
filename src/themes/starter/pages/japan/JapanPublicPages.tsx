import Image from "next/image";
import { Check, Mail, MessageCircle } from "lucide-react";

import { buildLineUrl } from "@/lib/line";
import {
  resolveCollectionList,
  resolveMediaUrl,
  type PublicCollectionItem,
  type PublicJson,
} from "@/server/resolvers/public";
import { Badge } from "@/themes/starter/components/ui/Badge";
import { Button } from "@/themes/starter/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/themes/starter/components/ui/Card";
import { Container } from "@/themes/starter/components/ui/Container";
import { CardGrid } from "@/themes/starter/components/sections/CardGrid";
import { CollectionDetail } from "@/themes/starter/components/sections/CollectionDetail";
import { ContactInfo } from "@/themes/starter/components/sections/ContactInfo";
import {
  ContentBlocks,
  type ContentBlock,
  type ContentBlockType,
} from "@/themes/starter/components/sections/ContentBlocks";
import { CTABanner } from "@/themes/starter/components/sections/CTABanner";
import { DocumentDownload } from "@/themes/starter/components/sections/DocumentDownload";
import { FAQ } from "@/themes/starter/components/sections/FAQ";
import { FacilityGallery } from "@/themes/starter/components/sections/FacilityGallery";
import { FilterBar, type FilterBarFilter } from "@/themes/starter/components/sections/FilterBar";
import { HeroSection } from "@/themes/starter/components/sections/HeroSection";
import { HeroSlider } from "@/themes/starter/components/sections/HeroSlider";
import { RelatedItems } from "@/themes/starter/components/sections/RelatedItems";
import { StatsBar } from "@/themes/starter/components/sections/StatsBar";
import { StepFlow } from "@/themes/starter/components/sections/StepFlow";
import { TeamGrid } from "@/themes/starter/components/sections/TeamGrid";
import { Timeline } from "@/themes/starter/components/sections/Timeline";

type PublicPageData = {
  title: string;
  dataJson: PublicJson;
};

type JapanPageProps = {
  page: PublicPageData;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  variantId: string;
  isPreview: boolean;
};

type JapanHomepageProps = JapanPageProps & {
  latestNews: PublicCollectionItem[];
};

type JapanListPageProps = JapanPageProps & {
  collection: {
    items: PublicCollectionItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  filters: FilterBarFilter[];
  currentFilters: Record<string, string>;
};

type JapanDetailPageProps = {
  item: PublicCollectionItem;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  variantId: string;
  isPreview: boolean;
};

type JapanNewsDetailPageProps = JapanDetailPageProps & {
  relatedItems: PublicCollectionItem[];
};

export async function JapanHomepage({
  page,
  globalConfig,
  tenantName,
  isPreview,
  latestNews,
}: JapanHomepageProps) {
  const data = page.dataJson;
  const whyIndonesia = record(data.why_indonesia_section);

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={page.title}
        globalConfig={globalConfig}
        tenantName={tenantName}
        withLineCTA
      />
      <StatsBar items={sortedRecords(data.stats).map(toStatItem)} />
      <JapanDocumentCardGrid
        title="実績"
        items={sortedRecords(data.achievements).map((item, index) => ({
          id: `achievement-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          iconKey: stringValue(item.icon_key),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
        }))}
      />
      <SplitSection
        imageId={stringValue(whyIndonesia.image_id)}
        eyebrowLabel={stringValue(whyIndonesia.eyebrow_label)}
        title={stringValue(whyIndonesia.headline)}
        body={stringValue(whyIndonesia.description)}
        bullets={arrayOfStrings(whyIndonesia.bullet_items)}
        ctaLabel={stringValue(whyIndonesia.cta_label)}
        ctaHref="/candidate-profile"
      />
      <CardGrid
        title="HITが選ばれる理由"
        variant="japan"
        items={sortedRecords(data.why_us_cards).map((item, index) => ({
          id: stringValue(item.key) || `why-us-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          href: stringValue(item.href) || hrefForWhyUsKey(stringValue(item.key)),
          iconKey: stringValue(item.icon_key),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title="最新ニュース"
        variant="japan"
        items={latestNews.map((item) => newsCard(item))}
        ctaLabel="ニュース一覧を見る"
        ctaHref="/news"
      />
      <JapanDocumentCardGrid
        title="許認可・法的情報"
        items={sortedRecords(data.legalities).map((item, index) => ({
          id: `legality-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          badge: stringValue(item.type_label),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="インドネシアからの人材採用についてご相談ください"
        darkVariant
      />
    </>
  );
}

export async function JapanAboutPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const story = record(data.story);
  const visionMission = record(data.vision_mission);

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} />
      <SplitSection
        imageId={stringValue(story.image_id)}
        eyebrowLabel={stringValue(story.eyebrow_label)}
        title={stringValue(story.headline)}
        body={stringValue(story.body)}
      />
      <Timeline
        title="沿革"
        items={sortedRecords(data.timeline).map((item, index) => ({
          yearLabel: stringValue(item.year_label),
          title: stringValue(item.title),
          description: stringValue(item.description),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <VisionMission
        visionHeadline={stringValue(visionMission.vision_headline)}
        visionDescription={stringValue(visionMission.vision_description)}
        missionHeadline={stringValue(visionMission.mission_headline)}
        missionDescription={stringValue(visionMission.mission_description)}
      />
      <CardGrid
        title="大切にしている価値観"
        variant="japan"
        items={sortedRecords(data.values).map(iconCard)}
      />
      <FacilityGallery
        title="研修施設"
        items={await resolveGalleryItems(sortedRecords(data.facilities), "image_id")}
      />
      <TeamGrid
        title="チーム"
        members={await resolveTeamMembers(sortedRecords(data.team_members))}
      />
      <JapanDocumentCardGrid
        title="許認可・法的概要"
        items={sortedRecords(data.legal_overview).map((item, index) => ({
          id: `legal-overview-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          badge: stringValue(item.type_label),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="パートナーシップチームとお話ししましょう"
      />
    </>
  );
}

export async function JapanTrainingMethodPage(props: JapanPageProps) {
  const data = props.page.dataJson;

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <DocumentSection config={record(data.curriculum_download)} />
      <CardGrid
        title="研修の柱"
        variant="japan"
        items={sortedRecords(data.training_pillars).map(iconCard)}
      />
      <StepFlow
        title="研修の流れ"
        items={sortedRecords(data.training_flow).map(toStepItem)}
      />
      <CardGrid
        title="カリキュラム領域"
        variant="japan"
        items={sortedRecords(data.curriculum_areas).map(iconCard)}
      />
      <CardGrid
        title="評価項目"
        variant="japan"
        items={sortedRecords(data.evaluation_items).map(iconCard)}
      />
      <FacilityGallery
        title="研修ギャラリー"
        items={await resolveGalleryItems(sortedRecords(data.training_gallery), "media_id")}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="カリキュラムについてチームでご相談ください"
        secondaryDocumentId={stringValue(record(data.final_cta).secondary_document_file_id)}
      />
    </>
  );
}

export async function JapanCandidateProfilePage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const whyIndonesia = record(data.why_indonesia);
  const partnerPerspective = record(data.partner_perspective);

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} />
      <SplitSection
        imageId={stringValue(whyIndonesia.image_id)}
        title={stringValue(whyIndonesia.headline)}
        body={stringValue(whyIndonesia.description)}
        bullets={arrayOfStrings(whyIndonesia.bullet_items)}
      />
      <CardGrid
        title="候補者の強み"
        variant="japan"
        items={sortedRecords(data.candidate_strengths).map(iconCard)}
      />
      <CardGrid
        title="対応可能な在留資格"
        variant="japan"
        items={sortedRecords(data.supported_pathways).map((item, index) => ({
          id: `pathway-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          badge: stringValue(item.pathway_label),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <TeamGrid
        title="候補者例"
        members={await resolveCandidateExamples(sortedRecords(data.candidate_examples))}
      />
      <CardGrid
        title="就労準備フレームワーク"
        variant="japan"
        items={sortedRecords(data.readiness_framework).map(iconCard)}
      />
      <QuoteBlock
        quote={stringValue(partnerPerspective.quote)}
        attribution={stringValue(partnerPerspective.attribution_label)}
        isEnabled={booleanValue(partnerPerspective.is_enabled, false)}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="日本の職場に備えた候補者とお会いください"
      />
    </>
  );
}

export async function JapanRecruitmentNetworkPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const networkOverview = record(data.network_overview);

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} />
      <ImageFeature
        imageId={stringValue(networkOverview.map_image_id)}
        title={stringValue(networkOverview.headline)}
        description={stringValue(networkOverview.description)}
      />
      <CardGrid
        title="対応地域"
        variant="japan"
        items={sortedRecords(data.coverage_regions).map((item, index) => ({
          id: `region-${index}`,
          title: stringValue(item.region_name),
          description: stringValue(item.description),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title="採用チャネル"
        variant="japan"
        items={sortedRecords(data.recruitment_sources).map(iconCard)}
      />
      <StepFlow
        title="選考フロー"
        items={sortedRecords(data.screening_flow).map(toStepItem)}
      />
      <CardGrid
        title="ネットワーク拠点"
        variant="japan"
        items={await resolveNetworkNodeCards(sortedRecords(data.network_nodes))}
      />
      <CardGrid
        title="品質管理"
        variant="japan"
        items={sortedRecords(data.quality_control_items).map(iconCard)}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="インドネシアから安定した採用チャネルを構築しましょう"
      />
    </>
  );
}

export async function JapanSectorListPage({
  page,
  globalConfig,
  tenantName,
  isPreview,
  collection,
  filters,
  currentFilters,
}: JapanListPageProps) {
  const data = page.dataJson;

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={page.title}
        globalConfig={globalConfig}
        tenantName={tenantName}
      />
      <JapanCollectionList
        kind="sector"
        collection={collection}
        filters={filters}
        currentFilters={currentFilters}
        detailPathPrefix="/sectors"
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="採用計画に最適な業種を見つけましょう"
        secondaryDocumentId={stringValue(record(data.final_cta).secondary_document_file_id)}
      />
    </>
  );
}

export async function JapanNewsListPage({
  page,
  globalConfig,
  tenantName,
  isPreview,
  collection,
  filters,
  currentFilters,
}: JapanListPageProps) {
  const data = page.dataJson;

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={page.title}
        globalConfig={globalConfig}
        tenantName={tenantName}
      />
      <JapanCollectionList
        kind="news"
        collection={collection}
        filters={filters}
        currentFilters={currentFilters}
        detailPathPrefix="/news"
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="最新情報をお届けします"
      />
    </>
  );
}

export async function JapanSectorDetailPage({
  item,
  globalConfig,
  tenantName,
  isPreview,
}: JapanDetailPageProps) {
  const data = item.dataJson;
  const lineHref = getLineHref(
    globalConfig,
    tenantName,
    stringValue(data.line_message_template),
    {
      sector_name: item.title,
      lpk_name: tenantName,
    },
  );
  const documentUrl = await resolveMediaUrl(stringValue(data.secondary_document_file_id));

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <DetailHero item={item} />
      <CollectionDetail
        breadcrumb={[
          { label: "ホーム", href: "/" },
          { label: "セクター", href: "/sectors" },
          { label: item.title },
        ]}
        mainContent={<SectorDetailMain item={item} />}
        sidebar={
          <SectorSidebar
            item={item}
            lineHref={lineHref}
            documentUrl={documentUrl ?? undefined}
          />
        }
      />
    </>
  );
}

export async function JapanNewsDetailPage({
  item,
  globalConfig,
  tenantName,
  variantId,
  isPreview,
  relatedItems,
}: JapanNewsDetailPageProps) {
  const blocks = await resolveJapanContentBlocks(
    arrayOfRecords(item.dataJson.content_blocks),
    variantId,
    globalConfig,
    tenantName,
    { news_title: item.title, lpk_name: tenantName },
  );

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <DetailHero item={item} />
      <CollectionDetail
        breadcrumb={[
          { label: "ホーム", href: "/" },
          { label: "ニュース", href: "/news" },
          { label: item.title },
        ]}
        mainContent={
          <article>
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              {item.publishedAt ? <time>{formatDate(item.publishedAt)}</time> : null}
              {stringValue(item.dataJson.reading_time_label) ? (
                <span>{stringValue(item.dataJson.reading_time_label)}</span>
              ) : null}
              {isNewItem(item.publishedAt) ? (
                <Badge variant="new_badge">新着</Badge>
              ) : null}
            </div>
            {item.excerpt ? (
              <p className="mt-5 text-lg leading-8 text-neutral-600">{item.excerpt}</p>
            ) : null}
            <div className="mt-8">
              <ContentBlocks variant="japan" blocks={blocks} />
            </div>
          </article>
        }
      />
      <RelatedItems
        title="関連ニュース"
        variant="japan"
        items={relatedItems
          .filter((related) => related.slug !== item.slug)
          .slice(0, 3)
          .map((related) => ({
            title: related.title,
            excerpt: related.excerpt,
            slug: related.slug,
            thumbnailSrc: related.thumbnailSrc,
            publishedAt: related.publishedAt ? formatDate(related.publishedAt) : undefined,
            detailPath: `/news/${related.slug}`,
          }))}
      />
    </>
  );
}

export async function JapanContactPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const channels = record(data.contact_channels);
  const partnershipPic = record(data.partnership_pic);
  const businessInfo = record(data.business_info);
  const globalLineContact = record(props.globalConfig.line_business_contact);
  const globalBusinessInfo = record(globalLineContact.business_info);
  const globalBusinessEmail = record(globalLineContact.business_email);
  const contactEmail =
    stringValue(channels.business_email) || stringValue(globalBusinessEmail.email);
  const lineAccountId =
    stringValue(channels.line_official_account_id) ||
    getLineAccountId(props.globalConfig);
  const lineHref = lineAccountId
    ? buildLineUrl(
        lineAccountId,
        stringValue(channels.line_message_template) ||
          getDefaultLineTemplate(props.globalConfig),
        { lpk_name: props.tenantName },
      )
    : "#";

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <ContactChannels
        lineHref={lineHref}
        lineLabel={stringValue(channels.line_cta_label) || "LINEで問い合わせ"}
        email={contactEmail}
        emailSubject={stringValue(channels.email_subject_template)}
      />
      <PartnershipPic config={partnershipPic} />
      <ContactInfo
        headline="事業情報"
        phone={stringValue(globalBusinessInfo.phone_label)}
        email={contactEmail}
        address={stringValue(businessInfo.address) || stringValue(globalBusinessInfo.address)}
        mapUrl={
          stringValue(businessInfo.map_embed_url) ||
          stringValue(businessInfo.map_url) ||
          stringValue(globalBusinessInfo.map_url)
        }
        operationalHours={
          stringValue(businessInfo.business_hours) ||
          stringValue(globalBusinessInfo.operational_hours)
        }
        ctaLabel="LINEで問い合わせ"
        ctaHref={lineHref}
        ctaVariant="line"
      />
      <StepFlow
        title="お問い合わせの流れ"
        items={sortedRecords(data.inquiry_flow).map((item, index) => ({
          iconKey: stringValue(item.icon_key) || "check",
          title: stringValue(item.title),
          description: stringValue(item.description),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="パートナーシップのお問い合わせを開始しましょう"
        secondaryDocumentId={stringValue(record(data.final_cta).secondary_document_file_id)}
      />
    </>
  );
}

async function JapanHero({
  hero,
  pageTitle,
  globalConfig,
  tenantName,
  withLineCTA = false,
}: {
  hero: PublicJson;
  pageTitle: string;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  withLineCTA?: boolean;
}) {
  const headline = stringValue(hero.headline) || pageTitle;
  const subheadline = stringValue(hero.subheadline);
  const eyebrowLabel = stringValue(hero.eyebrow_label);
  const mediaType = stringValue(hero.media_type);
  const primaryCTA = withLineCTA
    ? {
        label: "LINEで問い合わせ",
        href: getLineHref(globalConfig, tenantName),
        variant: "line" as const,
      }
    : undefined;

  if (mediaType === "slider") {
    const slideIds = arrayOfStrings(hero.slider_media_ids);
    const slides = (
      await Promise.all(
        slideIds.map(async (mediaId) => {
          const mediaSrc = await resolveMediaUrl(mediaId);
          return mediaSrc ? { mediaSrc, mediaAlt: headline } : null;
        }),
      )
    ).filter((slide): slide is { mediaSrc: string; mediaAlt: string } => Boolean(slide));

    if (slides.length > 0) {
      return (
        <HeroSlider
          slides={slides}
          headline={headline}
          subheadline={subheadline}
          eyebrowLabel={eyebrowLabel}
          primaryCTA={primaryCTA}
        />
      );
    }
  }

  const mediaSrc = await resolveMediaUrl(stringValue(hero.media_id));

  if (!mediaSrc) {
    return <PlainHero title={headline} subtitle={subheadline} eyebrowLabel={eyebrowLabel} />;
  }

  return (
    <HeroSection
      mediaType={mediaType === "video" ? "video" : "image"}
      mediaSrc={mediaSrc}
      mediaAlt={headline}
      headline={headline}
      subheadline={subheadline}
      eyebrowLabel={eyebrowLabel}
      primaryCTA={primaryCTA}
      priority
    />
  );
}

function PlainHero({
  title,
  subtitle,
  eyebrowLabel,
}: {
  title: string;
  subtitle?: string;
  eyebrowLabel?: string;
}) {
  return (
    <section className="bg-primary-700 py-20 text-white md:py-24">
      <Container>
        {eyebrowLabel ? (
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/70">
            {eyebrowLabel}
          </p>
        ) : null}
        <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subtitle}</p> : null}
      </Container>
    </section>
  );
}

async function SplitSection({
  imageId,
  eyebrowLabel,
  title,
  body,
  bullets = [],
  ctaLabel,
  ctaHref,
}: {
  imageId?: string;
  eyebrowLabel?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const imageSrc = await resolveMediaUrl(imageId || "");

  if (!title && !body && bullets.length === 0) {
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
                alt={title || ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            {eyebrowLabel ? (
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
                {eyebrowLabel}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-3 text-3xl font-bold text-neutral-900 md:text-4xl">
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-neutral-600">
                {body}
              </p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="mt-6 space-y-3 text-neutral-700">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {ctaLabel && ctaHref ? (
              <Button render={<a href={ctaHref} />} className="mt-8">
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function VisionMission({
  visionHeadline,
  visionDescription,
  missionHeadline,
  missionDescription,
}: {
  visionHeadline?: string;
  visionDescription?: string;
  missionHeadline?: string;
  missionDescription?: string;
}) {
  if (!visionHeadline && !visionDescription && !missionHeadline && !missionDescription) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="japan" className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-neutral-900">{visionHeadline || "ビジョン"}</h2>
              {visionDescription ? (
                <p className="mt-4 leading-7 text-neutral-600">{visionDescription}</p>
              ) : null}
            </CardContent>
          </Card>
          <Card variant="japan" className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-neutral-900">{missionHeadline || "ミッション"}</h2>
              {missionDescription ? (
                <p className="mt-4 leading-7 text-neutral-600">{missionDescription}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

async function DocumentSection({ config }: { config: PublicJson }) {
  if (!booleanValue(config.is_enabled, false)) {
    return null;
  }

  const fileUrl = await resolveMediaUrl(stringValue(config.file_id));

  if (!fileUrl) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-12">
      <Container>
        <Card variant="japan" className="p-6">
          <CardContent className="flex flex-col gap-5 p-0 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {stringValue(config.headline) || "カリキュラム"}
              </h2>
              {stringValue(config.description) ? (
                <p className="mt-2 leading-7 text-neutral-600">
                  {stringValue(config.description)}
                </p>
              ) : null}
            </div>
            <DocumentDownload
              label={stringValue(config.button_label) || "ダウンロード"}
              fileUrl={fileUrl}
              variant="outline"
            />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

function JapanDocumentCardGrid({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    description?: string;
    iconKey?: string;
    badge?: string;
    documentLabel?: string;
    documentUrl?: string;
  }>;
}) {
  const visibleItems = items.filter((item) => item.title || item.description);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <h2 className="mb-10 text-center text-3xl font-bold text-neutral-900 md:text-4xl">
          {title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <Card key={item.id} variant="japan" className="p-6">
              <CardContent className="flex flex-1 flex-col p-0">
                {item.badge ? (
                  <div className="mb-3">
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                ) : null}
                {item.title ? (
                  <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                ) : null}
                {item.description ? (
                  <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">
                    {item.description}
                  </p>
                ) : null}
                {item.documentLabel && item.documentUrl ? (
                  <div className="mt-6">
                    <DocumentDownload
                      label={item.documentLabel}
                      fileUrl={item.documentUrl}
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

async function FinalCTA({
  finalCta,
  globalConfig,
  tenantName,
  defaultHeadline,
  darkVariant = true,
  secondaryDocumentId,
}: {
  finalCta: PublicJson;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  defaultHeadline: string;
  darkVariant?: boolean;
  secondaryDocumentId?: string;
}) {
  const secondaryDocumentUrl = await resolveMediaUrl(secondaryDocumentId || "");
  const secondaryHref = secondaryDocumentUrl || stringValue(finalCta.secondary_href);
  const secondaryLabel = stringValue(finalCta.secondary_cta_label);

  return (
    <CTABanner
      headline={stringValue(finalCta.headline) || defaultHeadline}
      description={stringValue(finalCta.description)}
      primaryCTA={{
        label: stringValue(finalCta.primary_cta_label) || "LINEで問い合わせ",
        href: getLineHref(
          globalConfig,
          tenantName,
          stringValue(finalCta.primary_line_message_template),
          { lpk_name: tenantName },
        ),
        variant: "line",
      }}
      secondaryCTA={
        secondaryLabel && secondaryHref
          ? { label: secondaryLabel, href: secondaryHref }
          : undefined
      }
      darkVariant={darkVariant}
    />
  );
}

async function ImageFeature({
  imageId,
  title,
  description,
}: {
  imageId?: string;
  title?: string;
  description?: string;
}) {
  const imageSrc = await resolveMediaUrl(imageId || "");

  if (!imageSrc && !title && !description) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          {title ? (
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {imageSrc ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <Image src={imageSrc} alt={title || ""} fill sizes="100vw" className="object-contain" />
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function QuoteBlock({
  quote,
  attribution,
  isEnabled,
}: {
  quote?: string;
  attribution?: string;
  isEnabled: boolean;
}) {
  if (!isEnabled || !quote) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <blockquote className="mx-auto max-w-4xl border-l-4 border-primary-500 bg-white p-6 text-xl leading-9 text-neutral-700">
          <p>{quote}</p>
          {attribution ? (
            <footer className="mt-4 text-sm font-semibold text-neutral-500">
              {attribution}
            </footer>
          ) : null}
        </blockquote>
      </Container>
    </section>
  );
}

function JapanCollectionList({
  kind,
  collection,
  filters,
  currentFilters,
  detailPathPrefix,
}: {
  kind: "sector" | "news";
  collection: JapanListPageProps["collection"];
  filters: FilterBarFilter[];
  currentFilters: Record<string, string>;
  detailPathPrefix: string;
}) {
  const safePage = Math.min(Math.max(collection.page, 1), Math.max(collection.totalPages, 1));
  const pages = Array.from({ length: collection.totalPages }, (_, index) => index + 1);
  const startItem = collection.total === 0 ? 0 : (safePage - 1) * collection.pageSize + 1;
  const endItem = Math.min(safePage * collection.pageSize, collection.total);

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {filters.length > 0 ? (
          <FilterBar filters={filters} currentValues={currentFilters} variant="japan" />
        ) : null}
        <div className="mb-6 text-sm text-neutral-500">
          {collection.total}件中{startItem}〜{endItem}件を表示
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((item) => (
            <a
              key={item.id}
              href={`${detailPathPrefix}/${item.slug}`}
              className="group block h-full rounded-xl"
            >
              <Card variant="japan" className="h-full py-0">
                {item.thumbnailSrc ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={item.thumbnailSrc}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {kind === "news" && isNewItem(item.publishedAt) ? (
                      <Badge variant="new_badge">新着</Badge>
                    ) : null}
                    {item.isFeatured ? <Badge variant="outline">注目</Badge> : null}
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-neutral-900">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {item.publishedAt ? (
                    <p className="mt-4 text-sm text-neutral-500">
                      {formatDate(item.publishedAt)}
                    </p>
                  ) : null}
                </CardContent>
                <CardFooter className="p-5">
                  <Button className="w-full">{kind === "news" ? "読む" : "詳細を見る"}</Button>
                </CardFooter>
              </Card>
            </a>
          ))}
        </div>
        {collection.totalPages > 1 ? (
          <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
            {pages.map((page) => (
              <a
                key={page}
                href={buildPageHref(page, currentFilters)}
                aria-current={page === safePage ? "page" : undefined}
                className={
                  page === safePage
                    ? "flex size-10 items-center justify-center rounded-lg bg-primary-500 text-sm font-semibold text-white"
                    : "flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700"
                }
              >
                {page}
              </a>
            ))}
          </nav>
        ) : null}
      </Container>
    </section>
  );
}

function DetailHero({ item }: { item: PublicCollectionItem }) {
  if (item.heroSrc) {
    return (
      <HeroSection
        mediaType="image"
        mediaSrc={item.heroSrc}
        mediaAlt={item.title}
        headline={item.title}
        subheadline={item.excerpt}
        priority
      />
    );
  }

  return <PlainHero title={item.title} subtitle={item.excerpt} />;
}

function SectorDetailMain({ item }: { item: PublicCollectionItem }) {
  const data = item.dataJson;

  return (
    <article className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
          {item.title}
        </h1>
        {item.excerpt ? (
          <p className="mt-4 text-lg leading-8 text-neutral-600">{item.excerpt}</p>
        ) : null}
        {stringValue(data.overview) ? (
          <p className="mt-6 whitespace-pre-line leading-8 text-neutral-700">
            {stringValue(data.overview)}
          </p>
        ) : null}
      </section>
      <InlineCardSet title="適性" items={sortedRecords(data.suitability_items)} />
      <InlineCardSet title="募集職種例" items={sortedRecords(data.example_positions)} />
      <InlineCardSet title="研修との連携" items={sortedRecords(data.training_alignment_items)} />
      <RequirementList items={arrayOfStrings(data.candidate_requirements)} />
      <StepFlow title="プロセス" items={sortedRecords(data.process_items).map(toStepItem)} />
      <FAQ
        title="よくある質問"
        items={sortedRecords(data.faqs).map((faq, index) => ({
          question: stringValue(faq.question),
          answer: stringValue(faq.answer),
          sortOrder: numberValue(faq.sort_order) ?? index,
          isEnabled: booleanValue(faq.is_enabled, true),
        }))}
      />
    </article>
  );
}

function SectorSidebar({
  item,
  lineHref,
  documentUrl,
}: {
  item: PublicCollectionItem;
  lineHref: string;
  documentUrl?: string;
}) {
  const data = item.dataJson;

  return (
    <Card variant="japan" className="p-5">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold text-neutral-900">パートナーシップのお問い合わせ</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          このセクターにおける候補者の充足状況、研修の連携、および必要書類についてご相談ください。
        </p>
        <Button render={<a href={lineHref} />} variant="line" className="mt-6 w-full">
          <MessageCircle aria-hidden="true" className="size-4" />
          {stringValue(data.primary_cta_label) || "LINEで問い合わせ"}
        </Button>
        {documentUrl ? (
          <div className="mt-3">
            <DocumentDownload
              label={stringValue(data.secondary_cta_label) || "資料ダウンロード"}
              fileUrl={documentUrl}
              variant="outline"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InlineCardSet({ title, items }: { title: string; items: PublicJson[] }) {
  const visibleItems = items.filter((item) => stringValue(item.title) || stringValue(item.description));

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visibleItems.map((item, index) => (
          <Card key={`${title}-${index}`} variant="japan" className="p-5">
            <CardContent className="p-0">
              <h3 className="font-semibold text-neutral-900">{stringValue(item.title)}</h3>
              {stringValue(item.description) ? (
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {stringValue(item.description)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RequirementList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900">候補者の要件</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4">
            <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary-500" />
            <span className="text-sm leading-6 text-neutral-700">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactChannels({
  lineHref,
  lineLabel,
  email,
  emailSubject,
}: {
  lineHref: string;
  lineLabel: string;
  email?: string;
  emailSubject?: string;
}) {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="japan" className="p-6">
            <CardContent className="p-0">
              <MessageCircle aria-hidden="true" className="size-8 text-[var(--color-cta)]" />
              <h2 className="mt-4 text-2xl font-bold text-neutral-900">LINE</h2>
              <Button render={<a href={lineHref} />} variant="line" className="mt-6">
                {lineLabel}
              </Button>
            </CardContent>
          </Card>
          {email ? (
            <Card variant="japan" className="p-6">
              <CardContent className="p-0">
                <Mail aria-hidden="true" className="size-8 text-primary-500" />
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">Email</h2>
                <Button
                  render={
                    <a
                      href={`mailto:${email}${
                        emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ""
                      }`}
                    />
                  }
                  variant="outline"
                  className="mt-6"
                >
                  {email}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

async function PartnershipPic({ config }: { config: PublicJson }) {
  const imageSrc = await resolveMediaUrl(stringValue(config.photo_image_id));

  if (!imageSrc && !stringValue(config.name) && !stringValue(config.description)) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-center">
          {imageSrc ? (
            <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <Image
                src={imageSrc}
                alt={stringValue(config.name)}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            {stringValue(config.name) ? (
              <h2 className="text-3xl font-bold text-neutral-900">
                {stringValue(config.name)}
              </h2>
            ) : null}
            {stringValue(config.role) ? (
              <p className="mt-2 font-semibold text-primary-500">
                {stringValue(config.role)}
              </p>
            ) : null}
            {stringValue(config.description) ? (
              <p className="mt-5 whitespace-pre-line leading-8 text-neutral-600">
                {stringValue(config.description)}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

async function resolveJapanContentBlocks(
  blocks: PublicJson[],
  variantId: string,
  globalConfig: Record<string, PublicJson>,
  tenantName: string,
  replacements: Record<string, string>,
) {
  const resolvedBlocks = await Promise.all(
    blocks.map(async (block, index): Promise<ContentBlock | null> => {
      const type = stringValue(block.type) as ContentBlockType;
      const data = record(block.data);
      const sortOrder = numberValue(block.sort_order) ?? numberValue(block.sortOrder) ?? index;

      if (type === "whatsapp_cta" || type === "offer_callout") {
        return null;
      }

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
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                title: stringValue(data.caption) || "YouTube",
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

      if (type === "line_cta") {
        return {
          type,
          sortOrder,
          data: {
            label: stringValue(data.label) || "LINEで問い合わせ",
            href: getLineHref(
              globalConfig,
              tenantName,
              stringValue(data.line_message_template),
              replacements,
            ),
          },
        };
      }

      if (type === "sector_callout") {
        const sectorId = stringValue(data.sector_id);
        const sector = sectorId
          ? (
              await resolveCollectionList(variantId, "sector", {
                source: "manual",
                manualIds: [sectorId],
                pageSize: 1,
              })
            ).items[0]
          : null;

        return sector
          ? {
              type,
              sortOrder,
              data: {
                title: sector.title,
                description: sector.excerpt || stringValue(sector.dataJson.short_description),
                ctaLabel: "詳細を見る",
                ctaHref: `/sectors/${sector.slug}`,
              },
            }
          : null;
      }

      if (type === "heading" || type === "paragraph") {
        return { type, sortOrder, data };
      }

      return null;
    }),
  );

  return resolvedBlocks.filter((block): block is ContentBlock => Boolean(block));
}

async function resolveGalleryItems(items: PublicJson[], imageKey: string) {
  return (
    await Promise.all(
      items.map(async (item, index) => {
        const mediaSrc = await resolveMediaUrl(stringValue(item[imageKey]));
        return mediaSrc
          ? {
              mediaSrc,
              title: stringValue(item.title),
              description: stringValue(item.description),
              sortOrder: numberValue(item.sort_order) ?? index,
              isEnabled: booleanValue(item.is_enabled, true),
            }
          : null;
      }),
    )
  ).filter(
    (item): item is {
      mediaSrc: string;
      title: string;
      description: string;
      sortOrder: number;
      isEnabled: boolean;
    } => Boolean(item),
  );
}

async function resolveTeamMembers(items: PublicJson[]) {
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

async function resolveCandidateExamples(items: PublicJson[]) {
  return Promise.all(
    items.map(async (item, index) => ({
      name: stringValue(item.title),
      role: stringValue(item.profile_label),
      bio: stringValue(item.description),
      imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
      sortOrder: numberValue(item.sort_order) ?? index,
      isEnabled: booleanValue(item.is_enabled, true),
    })),
  );
}

async function resolveNetworkNodeCards(items: PublicJson[]) {
  return Promise.all(
    items.map(async (item, index) => ({
      id: `network-node-${index}`,
      title: stringValue(item.title),
      description: stringValue(item.description),
      badge: stringValue(item.region_label),
      imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
      isEnabled: booleanValue(item.is_enabled, true),
    })),
  );
}

function iconCard(item: PublicJson, index: number) {
  return {
    id: `${stringValue(item.title)}-${index}`,
    title: stringValue(item.title),
    description: stringValue(item.description),
    iconKey: stringValue(item.icon_key) || "check",
    isEnabled: booleanValue(item.is_enabled, true),
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

function toProofStatItem(item: PublicJson) {
  return {
    iconKey: "check",
    value: stringValue(item.value),
    label: stringValue(item.label),
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function toStepItem(item: PublicJson, index: number) {
  return {
    iconKey: stringValue(item.icon_key) || "check",
    title: stringValue(item.title),
    description: stringValue(item.description),
    sortOrder: numberValue(item.sort_order) ?? index,
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function newsCard(item: PublicCollectionItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.excerpt,
    href: `/news/${item.slug}`,
    imageSrc: item.thumbnailSrc,
    badge: isNewItem(item.publishedAt) ? "新着" : undefined,
    badgeVariant: isNewItem(item.publishedAt) ? ("new" as const) : undefined,
    meta: item.publishedAt ? formatDate(item.publishedAt) : undefined,
    isEnabled: true,
  };
}

function getLineHref(
  globalConfig: Record<string, PublicJson>,
  tenantName: string,
  messageTemplate?: string,
  replacements: Record<string, string> = {},
) {
  const accountId = getLineAccountId(globalConfig);
  const template = messageTemplate || getDefaultLineTemplate(globalConfig);

  return accountId
    ? buildLineUrl(accountId, template, { lpk_name: tenantName, ...replacements })
    : "#";
}

function getLineAccountId(globalConfig: Record<string, PublicJson>) {
  return stringValue(
    record(record(globalConfig.line_business_contact).line_contact)
      .line_official_account_id,
  );
}

function getDefaultLineTemplate(globalConfig: Record<string, PublicJson>) {
  return (
    stringValue(
      record(record(globalConfig.line_business_contact).line_contact)
        .default_message_template,
    ) || "こんにちは。{lpk_name}について相談したいです。"
  );
}

function hrefForWhyUsKey(key: string) {
  const hrefs: Record<string, string> = {
    about: "/about",
    recruitment_network: "/recruitment-network",
    sectors: "/sectors",
    training_method: "/training-method",
  };

  return hrefs[key] || "/";
}

function buildPageHref(page: number, currentFilters?: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(currentFilters || {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  params.set("page", String(page));

  return `?${params.toString()}`;
}

function PreviewBanner({ isPreview }: { isPreview: boolean }) {
  return isPreview ? (
    <div className="sticky top-0 z-50 bg-amber-100 px-4 py-3 text-center text-sm font-semibold text-amber-950">
      Preview mode - draft content is not cached
    </div>
  ) : null;
}

function isNewItem(value?: string) {
  if (!value) {
    return false;
  }

  const publishedAt = new Date(value).getTime();

  if (Number.isNaN(publishedAt)) {
    return false;
  }

  return Date.now() - publishedAt <= 7 * 24 * 60 * 60 * 1000;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("ja-JP", { dateStyle: "medium" });
}

function sortedRecords(value: unknown) {
  return arrayOfRecords(value).sort(
    (a, b) => (numberValue(a.sort_order) ?? 0) - (numberValue(b.sort_order) ?? 0),
  );
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

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
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
