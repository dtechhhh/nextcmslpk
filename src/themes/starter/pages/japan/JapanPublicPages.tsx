import Image from "next/image";
import { Check, ExternalLink, Mail, MessageCircle, ShieldCheck } from "lucide-react";

import { normalizeActionLabel } from "@/lib/display-label";
import { FALLBACK_ICON, ICON_REGISTRY, type IconKey } from "@/lib/icon-registry";
import { buildLineUrl } from "@/lib/line";
import { cn } from "@/lib/utils";
import {
  resolveCollectionList,
  resolveMediaUrl,
  resolveOptionLabel,
  type PublicCollectionItem,
  type PublicJson,
} from "@/server/resolvers/public";
import { Badge } from "@/themes/starter/components/ui/Badge";
import { Button } from "@/themes/starter/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/themes/starter/components/ui/Card";
import { Container } from "@/themes/starter/components/ui/Container";
import { CardGrid, type CardGridItem } from "@/themes/starter/components/sections/CardGrid";
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
import {
  HeroSection,
  type HeroCTA,
  type HeroPrimaryCTA,
} from "@/themes/starter/components/sections/HeroSection";
import { HeroSlider } from "@/themes/starter/components/sections/HeroSlider";
import { ImageFeatureSlider } from "@/themes/starter/components/sections/ImageFeatureSlider";
import { RelatedItems } from "@/themes/starter/components/sections/RelatedItems";
import { StatsBar } from "@/themes/starter/components/sections/StatsBar";
import { StepFlow } from "@/themes/starter/components/sections/StepFlow";
import { TeamGrid } from "@/themes/starter/components/sections/TeamGrid";
import { Timeline } from "@/themes/starter/components/sections/Timeline";
import { JapanContactInquiryForm } from "@/themes/starter/pages/japan/JapanContactInquiryForm";
import {
  TrainingEvidence,
  TrainingPartnerReport,
  TrainingProgramOverview,
  TrainingQualityGates,
  TrainingReadinessStandards,
  TrainingRiskSection,
  TrainingSectorModules,
} from "@/themes/starter/pages/japan/TrainingMethodSections";

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
  page?: PublicPageData | null;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  variantId: string;
  isPreview: boolean;
};

type JapanNewsDetailPageProps = JapanDetailPageProps & {
  relatedItems: PublicCollectionItem[];
};

type LeadershipQuoteData = {
  isEnabled: boolean;
  quote: string;
  attributionName: string;
  attributionRole: string;
  photoImageId: string;
};

const JAPAN_DOWNLOAD_LABEL = "Unduh dokumen";
const JAPAN_DETAIL_LABEL = "Lihat detail";
const DEFAULT_LEADERSHIP_QUOTE = {
  isEnabled: true,
  quote:
    "「私たちは単なる労働力の送り出し機関ではありません。候補者が日本で成功するまで、責任を持って関わり続ける長期的なパートナーです。」",
  attributionName: "Aris Supriyadi",
  attributionRole: "代表取締役",
  photoImageId: "",
};

function displayText(source: PublicJson, key: string, fallback: string) {
  return stringValue(source[key]) || fallback;
}

function getJapanTargetPageHref(targetPage: string) {
  const targetMap: Record<string, string> = {
    candidate_profile: "/candidate-profile",
  };

  return targetMap[targetPage] ?? "/candidate-profile";
}

export async function JapanHomepage({
  page,
  globalConfig,
  tenantName,
  isPreview,
  latestNews,
}: JapanHomepageProps) {
  const data = page.dataJson;
  const display = record(data.display_text);
  const whyIndonesia = record(data.why_indonesia_section);
  const partnershipFlow = record(data.partnership_flow);

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
      <StatsBar items={sortedRecords(data.stats).map(toStatItem)} compact />
      <JapanDocumentCardGrid
        title={displayText(display, "achievements_title", "実績・取り組み")}
        items={sortedRecords(data.achievements).map((item, index) => ({
          id: `achievement-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          iconKey: stringValue(item.icon_key),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <SplitSection
        mediaType={stringValue(whyIndonesia.media_type)}
        imageId={stringValue(whyIndonesia.image_id)}
        eyebrowLabel={stringValue(whyIndonesia.eyebrow_label)}
        title={stringValue(whyIndonesia.headline)}
        body={stringValue(whyIndonesia.description)}
        bullets={arrayOfStrings(whyIndonesia.bullet_items)}
        ctaLabel={stringValue(whyIndonesia.cta_label)}
        ctaHref={getJapanTargetPageHref(stringValue(whyIndonesia.target_page))}
        compact
      />
      <CardGrid
        title={displayText(display, "why_us_title", "当社が大切にしていること")}
        variant="japan"
        columns={2}
        items={sortedRecords(data.why_us_cards).map((item, index) => ({
          id: stringValue(item.key) || `why-us-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          href: stringValue(item.href) || hrefForWhyUsKey(stringValue(item.key)),
          iconKey: stringValue(item.icon_key),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <StepFlow
        title={stringValue(partnershipFlow.headline)}
        subtitle={stringValue(partnershipFlow.description)}
        items={sortedRecords(partnershipFlow.items).map((item, index) => ({
          iconKey: stringValue(item.icon_key) || "check",
          stepLabel: stringValue(item.step_label),
          title: stringValue(item.title),
          description: stringValue(item.description),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <JapanDocumentCardGrid
        title={displayText(display, "legalities_title", "法人情報・許認可")}
        items={sortedRecords(data.legalities).map((item, index) => ({
          id: `legality-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          badge: stringValue(item.type_label),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title={displayText(display, "latest_news_title", "採用担当者向け情報")}
        variant="japan"
        items={latestNews.map((item) =>
          newsCard(item, { newBadgeLabel: displayText(display, "new_badge_label", "新着") }),
        )}
        ctaLabel={displayText(display, "latest_news_cta_label", "記事一覧を見る")}
        ctaHref="/news"
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="インドネシア人材の採用についてご相談ください"
        darkVariant
      />
    </>
  );
}

export async function JapanAboutPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const display = record(data.display_text);
  const companyStatus = record(data.company_status);
  const story = record(data.story);
  const japanRelationship = record(data.japan_relationship);
  const educationQuality = record(data.education_quality);
  const operationalReadiness = record(data.operational_readiness);
  const leadershipQuote = getLeadershipQuote(data.leadership_quote);
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
      <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} compact />
      <CompanyStatusSection config={companyStatus} />
      <SplitSection
        imageId={stringValue(story.image_id)}
        eyebrowLabel={stringValue(story.eyebrow_label)}
        title={stringValue(story.headline)}
        body={stringValue(story.body)}
      />
      <JapanRelationshipSection config={japanRelationship} />
      <EducationQualitySection config={educationQuality} />
      <OperationalReadinessSection config={operationalReadiness} />
      <LeadershipQuoteSection quoteData={leadershipQuote} />
      <TeamGrid
        title={displayText(display, "team_title", "Tim")}
        members={await resolveTeamMembers(sortedRecords(data.team_members))}
      />
      <FacilityGallery
        title={displayText(display, "facilities_title", "Fasilitas Pelatihan")}
        items={await resolveGalleryItems(sortedRecords(data.facilities), "image_id")}
      />
      <Timeline
        title={displayText(display, "timeline_title", "Linimasa")}
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
        title={displayText(display, "values_title", "Nilai yang Kami Pegang")}
        variant="japan"
        items={sortedRecords(data.values).map(iconCard)}
      />
      <JapanDocumentCardGrid
        title={displayText(display, "legal_overview_title", "Ringkasan Legalitas")}
        items={sortedRecords(data.legal_overview).map((item, index) => ({
          id: `legal-overview-${index}`,
          title: stringValue(item.title),
          description: buildLegalOverviewDescription(item),
          badge: stringValue(item.type_label),
          documentLabel: stringValue(item.document_label),
          documentUrl: stringValue(item.document_url),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="採用と人材育成について、まずはご相談ください"
        darkVariant
      />
    </>
  );
}

export async function JapanTrainingMethodPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const display = record(data.display_text);
  const programOverview = record(data.program_overview);
  const readinessStandards = record(data.readiness_standards);
  const faqIntro = record(data.faq_intro);
  const hasProgramOverview =
    Boolean(stringValue(programOverview.headline)) ||
    sortedRecords(programOverview.stats).length > 0 ||
    sortedRecords(programOverview.stages).length > 0;
  const hasReadinessStandards =
    Boolean(stringValue(readinessStandards.headline)) ||
    sortedRecords(readinessStandards.criteria).length > 0;

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
      />
      <TrainingRiskSection config={record(data.partner_risks)} />
      <CardGrid
        title={displayText(display, "training_pillars_title", "Pilar Pelatihan")}
        variant="japan"
        items={sortedRecords(data.training_pillars).map(iconCard)}
      />
      {hasProgramOverview ? (
        <TrainingProgramOverview config={programOverview} />
      ) : (
        <StepFlow
          title={displayText(display, "training_flow_title", "Alur Pelatihan")}
          items={sortedRecords(data.training_flow).map(toStepItem)}
        />
      )}
      <DocumentSection config={record(data.curriculum_download)} />
      <CurriculumAreasSection
        title={displayText(display, "curriculum_areas_title", "Area Kurikulum")}
        stats={sortedRecords(data.curriculum_stats).map(toProofStatItem)}
        items={sortedRecords(data.curriculum_areas).map(iconCard)}
      />
      <TrainingSectorModules config={record(data.sector_modules)} />
      {hasReadinessStandards ? (
        <TrainingReadinessStandards config={readinessStandards} />
      ) : (
        <CardGrid
          title={displayText(display, "evaluation_items_title", "Aspek Evaluasi")}
          variant="japan"
          items={sortedRecords(data.evaluation_items).map(iconCard)}
        />
      )}
      <TrainingQualityGates config={record(data.quality_gates)} />
      <TrainingPartnerReport config={record(data.partner_report)} />
      <TrainingEvidence config={record(data.outcome_evidence)} />
      <FacilityGallery
        title={displayText(display, "training_gallery_title", "Galeri Pelatihan")}
        items={await resolveGalleryItems(sortedRecords(data.training_gallery), "media_id")}
      />
      <FAQ
        title={stringValue(faqIntro.headline) || "企業ご担当者様からよくあるご質問"}
        subtitle={stringValue(faqIntro.description)}
        items={sortedRecords(data.faqs).map((item, index) => ({
          question: stringValue(item.question),
          answer: stringValue(item.answer),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="採用要件に合わせた教育内容をご相談ください"
      />
    </>
  );
}

export async function JapanCandidateProfilePage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const hero = record(data.hero);
  const display = record(data.display_text);
  const whyIndonesia = record(data.why_indonesia);
  const partnerPerspective = record(data.partner_perspective);
  const useCandidatePoolHero = stringValue(hero.model) === "candidate_pool";

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      {useCandidatePoolHero ? (
        <CandidatePoolHero
          config={record(data.candidate_pool_hero)}
          fallbackHero={hero}
          pageTitle={props.page.title}
          globalConfig={props.globalConfig}
          tenantName={props.tenantName}
        />
      ) : (
        <JapanHero
          hero={hero}
          pageTitle={props.page.title}
          globalConfig={props.globalConfig}
          tenantName={props.tenantName}
        />
      )}
      <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} />
      <SplitSection
        mediaType={stringValue(whyIndonesia.media_type)}
        imageId={stringValue(whyIndonesia.image_id)}
        title={stringValue(whyIndonesia.headline)}
        body={stringValue(whyIndonesia.description)}
        bullets={arrayOfStrings(whyIndonesia.bullet_items)}
      />
      <CardGrid
        title={displayText(display, "candidate_strengths_title", "候補者の特徴")}
        variant="japan"
        items={sortedRecords(data.candidate_strengths).map(iconCard)}
      />
      <CandidateExamplesSection
        title={displayText(display, "candidate_examples_title", "候補者プロフィール例")}
        items={await resolveCandidateExamples(sortedRecords(data.candidate_examples))}
      />
      <CardGrid
        title={displayText(display, "supported_pathways_title", "対応可能な在留資格・採用ルート")}
        variant="japan"
        items={sortedRecords(data.supported_pathways).map((item, index) => ({
          id: `pathway-${index}`,
          title: stringValue(item.title),
          description: stringValue(item.description),
          badge: stringValue(item.pathway_label),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title={displayText(display, "selection_assurance_title", "選考前の確認体制")}
        subtitle={displayText(
          display,
          "selection_assurance_description",
          "候補者の希望条件、職種理解、日本語学習状況を事前に確認し、企業様の採用基準に沿ってご提案します。",
        )}
        variant="japan"
        items={sortedRecords(data.selection_assurance).map(iconCard)}
      />
      <StepFlow
        title={displayText(display, "handoff_process_title", "ご相談から候補者提案まで")}
        subtitle={displayText(
          display,
          "handoff_process_description",
          "採用条件の確認から候補者紹介、面接調整まで、実務に合わせて段階的に進めます。",
        )}
        items={sortedRecords(data.handoff_process).map(toStepItem)}
      />
      <FAQ
        title={displayText(display, "faq_title", "候補者紹介に関するよくあるご質問")}
        subtitle={displayText(
          display,
          "faq_description",
          "採用条件に合わせた候補者確認を進める前に、よくいただくご質問をまとめました。",
        )}
        items={sortedRecords(data.faqs).map((faq, index) => ({
          question: stringValue(faq.question),
          answer: stringValue(faq.answer),
          sortOrder: numberValue(faq.sort_order) ?? index,
          isEnabled: booleanValue(faq.is_enabled, true),
        }))}
      />
      <CardGrid
        title={displayText(display, "readiness_framework_title", "受け入れ前の準備項目")}
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
        defaultHeadline="採用条件に合う候補者をご提案します"
      />
    </>
  );
}

export async function JapanRecruitmentNetworkPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const hero = record(data.hero);
  const display = record(data.display_text);
  const networkOverview = record(data.network_overview);
  const useNetworkMapHero = stringValue(hero.model) === "network_map";

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      {useNetworkMapHero ? (
        <NetworkMapHero
          hero={hero}
          config={record(data.network_map_hero)}
          pageTitle={props.page.title}
          globalConfig={props.globalConfig}
          tenantName={props.tenantName}
          proofStats={sortedRecords(data.proof_stats)}
          coverageRegions={sortedRecords(data.coverage_regions)}
          recruitmentSources={sortedRecords(data.recruitment_sources)}
        />
      ) : (
        <JapanHero
          hero={hero}
          pageTitle={props.page.title}
          globalConfig={props.globalConfig}
          tenantName={props.tenantName}
        />
      )}
      {useNetworkMapHero ? null : (
        <StatsBar items={sortedRecords(data.proof_stats).map(toProofStatItem)} />
      )}
      <ImageFeature
        imageId={stringValue(networkOverview.map_image_id)}
        galleryMediaIds={arrayOfStrings(networkOverview.gallery_media_ids)}
        title={stringValue(networkOverview.headline)}
        description={stringValue(networkOverview.description)}
      />
      <CardGrid
        title={displayText(display, "coverage_regions_title", "対応エリア")}
        variant="japan"
        items={sortedRecords(data.coverage_regions).map((item, index) => ({
          id: `region-${index}`,
          title: stringValue(item.region_name),
          description: stringValue(item.description),
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <CardGrid
        title={displayText(display, "recruitment_sources_title", "候補者との接点")}
        variant="japan"
        items={sortedRecords(data.recruitment_sources).map(iconCard)}
      />
      <StepFlow
        title={displayText(display, "screening_flow_title", "選考前の確認フロー")}
        items={sortedRecords(data.screening_flow).map(toStepItem)}
      />
      <CardGrid
        title={displayText(display, "network_nodes_title", "情報共有体制")}
        variant="japan"
        items={await resolveNetworkNodeCards(sortedRecords(data.network_nodes))}
      />
      <CardGrid
        title={displayText(display, "quality_control_title", "候補者確認の基準")}
        variant="japan"
        items={sortedRecords(data.quality_control_items).map(iconCard)}
      />
      <FAQ
        title={displayText(display, "faq_title", "採用ネットワークに関するよくあるご質問")}
        subtitle={stringValue(display.faq_description)}
        items={sortedRecords(data.faqs).map((faq, index) => ({
          question: stringValue(faq.question),
          answer: stringValue(faq.answer),
          sortOrder: numberValue(faq.sort_order) ?? index,
          isEnabled: booleanValue(faq.is_enabled, true),
        }))}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="インドネシアから安定した候補者紹介を進めませんか"
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
  const display = record(data.display_text);

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
        display={display}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="採用計画に合う分野をご確認ください"
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
  const display = record(data.display_text);

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
        display={display}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={globalConfig}
        tenantName={tenantName}
        defaultHeadline="Ikuti informasi terbaru dari tim kami"
      />
    </>
  );
}

export async function JapanSectorDetailPage({
  item,
  page,
  globalConfig,
  tenantName,
  isPreview,
}: JapanDetailPageProps) {
  const data = item.dataJson;
  const display = record(page?.dataJson.display_text);
  const lineHref = getLineHref(
    globalConfig,
    tenantName,
    stringValue(data.line_message_template),
    {
      sector_name: item.title,
      lpk_name: tenantName,
    },
  );
  const directDocUrl = stringValue(data.secondary_document_url);
  const legacyDocUrl = await resolveMediaUrl(stringValue(data.secondary_document_file_id));
  const documentUrl = directDocUrl || legacyDocUrl || undefined;

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <DetailHero item={item} />
      <CollectionDetail
        breadcrumb={[
          { label: displayText(display, "breadcrumb_home_label", "ホーム"), href: "/" },
          { label: displayText(display, "breadcrumb_sector_label", "対応分野"), href: "/sectors" },
          { label: item.title },
        ]}
        mainContent={<SectorDetailMain item={item} display={display} />}
        sidebar={
          <SectorSidebar
            item={item}
            lineHref={lineHref}
            documentUrl={documentUrl ?? undefined}
            display={display}
          />
        }
      />
    </>
  );
}

export async function JapanNewsDetailPage({
  item,
  page,
  globalConfig,
  tenantName,
  variantId,
  isPreview,
  relatedItems,
}: JapanNewsDetailPageProps) {
  const display = record(page?.dataJson.display_text);
  const blocks = await resolveJapanContentBlocks(
    arrayOfRecords(item.dataJson.content_blocks),
    variantId,
    globalConfig,
    tenantName,
    { news_title: item.title, lpk_name: tenantName },
  );
  const categoryOption = await resolveOptionLabel(
    stringValue(item.dataJson.category_option_id),
    { variantId, optionSetKey: "japan_news_category" },
  );
  const contentTypeOption = await resolveOptionLabel(
    stringValue(item.dataJson.content_type_option_id),
    { variantId, optionSetKey: "japan_news_content_type" },
  );
  const tagOptions = await Promise.all(
    arrayOfStrings(item.dataJson.tag_option_ids).map((tagId) =>
      resolveOptionLabel(tagId, { variantId, optionSetKey: "japan_news_tag" }),
    ),
  );
  const tagLabels = tagOptions.map((tag) => tag?.label ?? "").filter(Boolean);
  const authorImageUrl = await resolveMediaUrl(stringValue(item.dataJson.author_image_id));
  const authorName = stringValue(item.dataJson.author_name);
  const authorTitle = stringValue(item.dataJson.author_title);
  const subtitle = getCollectionSubtitle(item);
  const partnerRelevance = stringValue(item.dataJson.partner_relevance);
  const keyTakeaways = arrayOfStrings(item.dataJson.key_takeaways);
  const keyFacts = sortedRecords(item.dataJson.key_facts)
    .filter((fact) => booleanValue(fact.is_enabled, true))
    .map((fact) => ({
      label: stringValue(fact.label),
      value: stringValue(fact.value),
    }))
    .filter((fact) => fact.label && fact.value);
  const evidenceItems = sortedRecords(item.dataJson.evidence_items)
    .filter((evidence) => booleanValue(evidence.is_enabled, true))
    .map((evidence) => ({
      title: stringValue(evidence.title),
      description: stringValue(evidence.description),
      sourceLabel: stringValue(evidence.source_label),
      sourceUrl: stringValue(evidence.source_url),
    }))
    .filter((evidence) => evidence.title || evidence.sourceUrl);
  const reviewerName = stringValue(item.dataJson.reviewer_name);
  const reviewerTitle = stringValue(item.dataJson.reviewer_title);
  const reviewedAt = stringValue(item.dataJson.reviewed_at);
  const readingTimeLabel = getNewsReadingTimeLabel(item);
  const articleLineHref = getLineHref(
    globalConfig,
    tenantName,
    stringValue(item.dataJson.article_line_message_template),
    { news_title: item.title },
  );
  const articleCtaLabel =
    stringValue(item.dataJson.article_cta_label) || "採用について相談する";
  const jsonLd = buildNewsArticleJsonLd({
    item,
    tenantName,
    authorName,
    categoryLabel: categoryOption?.label,
    tagLabels,
  });

  return (
    <>
      <PreviewBanner isPreview={isPreview} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <CollectionDetail
        breadcrumb={[
          { label: displayText(display, "breadcrumb_home_label", "ホーム"), href: "/" },
          { label: displayText(display, "breadcrumb_news_label", "お知らせ・コラム"), href: "/news" },
          { label: item.title },
        ]}
        mainContent={
          <article>
            <div className="flex flex-wrap gap-2">
              {contentTypeOption?.label ? (
                <Badge variant="new_badge">{contentTypeOption.label}</Badge>
              ) : null}
              {categoryOption?.label ? (
                <Badge variant="outline">{categoryOption.label}</Badge>
              ) : null}
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              {item.title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-lg font-medium leading-8 text-primary-600">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              {item.publishedAt ? <time>{formatDate(item.publishedAt)}</time> : null}
              <span>{readingTimeLabel}</span>
              {tagLabels.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {isNewItem(item.publishedAt) ? (
                <Badge variant="new_badge">{displayText(display, "new_badge_label", "新着")}</Badge>
              ) : null}
            </div>
            {authorName || authorImageUrl ? (
              <div className="mt-5 flex items-center gap-4">
                {authorImageUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                    <Image
                      src={authorImageUrl}
                      alt={authorName || item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  {authorName ? (
                    <p className="text-sm font-semibold text-neutral-900">{authorName}</p>
                  ) : null}
                  {authorTitle ? (
                    <p className="text-sm text-neutral-500">{authorTitle}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {item.thumbnailSrc ? (
              <div className="relative mt-8 aspect-video overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={item.thumbnailSrc}
                  alt={item.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            {item.excerpt || partnerRelevance ? (
              <section className="mt-8 border-l-4 border-primary-500 bg-neutral-50 px-5 py-5">
                <h2 className="text-lg font-bold text-neutral-950">概要</h2>
                {item.excerpt ? (
                  <p className="mt-3 text-base leading-8 text-neutral-700">{item.excerpt}</p>
                ) : null}
                {partnerRelevance ? (
                  <>
                    <h3 className="mt-5 text-sm font-bold text-neutral-950">受入企業様へのポイント</h3>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">{partnerRelevance}</p>
                  </>
                ) : null}
              </section>
            ) : null}
            <div className="mt-10">
              <ContentBlocks variant="japan" blocks={blocks} />
            </div>
            {evidenceItems.length > 0 ? (
              <section className="mt-12 border-t border-neutral-200 pt-8">
                <h2 className="text-2xl font-bold text-neutral-950">参考資料・根拠</h2>
                <div className="mt-5 space-y-5">
                  {evidenceItems.map((evidence, index) => (
                    <div key={`${evidence.title}-${index}`}>
                      {evidence.title ? (
                        <h3 className="font-bold text-neutral-900">{evidence.title}</h3>
                      ) : null}
                      {evidence.description ? (
                        <p className="mt-2 text-sm leading-7 text-neutral-600">
                          {evidence.description}
                        </p>
                      ) : null}
                      {evidence.sourceUrl ? (
                        <a
                          href={evidence.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                          {evidence.sourceLabel || "公式情報を確認する"}
                          <ExternalLink aria-hidden="true" className="size-4" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {reviewerName || reviewedAt ? (
              <div className="mt-10 flex items-start gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary-600" />
                <p>
                  内容確認: {[reviewerName, reviewerTitle].filter(Boolean).join(" / ")}
                  {reviewedAt ? `（${formatDate(reviewedAt)}確認）` : ""}
                </p>
              </div>
            ) : null}
          </article>
        }
        sidebar={
          <NewsArticleSidebar
            keyTakeaways={keyTakeaways}
            keyFacts={keyFacts}
            lineHref={articleLineHref}
            ctaLabel={articleCtaLabel}
          />
        }
      />
      <RelatedItems
        title={displayText(display, "related_news_title", "関連記事")}
        variant="japan"
        items={relatedItems
          .filter((related) => related.slug !== item.slug)
          .slice(0, 10)
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

function NewsArticleSidebar({
  keyTakeaways,
  keyFacts,
  lineHref,
  ctaLabel,
}: {
  keyTakeaways: string[];
  keyFacts: Array<{ label: string; value: string }>;
  lineHref?: string;
  ctaLabel: string;
}) {
  if (keyTakeaways.length === 0 && keyFacts.length === 0 && !lineHref) {
    return null;
  }

  return (
    <Card variant="japan" className="p-5">
      <CardContent className="p-0">
        {keyTakeaways.length > 0 ? (
          <section>
            <h2 className="text-lg font-bold text-neutral-950">この記事の要点</h2>
            <ul className="mt-4 space-y-3">
              {keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-3 text-sm leading-6 text-neutral-700">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary-600" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {keyFacts.length > 0 ? (
          <dl className="mt-6 space-y-3 border-t border-neutral-200 pt-5">
            {keyFacts.map((fact) => (
              <div key={`${fact.label}-${fact.value}`}>
                <dt className="text-xs font-semibold text-neutral-500">{fact.label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-6 text-neutral-900">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {lineHref ? (
          <Button
            render={<a href={lineHref} />}
            variant="line"
            className="mt-6 w-full"
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            {ctaLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function buildNewsArticleJsonLd({
  item,
  tenantName,
  authorName,
  categoryLabel,
  tagLabels,
}: {
  item: PublicCollectionItem;
  tenantName: string;
  authorName: string;
  categoryLabel?: string;
  tagLabels: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    image: item.heroSrc || item.thumbnailSrc,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt || item.publishedAt,
    articleSection: categoryLabel,
    keywords: tagLabels.join(", ") || undefined,
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@type": "Organization", name: tenantName },
    publisher: { "@type": "Organization", name: tenantName },
    isAccessibleForFree: true,
  };
}

function getNewsReadingTimeLabel(item: PublicCollectionItem) {
  const configured = stringValue(item.dataJson.reading_time_label);

  if (configured) {
    return configured;
  }

  const contentLength = arrayOfRecords(item.dataJson.content_blocks).reduce(
    (total, block) => {
      const data = record(block.data);
      return total + stringValue(data.text).length + stringValue(data.caption).length;
    },
    item.excerpt?.length ?? 0,
  );
  const minutes = Math.max(1, Math.ceil(contentLength / 500));

  return `約${minutes}分`;
}

export async function JapanContactPage(props: JapanPageProps) {
  const data = props.page.dataJson;
  const display = record(data.display_text);
  const channels = record(data.contact_channels);
  const inquiryForm = record(data.inquiry_form);
  const partnershipPic = record(data.partnership_pic);
  const businessInfo = record(data.business_info);
  const globalLineContact = record(props.globalConfig.line_business_contact);
  const globalBusinessInfo = record(globalLineContact.business_info);
  const globalContactNote = record(globalLineContact.business_contact_note);
  const contactEmail =
    stringValue(channels.business_email) || getGlobalBusinessEmail(props.globalConfig);
  const emailSubject =
    stringValue(channels.email_subject_template) ||
    getGlobalEmailSubject(props.globalConfig);
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
    : undefined;
  const languageSupport =
    arrayOfStrings(businessInfo.language_support).length > 0
      ? arrayOfStrings(businessInfo.language_support)
      : arrayOfStrings(globalBusinessInfo.language_support);
  const lineCtaLabel =
    stringValue(channels.line_cta_label) ||
    displayText(display, "line_cta_label", "LINEで相談する");
  const contactFaqs = sortedRecords(data.faqs).map((faq, index) => ({
    question: stringValue(faq.question),
    answer: stringValue(faq.answer),
    sortOrder: numberValue(faq.sort_order) ?? index,
    isEnabled: booleanValue(faq.is_enabled, true),
  }));

  return (
    <>
      <PreviewBanner isPreview={props.isPreview} />
      <JapanContactHero
        hero={record(data.hero)}
        pageTitle={props.page.title}
        lineHref={lineHref}
        lineLabel={lineCtaLabel}
        formLabel={stringValue(channels.form_cta_label) || "お問い合わせフォーム"}
      />
      <ContactTrustStrip items={sortedRecords(data.trust_points)} />
      <ContactChannels
        title={displayText(display, "contact_channels_title", "ご希望の方法でお問い合わせください")}
        description={displayText(
          display,
          "contact_channels_description",
          "ご相談内容やお急ぎの度合いに合わせて、LINE、メール、またはお問い合わせフォームをご利用ください。",
        )}
        lineHref={lineHref}
        lineLabel={lineCtaLabel}
        lineDescription={
          stringValue(channels.line_description) ||
          "お急ぎの方や、まずは簡単に相談したい方におすすめです。"
        }
        email={contactEmail}
        emailSubject={emailSubject}
        emailDescription={
          stringValue(channels.email_description) ||
          "資料の添付や、社内関係者を含むご連絡にご利用ください。"
        }
        formLabel={stringValue(channels.form_cta_label) || "フォームに入力する"}
      />
      <ContactConsultationTopics
        title={displayText(display, "consultation_topics_title", "このようなご相談を承ります")}
        description={displayText(
          display,
          "consultation_topics_description",
          "採用条件がまだ確定していない段階でも、必要な情報を整理しながらご相談いただけます。",
        )}
        items={sortedRecords(data.consultation_topics)}
      />
      <ContactInquirySection
        title={displayText(display, "inquiry_form_title", "採用について相談する")}
        description={displayText(
          display,
          "inquiry_form_description",
          "分かる範囲でご入力ください。入力内容をもとにメールが作成されます。",
        )}
        preparationTitle={displayText(
          display,
          "preparation_title",
          "ご相談時にお知らせいただきたい事項",
        )}
        preparationDescription={displayText(
          display,
          "preparation_description",
          "すべて決まっている必要はありません。現時点で分かる内容だけでご相談いただけます。",
        )}
        preparationItems={arrayOfStrings(data.preparation_items)}
        email={contactEmail}
        emailSubject={emailSubject || "インドネシア人材採用に関するお問い合わせ"}
        submitLabel={stringValue(inquiryForm.submit_label) || "入力内容をメールで送信する"}
        consentLabel={
          stringValue(inquiryForm.consent_label) ||
          "入力内容および個人情報の取り扱いに同意します。"
        }
        responseNote={
          stringValue(inquiryForm.response_note) ||
          "営業時間内に内容を確認し、担当者より順次ご連絡します。"
        }
      />
      <StepFlow
        title={displayText(display, "inquiry_flow_title", "お問い合わせからご提案まで")}
        items={sortedRecords(data.inquiry_flow).map((item, index) => ({
          iconKey: stringValue(item.icon_key) || "check",
          title: stringValue(item.title),
          description: stringValue(item.description),
          sortOrder: numberValue(item.sort_order) ?? index,
          isEnabled: booleanValue(item.is_enabled, true),
        }))}
      />
      <PartnershipPic config={partnershipPic} />
      <ContactInfo
        headline={displayText(display, "business_info_title", "会社・窓口情報")}
        description={
          stringValue(businessInfo.description) || stringValue(globalContactNote.short_note)
        }
        phone={stringValue(globalBusinessInfo.phone_label)}
        email={contactEmail}
        emailSubject={emailSubject}
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
        ctaLabel={displayText(display, "business_info_cta_label", lineCtaLabel)}
        languageSupport={languageSupport}
        ctaHref={lineHref}
        ctaVariant="line"
      />
      <FAQ
        title={displayText(display, "faq_title", "よくあるご質問")}
        items={contactFaqs}
      />
      <FinalCTA
        finalCta={record(data.final_cta)}
        globalConfig={props.globalConfig}
        tenantName={props.tenantName}
        defaultHeadline="インドネシア人材の採用について、まずはご相談ください"
      />
    </>
  );
}

async function JapanContactHero({
  hero,
  pageTitle,
  lineHref,
  lineLabel,
  formLabel,
}: {
  hero: PublicJson;
  pageTitle: string;
  lineHref?: string;
  lineLabel: string;
  formLabel: string;
}) {
  const headline =
    stringValue(hero.headline) ||
    "採用計画に合ったインドネシア人材をご提案します";
  const subheadline =
    stringValue(hero.subheadline) ||
    "特定技能を中心に、候補者のご紹介、日本語・職業教育、面接調整、入国前準備まで一貫してサポートします。まずは貴社の採用課題をお聞かせください。";
  const eyebrowLabel =
    stringValue(hero.eyebrow_label) ||
    "インドネシア人材の採用をご検討の企業様へ";
  const mediaId = stringValue(hero.media_id);
  const mediaSrc = await resolveMediaUrl(mediaId);

  return (
    <section className="relative flex min-h-[420px] items-center overflow-hidden bg-primary-700 py-16 text-white md:min-h-[460px] md:py-20">
      {mediaSrc ? (
        <>
          <Image
            src={mediaSrc}
            alt={stringValue(hero.headline) || pageTitle}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-neutral-950/65" />
        </>
      ) : null}
      <Container className="relative z-10">
        <p className="text-sm font-semibold text-white/75">{eyebrowLabel}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-normal md:text-5xl">
          {headline}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/85 md:text-lg">
          {subheadline}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<a href="#contact-inquiry" />} size="lg" className="w-full sm:w-auto">
            {formLabel}
          </Button>
          {lineHref ? (
            <Button
              render={<a href={lineHref} />}
              size="lg"
              variant="line"
              className="w-full sm:w-auto"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              {lineLabel}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
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
  const primaryCTA = getHeroPrimaryCTA(hero, globalConfig, tenantName, withLineCTA);
  const secondaryCTA = getHeroSecondaryCTA(hero);

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
          secondaryCTA={secondaryCTA}
        />
      );
    }
  }

  const mediaId = stringValue(hero.media_id);
  const mediaSrc = await resolveMediaUrl(mediaId);

  if (!mediaSrc) {
    return (
      <PlainHero
        title={headline}
        subtitle={subheadline}
        eyebrowLabel={eyebrowLabel}
        primaryCTA={primaryCTA}
        secondaryCTA={secondaryCTA}
      />
    );
  }

  const heroMediaType = mediaType === "video" ? "video" : "image";

  return (
    <HeroSection
      mediaType={heroMediaType}
      mediaSrc={heroMediaType === "video" ? getMediaProxyUrl(mediaId) : mediaSrc}
      mediaAlt={headline}
      headline={headline}
      subheadline={subheadline}
      eyebrowLabel={eyebrowLabel}
      primaryCTA={primaryCTA}
      secondaryCTA={secondaryCTA}
      priority
    />
  );
}

function getMediaProxyUrl(mediaId: string) {
  return `/api/media/${encodeURIComponent(mediaId)}`;
}

function getHeroPrimaryCTA(
  hero: PublicJson,
  globalConfig: Record<string, PublicJson>,
  tenantName: string,
  useLegacyLineFallback = false,
): HeroPrimaryCTA | undefined {
  const label =
    stringValue(hero.primary_cta_label) ||
    (useLegacyLineFallback && !hasOwnField(hero, "primary_cta_label")
      ? "Hubungi via LINE"
      : "");
  const href = label
    ? getLineHref(globalConfig, tenantName, stringValue(hero.primary_line_message_template))
    : undefined;

  return label && href ? { label, href, variant: "line" } : undefined;
}

function getHeroSecondaryCTA(hero: PublicJson): HeroCTA | undefined {
  const label = stringValue(hero.secondary_cta_label);
  const href = stringValue(hero.secondary_href);

  return label && href ? { label, href } : undefined;
}

function hasOwnField(value: PublicJson, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function PlainHero({
  title,
  subtitle,
  eyebrowLabel,
  primaryCTA,
  secondaryCTA,
}: {
  title: string;
  subtitle?: string;
  eyebrowLabel?: string;
  primaryCTA?: HeroPrimaryCTA;
  secondaryCTA?: HeroCTA;
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

async function CandidatePoolHero({
  config,
  fallbackHero,
  pageTitle,
  globalConfig,
  tenantName,
}: {
  config: PublicJson;
  fallbackHero: PublicJson;
  pageTitle: string;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
}) {
  const pick = (key: string) => stringValue(config[key]) || stringValue(fallbackHero[key]);
  const headline = pick("headline") || pageTitle;
  const subheadline = pick("subheadline");
  const eyebrowLabel = pick("eyebrow_label");
  const trustNote = stringValue(config.trust_note);
  const ctaSource: PublicJson = {
    ...fallbackHero,
    primary_cta_label: pick("primary_cta_label"),
    primary_line_message_template: pick("primary_line_message_template"),
    secondary_cta_label: pick("secondary_cta_label"),
    secondary_href: pick("secondary_href"),
  };
  const primaryCTA = getHeroPrimaryCTA(ctaSource, globalConfig, tenantName);
  const secondaryCTA = getHeroSecondaryCTA(ctaSource);
  const stats = sortedRecords(config.stats)
    .map(toProofStatItem)
    .filter((item) => item.isEnabled && (item.value || item.label));
  const candidateCards = (await resolveCandidatePoolCards(sortedRecords(config.candidate_cards)))
    .filter(
      (item) =>
        item.isEnabled &&
        (item.name ||
          item.nationalityLabel ||
          item.targetSectorLabel ||
          item.ageLabel ||
          item.japaneseLevelLabel ||
          item.readinessLabel ||
          item.availabilityLabel),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const mediaId = stringValue(fallbackHero.media_id);
  const mediaSrc = await resolveMediaUrl(mediaId);
  const isVideo = stringValue(fallbackHero.media_type) === "video";

  return (
    <section className="relative overflow-hidden bg-primary-700 py-16 text-white md:py-20 lg:py-24">
      {mediaSrc ? (
        <div className="absolute inset-0">
          {isVideo ? (
            <video
              className="h-full w-full object-cover"
              src={getMediaProxyUrl(mediaId)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={headline || undefined}
            />
          ) : (
            <Image
              src={mediaSrc}
              alt={headline}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-primary-900/80" />
        </div>
      ) : null}

      <Container className="relative">
        <div
          className={cn(
            "grid gap-10 lg:items-center",
            candidateCards.length > 0
              ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]"
              : "mx-auto max-w-4xl",
          )}
        >
          <div>
            {eyebrowLabel ? (
              <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
                {eyebrowLabel}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-normal md:text-5xl">
              {headline}
            </h1>
            {subheadline ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
                {subheadline}
              </p>
            ) : null}

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

            {stats.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.slice(0, 3).map((item, index) => {
                  const Icon = ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON;

                  return (
                    <div
                      key={`${item.iconKey}-${item.label}-${index}`}
                      className="rounded-lg border border-white/15 bg-white/10 p-4"
                    >
                      <Icon aria-hidden="true" className="mb-3 size-5 text-red-300" />
                      {item.value ? (
                        <p className="text-2xl font-bold leading-none text-white">
                          {item.value}
                        </p>
                      ) : null}
                      {item.label ? (
                        <p className="mt-2 text-sm leading-5 text-white/70">
                          {item.label}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {trustNote ? (
              <p className="mt-6 max-w-2xl text-sm leading-6 text-white/65">
                {trustNote}
              </p>
            ) : null}
          </div>

          {candidateCards.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {candidateCards.slice(0, 4).map((item, index) => (
                <CandidatePoolHeroCard
                  key={`${item.sortOrder}-${item.name}-${index}`}
                  item={item}
                  className={index % 2 === 1 ? "sm:mt-8" : undefined}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function CandidatePoolHeroCard({
  item,
  className,
}: {
  item: CandidatePoolHeroCardItem;
  className?: string;
}) {
  const displayName =
    item.name || item.initials || item.targetSectorLabel || item.nationalityLabel || "候補者";
  const labels = [
    item.nationalityLabel,
    item.japaneseLevelLabel,
    item.readinessLabel,
    item.availabilityLabel,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/15 bg-white p-4 text-neutral-900 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex size-14 shrink-0 overflow-hidden rounded-lg bg-[var(--color-section-alt)] text-[var(--color-primary)] ring-1 ring-neutral-200">
          {item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={displayName}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="m-auto text-lg font-bold tracking-normal">
              {item.initials || buildCandidateInitials(displayName)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-neutral-950">
            {displayName}
          </h3>
          {item.ageLabel ? (
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {item.ageLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
        {item.targetSectorLabel ? (
          <p className="text-sm font-semibold leading-6 text-neutral-800">
            {item.targetSectorLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

async function NetworkMapHero({
  hero,
  config,
  pageTitle,
  globalConfig,
  tenantName,
  proofStats,
  coverageRegions,
  recruitmentSources,
}: {
  hero: PublicJson;
  config: PublicJson;
  pageTitle: string;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  proofStats: PublicJson[];
  coverageRegions: PublicJson[];
  recruitmentSources: PublicJson[];
}) {
  const headline = stringValue(hero.headline) || pageTitle;
  const subheadline = stringValue(hero.subheadline);
  const eyebrowLabel = stringValue(hero.eyebrow_label);
  const panelTitle = stringValue(config.panel_title) || "採用ネットワークの全体像";
  const panelBadgeLabel = stringValue(config.panel_badge_label) || "ネットワーク概要";
  const trustNote = stringValue(config.trust_note);
  const primaryCTA = getHeroPrimaryCTA(hero, globalConfig, tenantName);
  const secondaryCTA = getHeroSecondaryCTA(hero);
  const stats = proofStats
    .map(toProofStatItem)
    .filter((item) => item.isEnabled && (item.value || item.label))
    .slice(0, 3);
  const regions = coverageRegions
    .map((item, index) => ({
      name: stringValue(item.region_name),
      description: stringValue(item.description),
      sortOrder: numberValue(item.sort_order) ?? index,
      isEnabled: booleanValue(item.is_enabled, true),
    }))
    .filter((item) => item.isEnabled && (item.name || item.description))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 5);
  const sources = recruitmentSources
    .map((item, index) => ({
      iconKey: stringValue(item.icon_key) || "check",
      title: stringValue(item.title),
      description: stringValue(item.description),
      sortOrder: numberValue(item.sort_order) ?? index,
      isEnabled: booleanValue(item.is_enabled, true),
    }))
    .filter((item) => item.isEnabled && (item.title || item.description))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);
  const mediaId = stringValue(hero.media_id);
  const mediaSrc = await resolveMediaUrl(mediaId);
  const isVideo = stringValue(hero.media_type) === "video";

  return (
    <section className="relative overflow-hidden bg-primary-700 py-16 text-white md:py-20 lg:py-24">
      {mediaSrc ? (
        <div className="absolute inset-0">
          {isVideo ? (
            <video
              className="h-full w-full object-cover"
              src={getMediaProxyUrl(mediaId)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={headline || undefined}
            />
          ) : (
            <Image
              src={mediaSrc}
              alt={headline}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-primary-900/80" />
        </div>
      ) : null}

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center">
          <div>
            {eyebrowLabel ? (
              <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
                {eyebrowLabel}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-normal md:text-5xl">
              {headline}
            </h1>
            {subheadline ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
                {subheadline}
              </p>
            ) : null}

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

            {stats.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((item, index) => {
                  const Icon = ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON;

                  return (
                    <div
                      key={`${item.iconKey}-${item.label}-${index}`}
                      className="rounded-lg border border-white/15 bg-white/10 p-4"
                    >
                      <Icon aria-hidden="true" className="mb-3 size-5 text-red-300" />
                      {item.value ? (
                        <p className="text-2xl font-bold leading-none text-white">
                          {item.value}
                        </p>
                      ) : null}
                      {item.label ? (
                        <p className="mt-2 text-sm leading-5 text-white/70">
                          {item.label}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {trustNote ? (
              <p className="mt-6 max-w-2xl text-sm leading-6 text-white/70">
                {trustNote}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-white/15 bg-white p-4 text-neutral-900 shadow-2xl md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-primary-600">
                  {panelBadgeLabel}
                </p>
                <h2 className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {panelTitle}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-950">対応エリア</p>
                {regions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {regions.map((item) => (
                      <Badge key={`${item.sortOrder}-${item.name}`} variant="outline">
                        {item.name || item.description}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    対応エリアを追加すると、ネットワーク概要に表示されます。
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-950">候補者チャネル</p>
                {sources.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {sources.map((item, index) => {
                      const Icon = ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON;

                      return (
                        <div
                          key={`${item.sortOrder}-${item.title}-${index}`}
                          className="flex items-start gap-2"
                        >
                          <Icon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-primary-600"
                          />
                          <div>
                            <p className="text-sm font-semibold leading-5 text-neutral-900">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="text-xs leading-5 text-neutral-500">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    候補者との接点を追加すると、概要に表示されます。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function SplitSection({
  mediaType = "image",
  mediaId,
  imageId,
  eyebrowLabel,
  title,
  body,
  bullets = [],
  ctaLabel,
  ctaHref,
  compact = false,
}: {
  mediaType?: string;
  mediaId?: string;
  imageId?: string;
  eyebrowLabel?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
}) {
  const selectedMediaId = mediaId || imageId || "";
  const mediaSrc = await resolveMediaUrl(selectedMediaId);
  const isVideo = mediaType === "video";

  if (!title && !body && bullets.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "bg-white",
        compact ? "py-14 md:py-16 lg:py-20" : "py-16 md:py-20 lg:py-24",
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {mediaSrc ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
              {isVideo ? (
                <video
                  className="h-full w-full object-cover"
                  src={getMediaProxyUrl(selectedMediaId)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={title || undefined}
                />
              ) : (
                <Image
                  src={mediaSrc}
                  alt={title || ""}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
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

async function LeadershipQuoteSection({
  quoteData,
}: {
  quoteData: LeadershipQuoteData;
}) {
  if (!quoteData.isEnabled || !quoteData.quote) {
    return null;
  }

  const photoSrc = await resolveMediaUrl(quoteData.photoImageId);
  const attribution = [quoteData.attributionName, quoteData.attributionRole]
    .filter(Boolean)
    .join(" / ");

  return (
    <section className="bg-primary-700 py-16 text-white md:py-20 lg:py-24">
      <Container>
        <div
          className={
            photoSrc
              ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center"
              : "mx-auto max-w-5xl"
          }
        >
          <blockquote>
            <div className="mb-8 h-1 w-20 bg-red-500" />
            <p className="text-2xl font-semibold leading-relaxed tracking-normal md:text-3xl md:leading-relaxed">
              {quoteData.quote}
            </p>
            {attribution ? (
              <footer className="mt-8 text-sm font-medium tracking-normal text-white/75">
                {attribution}
              </footer>
            ) : null}
          </blockquote>
          {photoSrc ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/15 bg-white/10">
              <Image
                src={photoSrc}
                alt={quoteData.attributionName || quoteData.attributionRole || ""}
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function CompanyStatusSection({ config }: { config: PublicJson }) {
  const headline = stringValue(config.headline);
  const description = stringValue(config.description);
  const facts = sortedRecords(config.facts).filter(
    (item) =>
      booleanValue(item.is_enabled, true) &&
      (stringValue(item.value) || stringValue(item.label) || stringValue(item.description)),
  );

  if (!headline && !description && facts.length === 0) {
    return null;
  }

  return (
    <section id="company-profile" className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div>
            {stringValue(config.eyebrow_label) ? (
              <p className="text-sm font-semibold uppercase tracking-normal text-primary-500">
                {stringValue(config.eyebrow_label)}
              </p>
            ) : null}
            {headline ? (
              <h2 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
                {headline}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-neutral-600">
                {description}
              </p>
            ) : null}
            {stringValue(config.status_label) || stringValue(config.last_updated_label) ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {stringValue(config.status_label) ? (
                  <Badge variant="info">{stringValue(config.status_label)}</Badge>
                ) : null}
                {stringValue(config.last_updated_label) ? (
                  <span className="text-sm text-neutral-500">
                    {stringValue(config.last_updated_label)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {facts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {facts.map((item, index) => {
                const iconKey = stringValue(item.icon_key) || "building_2";
                const Icon = ICON_REGISTRY[iconKey as IconKey] ?? FALLBACK_ICON;

                return (
                  <article
                    key={`${stringValue(item.label)}-${index}`}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <Icon aria-hidden="true" className="size-6 text-primary-500" />
                    {stringValue(item.value) ? (
                      <p className="mt-4 text-2xl font-bold text-neutral-950">
                        {stringValue(item.value)}
                      </p>
                    ) : null}
                    {stringValue(item.label) ? (
                      <h3 className="mt-1 font-semibold text-neutral-900">
                        {stringValue(item.label)}
                      </h3>
                    ) : null}
                    {stringValue(item.description) ? (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        {stringValue(item.description)}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function JapanRelationshipSection({ config }: { config: PublicJson }) {
  const headline = stringValue(config.headline);
  const description = stringValue(config.description);
  const people = sortedRecords(config.people).filter(
    (item) => booleanValue(item.is_enabled, true) && stringValue(item.name),
  );
  const cooperationScope = arrayOfStrings(config.cooperation_scope);

  if (!headline && !description && people.length === 0 && cooperationScope.length === 0) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {stringValue(config.eyebrow_label) ? (
            <p className="text-sm font-semibold uppercase tracking-normal text-primary-500">
              {stringValue(config.eyebrow_label)}
            </p>
          ) : null}
          {headline ? (
            <h2 className="mt-3 text-3xl font-bold text-neutral-900 md:text-4xl">
              {headline}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-5 text-base leading-8 text-neutral-600 md:text-lg">
              {description}
            </p>
          ) : null}
        </div>

        {people.length > 0 ? (
          <div className="relative mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
            {people.slice(0, 2).map((person, index) => (
              <article
                key={`${stringValue(person.name)}-${index}`}
                className="rounded-lg border border-neutral-200 bg-white p-6"
              >
                {stringValue(person.side_label) ? (
                  <Badge variant="outline">{stringValue(person.side_label)}</Badge>
                ) : null}
                <h3 className="mt-4 text-xl font-bold text-neutral-950">
                  {stringValue(person.name)}
                </h3>
                {[stringValue(person.role), stringValue(person.organization)]
                  .filter(Boolean)
                  .map((line) => (
                    <p key={line} className="mt-1 text-sm font-medium text-primary-600">
                      {line}
                    </p>
                  ))}
                {stringValue(person.summary) ? (
                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {stringValue(person.summary)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {cooperationScope.length > 0 ? (
          <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-primary-100 bg-white p-6">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = ICON_REGISTRY.handshake;
                return <Icon aria-hidden="true" className="size-6 text-primary-500" />;
              })()}
              <h3 className="text-lg font-bold text-neutral-900">連携の主な領域</h3>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cooperationScope.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-neutral-700">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {stringValue(config.clarification_note) ? (
          <p className="mx-auto mt-5 max-w-5xl text-sm leading-6 text-neutral-500">
            {stringValue(config.clarification_note)}
          </p>
        ) : null}
      </Container>
    </section>
  );
}

async function EducationQualitySection({ config }: { config: PublicJson }) {
  const headline = stringValue(config.headline);
  const description = stringValue(config.description);
  const focusItems = arrayOfStrings(config.focus_items);
  const imageSrc = await resolveMediaUrl(stringValue(config.image_id));

  if (!headline && !description && focusItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-primary-700 py-16 text-white md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)] lg:items-center">
          <div>
            {stringValue(config.eyebrow_label) ? (
              <p className="text-sm font-semibold uppercase tracking-normal text-white/70">
                {stringValue(config.eyebrow_label)}
              </p>
            ) : null}
            {stringValue(config.qualification_label) ? (
              <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3">
                {(() => {
                  const Icon = ICON_REGISTRY.award;
                  return <Icon aria-hidden="true" className="size-7 text-red-300" />;
                })()}
                <span className="text-xl font-bold">{stringValue(config.qualification_label)}</span>
              </div>
            ) : null}
            {headline ? (
              <h2 className="mt-6 text-3xl font-bold leading-tight md:text-4xl">{headline}</h2>
            ) : null}
            {description ? (
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/80">{description}</p>
            ) : null}
            {stringValue(config.leader_name) || stringValue(config.leader_role) ? (
              <div className="mt-6">
                <p className="font-bold text-white">{stringValue(config.leader_name)}</p>
                <p className="mt-1 text-sm text-white/70">
                  {[stringValue(config.leader_role), stringValue(config.experience_label)]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {imageSrc ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/15 bg-white/10">
                <Image
                  src={imageSrc}
                  alt={stringValue(config.leader_name) || headline}
                  fill
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            {focusItems.length > 0 ? (
              <div className="rounded-lg border border-white/15 bg-white/10 p-6">
                <h3 className="font-bold text-white">教育品質の重点項目</h3>
                <ul className="mt-4 space-y-3">
                  {focusItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-white/80">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-red-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function OperationalReadinessSection({ config }: { config: PublicJson }) {
  const items = sortedRecords(config.items).filter(
    (item) => booleanValue(item.is_enabled, true) && stringValue(item.title),
  );

  if (!stringValue(config.headline) && !stringValue(config.description) && items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {stringValue(config.headline) ? (
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              {stringValue(config.headline)}
            </h2>
          ) : null}
          {stringValue(config.description) ? (
            <p className="mt-4 text-base leading-8 text-neutral-600 md:text-lg">
              {stringValue(config.description)}
            </p>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {items.map((item, index) => {
              const status = stringValue(item.status);
              const iconKey = stringValue(item.icon_key) || "circle_check";
              const Icon = ICON_REGISTRY[iconKey as IconKey] ?? FALLBACK_ICON;
              const badgeVariant =
                status === "completed" ? "success" : status === "in_progress" ? "info" : "neutral";

              return (
                <article
                  key={`${stringValue(item.title)}-${index}`}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon aria-hidden="true" className="size-6 shrink-0 text-primary-500" />
                    {stringValue(item.status_label) ? (
                      <Badge variant={badgeVariant}>{stringValue(item.status_label)}</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-neutral-900">
                    {stringValue(item.title)}
                  </h3>
                  {stringValue(item.description) ? (
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {stringValue(item.description)}
                    </p>
                  ) : null}
                  {stringValue(item.target_label) ? (
                    <p className="mt-4 text-xs font-semibold text-neutral-500">
                      {stringValue(item.target_label)}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
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
              <h2 className="text-2xl font-bold text-neutral-900">{visionHeadline || "Visi"}</h2>
              {visionDescription ? (
                <p className="mt-4 leading-7 text-neutral-600">{visionDescription}</p>
              ) : null}
            </CardContent>
          </Card>
          <Card variant="japan" className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-neutral-900">{missionHeadline || "Misi"}</h2>
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

  const directUrl = stringValue(config.file_url);
  const legacyUrl = await resolveMediaUrl(stringValue(config.file_id));
  const fileUrl = directUrl || legacyUrl;
  const metadata = [
    stringValue(config.version_label),
    stringValue(config.updated_label),
    stringValue(config.language_label),
    stringValue(config.scope_label),
  ].filter(Boolean);

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
                {stringValue(config.headline) || "Kurikulum"}
              </h2>
              {stringValue(config.description) ? (
                <p className="mt-2 leading-7 text-neutral-600">
                  {stringValue(config.description)}
                </p>
              ) : null}
              {metadata.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {metadata.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <DocumentDownload
              label={stringValue(config.button_label) || "Unduh"}
              fileUrl={fileUrl}
              fallbackLabel={JAPAN_DOWNLOAD_LABEL}
              variant="outline"
            />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

function CurriculumAreasSection({
  title,
  stats,
  items,
}: {
  title: string;
  stats: CurriculumStatItem[];
  items: CardGridItem[];
}) {
  const enabledStats = stats.filter((item) => item.isEnabled);
  const enabledItems = items.filter((item) => item.isEnabled !== false);
  const statGridClass =
    enabledStats.length <= 3
      ? "lg:grid-cols-3"
      : enabledStats.length === 4
        ? "lg:grid-cols-4"
        : enabledStats.length === 5
          ? "lg:grid-cols-5"
          : "lg:grid-cols-6";

  if (enabledStats.length === 0 && enabledItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            {title}
          </h2>
        </div>

        {enabledStats.length > 0 ? (
          <div
            className={cn(
              "mb-10 grid grid-cols-2 gap-y-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-8 shadow-sm",
              statGridClass,
            )}
          >
            {enabledStats.map((item, index) => {
              const Icon = ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON;

              return (
                <div
                  key={`${item.iconKey}-${item.label}-${index}`}
                  className={cn(
                    "flex flex-col items-center px-4 text-center",
                    index > 0 && "lg:border-l lg:border-dashed lg:border-neutral-200",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="mb-3 size-7 text-[var(--color-primary)]"
                  />
                  <p className="text-2xl font-bold leading-none text-neutral-900 md:text-3xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-neutral-500">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {enabledItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enabledItems.map((item) => {
              const Icon = item.iconKey
                ? ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON
                : null;

              return (
                <Card key={item.id} variant="japan" className="h-full gap-0 py-0">
                  {Icon ? (
                    <div className="px-4 pt-6">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-section-alt)] text-[var(--color-primary)]">
                        <Icon aria-hidden="true" className="size-6" />
                      </div>
                    </div>
                  ) : null}
                  <CardContent className="flex flex-1 flex-col pt-5">
                    <h3 className="text-lg font-semibold leading-snug text-neutral-900">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="mt-3 text-sm leading-6 text-neutral-600">
                        {item.description}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

type CurriculumStatItem = {
  iconKey: string;
  value: string;
  label: string;
  isEnabled: boolean;
};

function CandidateExamplesSection({
  title,
  items,
}: {
  title: string;
  items: CandidateExampleCard[];
}) {
  const enabledItems = items
    .filter(
      (item) =>
        item.isEnabled &&
        (item.name ||
          item.backgroundText ||
          item.targetPathText ||
          item.languageText ||
          item.characterText ||
          item.screeningText ||
          item.availabilityText),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (enabledItems.length === 0) {
    return null;
  }

  return (
    <section id="candidate-profiles" className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {enabledItems.map((item) => (
            <CandidateExampleCard key={`${item.sortOrder}-${item.name}`} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function CandidateExampleCard({ item }: { item: CandidateExampleCard }) {
  const details = [
    { label: item.backgroundLabel, value: item.backgroundText },
    { label: item.targetPathLabel, value: item.targetPathText },
    { label: item.languageLabel, value: item.languageText },
    { label: item.characterLabel, value: item.characterText },
    { label: item.screeningLabel, value: item.screeningText },
    { label: item.availabilityLabel, value: item.availabilityText },
  ].filter((detail) => detail.value);

  return (
    <Card variant="japan" className="h-full p-6">
      <CardContent className="flex h-full flex-col p-0">
        <div className="flex items-start gap-4">
          <div className="relative flex size-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-section-alt)] text-[var(--color-primary)] ring-1 ring-neutral-200">
            {item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="m-auto text-xl font-bold tracking-normal">
                {item.initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-tight text-neutral-900">
              {item.name}
            </h3>
            {item.ageOriginLabel ? (
              <p className="mt-1 text-sm font-medium text-neutral-500">
                {item.ageOriginLabel}
              </p>
            ) : null}
          </div>
        </div>

        {item.highlightTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {item.highlightTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <dl className="mt-6 flex flex-1 flex-col gap-5">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                {detail.label}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-neutral-700">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>

        {item.readinessIsEnabled && item.readinessLabel ? (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <Check aria-hidden="true" className="size-4" />
            <span>{item.readinessLabel}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type CandidateExampleCard = {
  initials: string;
  name: string;
  ageOriginLabel: string;
  backgroundLabel: string;
  backgroundText: string;
  targetPathLabel: string;
  targetPathText: string;
  languageLabel: string;
  languageText: string;
  characterLabel: string;
  characterText: string;
  screeningLabel: string;
  screeningText: string;
  availabilityLabel: string;
  availabilityText: string;
  readinessLabel: string;
  readinessIsEnabled: boolean;
  highlightTags: string[];
  imageSrc?: string;
  sortOrder: number;
  isEnabled: boolean;
};

type CandidatePoolHeroCardItem = {
  initials: string;
  name: string;
  nationalityLabel: string;
  targetSectorLabel: string;
  ageLabel: string;
  japaneseLevelLabel: string;
  readinessLabel: string;
  availabilityLabel: string;
  imageSrc?: string;
  sortOrder: number;
  isEnabled: boolean;
};

type SectorMediaItem = {
  mediaSrc: string;
  title: string;
  description: string;
  sortOrder: number;
  isEnabled: boolean;
};

type SectorCandidateSnapshot = {
  initials: string;
  name: string;
  profileLabel: string;
  languageLabel: string;
  skillStatusLabel: string;
  experienceLabel: string;
  availabilityLabel: string;
  imageSrc?: string;
  sortOrder: number;
  isEnabled: boolean;
};

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
    isEnabled?: boolean;
  }>;
}) {
  const visibleItems = items.filter(
    (item) => item.isEnabled !== false && (item.title || item.description),
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <h2 className="mb-10 text-center text-3xl font-bold text-neutral-900 md:text-4xl">
          {title}
        </h2>
        <div
          className={cn(
            "grid gap-6 sm:grid-cols-2",
            visibleItems.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
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
                  <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-6 text-neutral-600">
                    {item.description}
                  </p>
                ) : null}
                {item.documentUrl ? (
                  <div className="mt-6">
                    <DocumentDownload
                      label={item.documentLabel || JAPAN_DOWNLOAD_LABEL}
                      fileUrl={item.documentUrl}
                      fallbackLabel={JAPAN_DOWNLOAD_LABEL}
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
}: {
  finalCta: PublicJson;
  globalConfig: Record<string, PublicJson>;
  tenantName: string;
  defaultHeadline: string;
  darkVariant?: boolean;
}) {
  const directUrl = stringValue(finalCta.secondary_document_url);
  const legacyMediaUrl = await resolveMediaUrl(stringValue(finalCta.secondary_document_file_id));
  const secondaryDocumentUrl = directUrl || legacyMediaUrl || undefined;
  const secondaryHref = secondaryDocumentUrl || stringValue(finalCta.secondary_href);
  const secondaryLabel = secondaryHref
    ? normalizeActionLabel(
        stringValue(finalCta.secondary_cta_label),
        secondaryDocumentUrl ? JAPAN_DOWNLOAD_LABEL : JAPAN_DETAIL_LABEL,
        secondaryHref,
      )
    : "";
  const primaryLineHref = getLineHref(
    globalConfig,
    tenantName,
    stringValue(finalCta.primary_line_message_template),
    { lpk_name: tenantName },
  );

  return (
    <CTABanner
      headline={stringValue(finalCta.headline) || defaultHeadline}
      description={stringValue(finalCta.description)}
      primaryCTA={
        primaryLineHref
          ? {
              label: stringValue(finalCta.primary_cta_label) || "LINEで採用相談",
              href: primaryLineHref,
              variant: "line",
            }
          : undefined
      }
      secondaryCTA={
        secondaryHref
          ? { label: secondaryLabel, href: secondaryHref }
          : undefined
      }
      darkVariant={darkVariant}
    />
  );
}

async function ImageFeature({
  imageId,
  galleryMediaIds = [],
  title,
  description,
}: {
  imageId?: string;
  galleryMediaIds?: string[];
  title?: string;
  description?: string;
}) {
  const slideIds = galleryMediaIds.length > 0 ? galleryMediaIds : imageId ? [imageId] : [];
  const slides = (
    await Promise.all(
      slideIds.map(async (mediaId) => {
        const mediaSrc = await resolveMediaUrl(mediaId);
        return mediaSrc ? { mediaSrc, mediaAlt: title || "" } : null;
      }),
    )
  ).filter((slide): slide is { mediaSrc: string; mediaAlt: string } => Boolean(slide));

  if (slides.length === 0 && !title && !description) {
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
        <ImageFeatureSlider slides={slides} title={title} />
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
  display,
}: {
  kind: "sector" | "news";
  collection: JapanListPageProps["collection"];
  filters: FilterBarFilter[];
  currentFilters: Record<string, string>;
  detailPathPrefix: string;
  display: PublicJson;
}) {
  const safePage = Math.min(Math.max(collection.page, 1), Math.max(collection.totalPages, 1));
  const pages = Array.from({ length: collection.totalPages }, (_, index) => index + 1);
  const startItem = collection.total === 0 ? 0 : (safePage - 1) * collection.pageSize + 1;
  const endItem = Math.min(safePage * collection.pageSize, collection.total);
  const cardCtaLabel = displayText(
    display,
    "card_cta_label",
    kind === "news" ? "Baca" : "Lihat Detail",
  );
  const featuredBadgeLabel = displayText(display, "featured_badge_label", "Unggulan");
  const newBadgeLabel = displayText(display, "new_badge_label", "Baru");

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {filters.length > 0 ? (
          <FilterBar filters={filters} currentValues={currentFilters} variant="japan" />
        ) : null}
        <div className="mb-6 text-sm text-neutral-500">
          全{collection.total}件中 {startItem}-{endItem}件を表示
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((item) => {
            const labels = getJapanCardLabels(kind, item, filters);
            const subtitle = getCollectionSubtitle(item);
            const sectorFacts = kind === "sector" ? getSectorCardFacts(item) : [];

            return (
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
                      <Badge variant="new_badge">{newBadgeLabel}</Badge>
                    ) : null}
                    {item.isFeatured ? <Badge variant="outline">{featuredBadgeLabel}</Badge> : null}
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-neutral-900">
                    {item.title}
                  </h3>
                  {subtitle ? (
                    <p className="mt-2 text-sm font-medium leading-6 text-primary-600">
                      {subtitle}
                    </p>
                  ) : null}
                  {labels.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <Badge key={label} variant="outline">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {item.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {sectorFacts.length > 0 ? (
                    <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
                      {sectorFacts.map((fact) => (
                        <div key={fact.label} className="grid grid-cols-[92px_1fr] gap-2 text-xs">
                          <dt className="font-medium text-neutral-500">{fact.label}</dt>
                          <dd className="font-semibold leading-5 text-neutral-800">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {kind === "news" && item.publishedAt ? (
                    <p className="mt-4 text-sm text-neutral-500">
                      {formatDate(item.publishedAt)}
                    </p>
                  ) : null}
                </CardContent>
                <CardFooter className="p-5">
                  <Button className="w-full">{cardCtaLabel}</Button>
                </CardFooter>
              </Card>
              </a>
            );
          })}
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

function getSectorCardFacts(item: PublicCollectionItem) {
  return [
    { label: "在留資格", value: stringValue(item.dataJson.pathway_label) },
    { label: "日本語", value: stringValue(item.dataJson.language_target_label) },
    { label: "候補者提案", value: stringValue(item.dataJson.readiness_lead_time_label) },
  ].filter((fact) => fact.value);
}

function getJapanCardLabels(
  kind: "sector" | "news",
  item: PublicCollectionItem,
  filters: FilterBarFilter[],
) {
  if (kind === "news") {
    const contentTypeId = stringValue(item.dataJson.content_type_option_id);
    const contentTypeLabel = getFilterOptionLabel(filters, "content_type", contentTypeId);
    const categoryId = stringValue(item.dataJson.category_option_id);
    const categoryLabel = getFilterOptionLabel(filters, "category", categoryId);
    const tagLabels = arrayOfStrings(item.dataJson.tag_option_ids)
      .map((tagId) => getFilterOptionLabel(filters, "tag", tagId))
      .filter(Boolean);

    return [contentTypeLabel, categoryLabel, ...tagLabels].filter(Boolean).slice(0, 3);
  }

  const categoryId = stringValue(item.dataJson.sector_category_option_id);
  const categoryLabel = getFilterOptionLabel(filters, "sector_category", categoryId);

  return categoryLabel ? [categoryLabel] : [];
}

function getFilterOptionLabel(filters: FilterBarFilter[], key: string, value: string) {
  if (!value) {
    return "";
  }

  return filters
    .find((filter) => filter.key === key)
    ?.options.find((option) => option.value === value)
    ?.label ?? "";
}

function getCollectionSubtitle(item: PublicCollectionItem) {
  const subtitle = stringValue(item.dataJson.subtitle);

  return subtitle && subtitle !== item.excerpt ? subtitle : "";
}

function DetailHero({ item }: { item: PublicCollectionItem }) {
  const imageSrc = item.heroSrc || item.thumbnailSrc;
  const subtitle = getCollectionSubtitle(item) || item.excerpt;

  if (imageSrc) {
    return (
      <HeroSection
        mediaType="image"
        mediaSrc={imageSrc}
        mediaAlt={item.title}
        headline={item.title}
        subheadline={subtitle}
        priority
      />
    );
  }

  return <PlainHero title={item.title} subtitle={subtitle} />;
}

async function SectorDetailMain({
  item,
  display,
}: {
  item: PublicCollectionItem;
  display: PublicJson;
}) {
  const data = item.dataJson;
  const capabilityStats = sortedRecords(data.capability_stats)
    .map(toProofStatItem)
    .filter((stat) => stat.isEnabled && (stat.value || stat.label));
  const positions = sortedRecords(data.position_competencies).filter(
    (position) =>
      booleanValue(position.is_enabled, true) &&
      (stringValue(position.title) || stringValue(position.practical_skills)),
  );
  const curriculumModules = sortedRecords(data.curriculum_modules).filter(
    (module) =>
      booleanValue(module.is_enabled, true) &&
      (stringValue(module.title) || stringValue(module.description)),
  );
  const facilities = await resolveSectorMediaItems(sortedRecords(data.facility_items));
  const evidence = await resolveSectorMediaItems(sortedRecords(data.evidence_gallery));
  const candidates = await resolveSectorCandidateSnapshots(
    sortedRecords(data.candidate_snapshots),
  );
  const hasCapabilityDossier =
    capabilityStats.length > 0 ||
    positions.length > 0 ||
    curriculumModules.length > 0 ||
    facilities.length > 0 ||
    evidence.length > 0;

  return (
    <article className="space-y-14">
      <SectorCapabilitySummary
        item={item}
        stats={capabilityStats}
        data={data}
      />
      <SectorPositionCompetencies items={positions} />
      <SectorCurriculumModules items={curriculumModules} />
      <SectorMediaGrid
        title="分野・選考イメージ"
        description="掲載画像は分野イメージです。実際の教育内容、選考方法、候補者情報は採用案件ごとにご案内します。"
        items={facilities}
      />
      <SectorCandidateSnapshots items={candidates} />
      <InlineCardSet
        title="選考品質の考え方"
        items={sortedRecords(data.quality_assurance_items)}
      />
      <InlineCardSet
        title="採用・入社準備サポート"
        items={sortedRecords(data.placement_support_items)}
      />
      <SectorMediaGrid
        title="教育・評価資料"
        description="教育内容や評価資料は、求人条件と選考方針を確認したうえで個別にご案内します。"
        items={evidence}
      />
      {!hasCapabilityDossier ? (
        <>
          <InlineCardSet
            title={displayText(display, "suitability_title", "対応方針")}
            items={sortedRecords(data.suitability_items)}
          />
          <InlineCardSet
            title={displayText(display, "example_positions_title", "主な職種")}
            items={sortedRecords(data.example_positions)}
          />
          <InlineCardSet
            title={displayText(display, "training_alignment_title", "教育内容")}
            items={sortedRecords(data.training_alignment_items)}
          />
        </>
      ) : null}
      <RequirementList
        title={displayText(display, "requirements_title", "ご相談時にお知らせいただきたい事項")}
        items={arrayOfStrings(data.candidate_requirements)}
      />
      <StepFlow
        title={displayText(display, "process_title", "採用支援の流れ")}
        items={sortedRecords(data.process_items).map(toStepItem)}
      />
      <FAQ
        title={displayText(display, "faq_title", "よくあるご質問")}
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

function SectorCapabilitySummary({
  item,
  stats,
  data,
}: {
  item: PublicCollectionItem;
  stats: ReturnType<typeof toProofStatItem>[];
  data: PublicJson;
}) {
  const summaryFacts = [
    { label: "在留資格", value: stringValue(data.pathway_label) },
    { label: "日本語要件", value: stringValue(data.language_target_label) },
    { label: "技能要件", value: stringValue(data.skill_test_label) },
    { label: "候補者提案", value: stringValue(data.readiness_lead_time_label) },
  ].filter((fact) => fact.value);
  const referenceUrl = stringValue(data.reference_url);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        {stringValue(data.data_status_label) ? (
          <Badge variant="warning">{stringValue(data.data_status_label)}</Badge>
        ) : null}
        {stringValue(data.last_verified_label) ? (
          <span className="text-sm text-neutral-500">
            {stringValue(data.last_verified_label)}
          </span>
        ) : null}
      </div>
      <h2 className="mt-4 text-3xl font-bold leading-tight text-neutral-950 md:text-4xl">
        {item.title}分野の採用・人材育成支援
      </h2>
      {item.excerpt ? (
        <p className="mt-4 text-lg leading-8 text-neutral-600">{item.excerpt}</p>
      ) : null}
      {stringValue(data.overview) ? (
        <p className="mt-5 whitespace-pre-line leading-8 text-neutral-700">
          {stringValue(data.overview)}
        </p>
      ) : null}

      {summaryFacts.length > 0 ? (
        <dl className="mt-7 grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
          {summaryFacts.map((fact) => (
            <div key={fact.label} className="bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                {fact.label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6 text-neutral-900">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {stats.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.slice(0, 4).map((stat, index) => {
            const Icon = ICON_REGISTRY[stat.iconKey as IconKey] ?? FALLBACK_ICON;

            return (
              <div
                key={`${stat.label}-${index}`}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              >
                <Icon aria-hidden="true" className="size-5 text-primary-600" />
                <p className="mt-4 text-2xl font-bold leading-none text-neutral-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-5 text-neutral-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {referenceUrl ? (
        <a
          href={referenceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          出入国在留管理庁の公式情報を確認する
        </a>
      ) : null}
    </section>
  );
}

function SectorPositionCompetencies({ items }: { items: PublicJson[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-950">対象業務と選考時の確認項目</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
        受入企業様の職務内容をもとに、候補者の経験、日本語力、適性、安全意識を確認します。
      </p>
      <div className="mt-6 space-y-4">
        {items.map((position, index) => {
          const details = [
            { label: "主な業務", value: stringValue(position.duties) },
            { label: "事前確認項目", value: stringValue(position.practical_skills) },
            { label: "設備・職務条件", value: stringValue(position.tools_equipment) },
            { label: "安全・品質", value: stringValue(position.safety_focus) },
            { label: "選考基準", value: stringValue(position.pass_standard) },
          ].filter((detail) => detail.value);

          return (
            <div key={`${stringValue(position.title)}-${index}`} className="rounded-lg border border-neutral-200 p-5">
              <h3 className="text-lg font-bold text-neutral-950">
                {stringValue(position.title) || `職種 ${index + 1}`}
              </h3>
              <dl className="mt-5 grid gap-5 md:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                      {detail.label}
                    </dt>
                    <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-700">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectorCurriculumModules({ items }: { items: PublicJson[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-950">日本語教育・入社前準備</h2>
      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
        <div className="hidden grid-cols-[1.2fr_0.55fr_0.55fr_1fr] gap-4 bg-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-neutral-500 md:grid">
          <span>教育・確認項目</span>
          <span>基礎</span>
          <span>実践</span>
          <span>確認方法</span>
        </div>
        <div className="divide-y divide-neutral-200">
          {items.map((module, index) => (
            <div
              key={`${stringValue(module.title)}-${index}`}
              className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.55fr_0.55fr_1fr]"
            >
              <div>
                <h3 className="font-bold text-neutral-950">{stringValue(module.title)}</h3>
                {stringValue(module.description) ? (
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {stringValue(module.description)}
                  </p>
                ) : null}
              </div>
              <CurriculumValue label="基礎" value={stringValue(module.theory_hours_label)} />
              <CurriculumValue label="実践" value={stringValue(module.practical_hours_label)} />
              <CurriculumValue label="確認方法" value={stringValue(module.evaluation_method)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500 md:hidden">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-6 text-neutral-800 md:mt-0">
        {value || "-"}
      </p>
    </div>
  );
}

function SectorMediaGrid({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: SectorMediaItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-950">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p>
      ) : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((media, index) => (
          <figure key={`${media.mediaSrc}-${index}`} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative aspect-video bg-neutral-100">
              <Image
                src={media.mediaSrc}
                alt={media.title || title}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            {media.title || media.description ? (
              <figcaption className="p-4">
                {media.title ? <p className="font-bold text-neutral-950">{media.title}</p> : null}
                {media.description ? (
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{media.description}</p>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function SectorCandidateSnapshots({ items }: { items: SectorCandidateSnapshot[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-950">候補者プロフィール例</h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600">
        実際の候補者情報は、求人条件を確認したうえで個別にご案内します。
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((candidate, index) => (
          <div key={`${candidate.name}-${index}`} className="rounded-lg border border-neutral-200 p-5">
            <div className="flex items-start gap-4">
              <div className="relative flex size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 text-primary-700">
                {candidate.imageSrc ? (
                  <Image
                    src={candidate.imageSrc}
                    alt={candidate.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="m-auto text-lg font-bold">{candidate.initials}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-neutral-950">{candidate.name}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{candidate.profileLabel}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <CandidateFact label="日本語" value={candidate.languageLabel} />
              <CandidateFact label="技能" value={candidate.skillStatusLabel} />
              <CandidateFact label="経験" value={candidate.experienceLabel} />
              <CandidateFact label="選考状況" value={candidate.availabilityLabel} />
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function CandidateFact({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid grid-cols-[100px_1fr] gap-3">
      <dt className="font-medium text-neutral-500">{label}</dt>
      <dd className="font-medium leading-6 text-neutral-800">{value}</dd>
    </div>
  );
}

function SectorSidebar({
  item,
  lineHref,
  documentUrl,
  display,
}: {
  item: PublicCollectionItem;
  lineHref?: string;
  documentUrl?: string;
  display: PublicJson;
}) {
  const data = item.dataJson;
  const quickFacts = [
    { label: "在留資格", value: stringValue(data.pathway_label) },
    { label: "日本語", value: stringValue(data.language_target_label) },
    { label: "ご提案", value: stringValue(data.readiness_lead_time_label) },
  ].filter((fact) => fact.value);

  return (
    <Card variant="japan" className="p-5">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold text-neutral-900">
          {displayText(display, "sidebar_title", "採用に関するご相談")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          {displayText(
            display,
            "sidebar_description",
            "職種、人数、勤務地、必要な日本語力、希望時期をお知らせください。選考の進め方をご案内します。",
          )}
        </p>
        {quickFacts.length > 0 ? (
          <dl className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[72px_1fr] gap-3 py-3 text-sm">
                <dt className="font-medium text-neutral-500">{fact.label}</dt>
                <dd className="font-semibold leading-5 text-neutral-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {lineHref ? (
          <Button render={<a href={lineHref} />} variant="line" className="mt-6 w-full">
          <MessageCircle aria-hidden="true" className="size-4" />
          {stringValue(data.primary_cta_label) ||
            displayText(display, "detail_primary_cta_label", "LINEで相談する")}
          </Button>
        ) : null}
        {documentUrl ? (
          <div className="mt-3">
            <DocumentDownload
              label={
                stringValue(data.secondary_cta_label) ||
                displayText(display, "detail_secondary_cta_label", "資料を確認する")
              }
              fileUrl={documentUrl}
              fallbackLabel={JAPAN_DOWNLOAD_LABEL}
              variant="outline"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InlineCardSet({ title, items }: { title: string; items: PublicJson[] }) {
  const visibleItems = items.filter(
    (item) =>
      booleanValue(item.is_enabled, true) &&
      (stringValue(item.title) || stringValue(item.description)),
  );

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

function RequirementList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
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

function ContactTrustStrip({ items }: { items: PublicJson[] }) {
  const visibleItems = items.filter(
    (item) =>
      booleanValue(item.is_enabled, true) &&
      (stringValue(item.title) || stringValue(item.description)),
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-neutral-200 bg-white">
      <Container>
        <div className="grid divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {visibleItems.slice(0, 3).map((item, index) => {
            const iconKey = stringValue(item.icon_key) || "shield_check";
            const Icon = ICON_REGISTRY[iconKey as IconKey] ?? ShieldCheck;

            return (
              <div key={`${stringValue(item.title)}-${index}`} className="flex gap-4 py-6 md:px-6 first:md:pl-0 last:md:pr-0">
                <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-primary-600" />
                <div>
                  <h2 className="font-bold text-neutral-900">{stringValue(item.title)}</h2>
                  {stringValue(item.description) ? (
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      {stringValue(item.description)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ContactChannels({
  title,
  description,
  lineHref,
  lineLabel,
  lineDescription,
  email,
  emailSubject,
  emailDescription,
  formLabel,
}: {
  title: string;
  description: string;
  lineHref?: string;
  lineLabel: string;
  lineDescription: string;
  email?: string;
  emailSubject?: string;
  emailDescription: string;
  formLabel: string;
}) {
  if (!lineHref && !email) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">{description}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {lineHref ? (
            <Card variant="japan" className="h-full p-6">
              <CardContent className="flex h-full flex-col p-0">
                <MessageCircle aria-hidden="true" className="size-8 text-[var(--color-cta)]" />
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">LINE</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{lineDescription}</p>
                <Button render={<a href={lineHref} />} variant="line" className="mt-6 w-full">
                  {lineLabel}
                </Button>
              </CardContent>
            </Card>
          ) : null}
          {email ? (
            <Card variant="japan" className="h-full p-6">
              <CardContent className="flex h-full flex-col p-0">
                <Mail aria-hidden="true" className="size-8 text-primary-500" />
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">メール</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{emailDescription}</p>
                <Button
                  render={
                    <a
                      href={`mailto:${email}${
                        emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ""
                      }`}
                    />
                  }
                  variant="outline"
                  className="mt-6 w-full"
                >
                  メールを送る
                </Button>
              </CardContent>
            </Card>
          ) : null}
          <Card variant="japan" className="h-full p-6">
            <CardContent className="flex h-full flex-col p-0">
              <ShieldCheck aria-hidden="true" className="size-8 text-primary-500" />
              <h2 className="mt-4 text-2xl font-bold text-neutral-900">お問い合わせフォーム</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">
                採用条件、希望人数、採用時期などを整理してお送りいただけます。
              </p>
              <Button render={<a href="#contact-inquiry" />} className="mt-6 w-full">
                {formLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

function ContactConsultationTopics({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: PublicJson[];
}) {
  const visibleItems = items.filter(
    (item) =>
      booleanValue(item.is_enabled, true) &&
      (stringValue(item.title) || stringValue(item.description)),
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">{description}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, index) => {
            const iconKey = stringValue(item.icon_key) || "check";
            const Icon = ICON_REGISTRY[iconKey as IconKey] ?? FALLBACK_ICON;

            return (
              <div key={`${stringValue(item.title)}-${index}`} className="rounded-lg border border-neutral-200 bg-white p-5">
                <Icon aria-hidden="true" className="size-6 text-primary-600" />
                <h3 className="mt-4 text-lg font-bold text-neutral-900">{stringValue(item.title)}</h3>
                {stringValue(item.description) ? (
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {stringValue(item.description)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ContactInquirySection({
  title,
  description,
  preparationTitle,
  preparationDescription,
  preparationItems,
  email,
  emailSubject,
  submitLabel,
  consentLabel,
  responseNote,
}: {
  title: string;
  description: string;
  preparationTitle: string;
  preparationDescription: string;
  preparationItems: string[];
  email?: string;
  emailSubject: string;
  submitLabel: string;
  consentLabel: string;
  responseNote: string;
}) {
  if (!email) {
    return null;
  }

  return (
    <section id="contact-inquiry" className="scroll-mt-28 bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 md:text-lg">
              {description}
            </p>
            <div className="mt-8">
              <JapanContactInquiryForm
                email={email}
                emailSubject={emailSubject}
                submitLabel={submitLabel}
                consentLabel={consentLabel}
                responseNote={responseNote}
              />
            </div>
          </div>
          <aside className="rounded-lg bg-primary-700 p-6 text-white md:p-8">
            <h3 className="text-2xl font-bold">{preparationTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">{preparationDescription}</p>
            {preparationItems.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {preparationItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-white/90">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-red-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
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
            label: stringValue(data.label) || "Hubungi via LINE",
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
              ctaLabel: stringValue(data.cta_label) || "Lihat Detail",
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
      organizationName: stringValue(item.organization_name),
      credentials: stringValue(item.credentials),
      responsibility: stringValue(item.responsibility),
      bio: stringValue(item.bio),
      imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
      sortOrder: numberValue(item.sort_order) ?? index,
      isEnabled: booleanValue(item.is_enabled, true),
    })),
  );
}

async function resolveCandidateExamples(items: PublicJson[]) {
  return Promise.all(
    items.map(async (item, index) => {
      const name = stringValue(item.name) || stringValue(item.title);
      const targetPathText =
        stringValue(item.target_path_text) || stringValue(item.profile_label);
      const backgroundText =
        stringValue(item.background_text) || stringValue(item.description);

      return {
        initials: stringValue(item.initials) || buildCandidateInitials(name),
        name,
        ageOriginLabel: stringValue(item.age_origin_label),
        backgroundLabel: stringValue(item.background_label) || "経歴・学習状況",
        backgroundText,
        targetPathLabel: stringValue(item.target_path_label) || "希望職種・在留資格",
        targetPathText,
        languageLabel: stringValue(item.language_label) || "日本語レベル",
        languageText: stringValue(item.language_text),
        characterLabel: stringValue(item.character_label) || "面接・勤務姿勢",
        characterText: stringValue(item.character_text),
        screeningLabel: stringValue(item.screening_label) || "確認状況",
        screeningText: stringValue(item.screening_text),
        availabilityLabel: stringValue(item.availability_label) || "紹介可能時期",
        availabilityText: stringValue(item.availability_text),
        readinessLabel:
          stringValue(item.readiness_label) || "面接前確認済み",
        readinessIsEnabled: booleanValue(item.readiness_is_enabled, true),
        highlightTags: arrayOfStrings(item.highlight_tags),
        imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
        sortOrder: numberValue(item.sort_order) ?? index,
        isEnabled: booleanValue(item.is_enabled, true),
      };
    }),
  );
}

async function resolveCandidatePoolCards(items: PublicJson[]) {
  return Promise.all(
    items.map(async (item, index) => {
      const name = stringValue(item.name);

      return {
        initials: stringValue(item.initials) || buildCandidateInitials(name),
        name,
        nationalityLabel: stringValue(item.nationality_label),
        targetSectorLabel: stringValue(item.target_sector_label),
        ageLabel: stringValue(item.age_label),
        japaneseLevelLabel: stringValue(item.japanese_level_label),
        readinessLabel: stringValue(item.readiness_label),
        availabilityLabel: stringValue(item.availability_label),
        imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
        sortOrder: numberValue(item.sort_order) ?? index,
        isEnabled: booleanValue(item.is_enabled, true),
      };
    }),
  );
}

async function resolveSectorMediaItems(items: PublicJson[]) {
  const resolved = await Promise.all(
    items.map(async (item, index) => {
      const mediaSrc = await resolveMediaUrl(stringValue(item.media_id));

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
  );

  return resolved
    .filter((item): item is SectorMediaItem => Boolean(item?.isEnabled))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

async function resolveSectorCandidateSnapshots(items: PublicJson[]) {
  const resolved = await Promise.all(
    items.map(async (item, index) => {
      const name = stringValue(item.name) || `Kandidat ${index + 1}`;

      return {
        initials: stringValue(item.initials) || buildCandidateInitials(name),
        name,
        profileLabel: stringValue(item.profile_label),
        languageLabel: stringValue(item.language_label),
        skillStatusLabel: stringValue(item.skill_status_label),
        experienceLabel: stringValue(item.experience_label),
        availabilityLabel: stringValue(item.availability_label),
        imageSrc: (await resolveMediaUrl(stringValue(item.image_id))) ?? undefined,
        sortOrder: numberValue(item.sort_order) ?? index,
        isEnabled: booleanValue(item.is_enabled, true),
      };
    }),
  );

  return resolved
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function buildCandidateInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "JP";
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
    iconKey: stringValue(item.icon_key) || "check",
    value: stringValue(item.value),
    label: stringValue(item.label),
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function buildLegalOverviewDescription(item: PublicJson) {
  const details = [
    stringValue(item.issuing_authority),
    stringValue(item.issued_date_label),
    stringValue(item.status_label),
  ].filter(Boolean);
  const description = stringValue(item.description);

  return [details.join(" / "), description].filter(Boolean).join("\n");
}

function toStepItem(item: PublicJson, index: number) {
  return {
    iconKey: stringValue(item.icon_key) || "check",
    stepLabel: stringValue(item.step_label),
    title: stringValue(item.title),
    description: stringValue(item.description),
    sortOrder: numberValue(item.sort_order) ?? index,
    isEnabled: booleanValue(item.is_enabled, true),
  };
}

function newsCard(item: PublicCollectionItem, labels: { newBadgeLabel?: string } = {}) {
  const isNew = isNewItem(item.publishedAt);

  return {
    id: item.id,
    title: item.title,
    description: item.excerpt,
    href: `/news/${item.slug}`,
    imageSrc: item.thumbnailSrc,
    badge: isNew ? labels.newBadgeLabel || "Baru" : undefined,
    badgeVariant: isNew ? ("new" as const) : undefined,
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
    : undefined;
}

function getLineAccountId(globalConfig: Record<string, PublicJson>) {
  const lineContact = record(record(globalConfig.line_business_contact).line_contact);
  const isEnabled = booleanValue(lineContact.is_enabled, true);

  if (!isEnabled) {
    return "";
  }

  return stringValue(
    lineContact.line_official_account_id,
  );
}

function getDefaultLineTemplate(globalConfig: Record<string, PublicJson>) {
  return (
    stringValue(
      record(record(globalConfig.line_business_contact).line_contact)
        .default_message_template,
    ) || "Halo, saya ingin berkonsultasi tentang {lpk_name}."
  );
}

function getGlobalBusinessEmail(globalConfig: Record<string, PublicJson>) {
  const businessEmail = record(record(globalConfig.line_business_contact).business_email);

  return booleanValue(businessEmail.is_enabled, true)
    ? stringValue(businessEmail.email)
    : "";
}

function getGlobalEmailSubject(globalConfig: Record<string, PublicJson>) {
  const businessEmail = record(record(globalConfig.line_business_contact).business_email);

  return booleanValue(businessEmail.is_enabled, true)
    ? stringValue(businessEmail.default_subject_template)
    : "";
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

function getLeadershipQuote(value: unknown): LeadershipQuoteData {
  if (!isRecord(value)) {
    return DEFAULT_LEADERSHIP_QUOTE;
  }

  return {
    isEnabled: booleanValue(value.is_enabled, DEFAULT_LEADERSHIP_QUOTE.isEnabled),
    quote: stringWithFieldDefault(value, "quote", DEFAULT_LEADERSHIP_QUOTE.quote),
    attributionName: stringWithFieldDefault(
      value,
      "attribution_name",
      DEFAULT_LEADERSHIP_QUOTE.attributionName,
    ),
    attributionRole: stringWithFieldDefault(
      value,
      "attribution_role",
      DEFAULT_LEADERSHIP_QUOTE.attributionRole,
    ),
    photoImageId: stringWithFieldDefault(
      value,
      "photo_image_id",
      DEFAULT_LEADERSHIP_QUOTE.photoImageId,
    ),
  };
}

function stringWithFieldDefault(
  source: PublicJson,
  key: string,
  fallback: string,
) {
  return Object.prototype.hasOwnProperty.call(source, key)
    ? stringValue(source[key])
    : fallback;
}
