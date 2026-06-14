import type { PageKey } from "@/lib/constants";
import type { MediaCropPreset } from "@/lib/media-crop";
import type { VariantKey } from "@/types";

export type PageEditorData = Record<string, unknown>;
export type PageSectionClassification = "required" | "recommended" | "optional";

export type PageEditorFieldOption = {
  value: string;
  label: string;
};

export type PageEditorFieldVisibility = {
  path: string;
  equals?: string | number | boolean | null;
  notEquals?: string | number | boolean | null;
};

type PageEditorFieldGuidance = {
  helpText?: string;
  usage?: string;
  example?: string;
  requiredForPublish?: boolean;
};

type BaseField = {
  path: string;
  label: string;
  placeholder?: string;
  visibleWhen?: PageEditorFieldVisibility | PageEditorFieldVisibility[];
} & PageEditorFieldGuidance;

export type PageEditorField =
  | (BaseField & {
      kind: "text";
      inputType?: "text" | "email" | "url" | "tel";
    })
  | (BaseField & {
      kind: "textarea";
    })
  | (BaseField & {
      kind: "switch";
    })
  | (BaseField & {
      kind: "number";
      min?: number;
      max?: number;
    })
  | (BaseField & {
      kind: "select";
      options: PageEditorFieldOption[];
    })
  | (BaseField & {
      kind: "media";
      cropPreset?: MediaCropPreset;
    })
  | (BaseField & {
      kind: "document" | "icon";
    })
  | (BaseField & {
      kind: "string-array";
      addLabel?: string;
      itemLabel?: string;
      defaultItem?: string;
    })
  | (BaseField & {
      kind: "media-array";
      addLabel?: string;
      itemLabel?: string;
      defaultItem?: string;
      cropPreset?: MediaCropPreset;
    })
  | (BaseField & {
      kind: "array";
      addLabel?: string;
      itemLabel?: string;
      defaultItem: PageEditorData;
      sortOrderField?: string;
      fields: PageEditorField[];
    });

export type PageEditorSection = {
  key: string;
  title: string;
  classification: PageSectionClassification;
  fields: PageEditorField[];
};

export type PageEditorDefinitionKey =
  | "indonesia.homepage"
  | "indonesia.program_page"
  | "indonesia.job_page"
  | "indonesia.blog_page"
  | "indonesia.tentang_kami"
  | "indonesia.karir_page"
  | "japan.homepage"
  | "japan.tentang_kami"
  | "japan.metode_pelatihan"
  | "japan.profil_kandidat"
  | "japan.jaringan_rekrutmen"
  | "japan.sector_page"
  | "japan.news_page"
  | "japan.contact";

export type PageEditorDefinition = {
  variantKey: VariantKey;
  pageKey: PageKey;
  title: string;
  publicPath: string;
  defaultData: PageEditorData;
  sections: PageEditorSection[];
};

const mediaTypeOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const mediaPositionOptions = [
  { value: "center", label: "Tengah" },
  { value: "top", label: "Atas / wajah" },
  { value: "bottom", label: "Bawah" },
  { value: "left", label: "Kiri" },
  { value: "right", label: "Kanan" },
  { value: "top-left", label: "Kiri atas" },
  { value: "top-right", label: "Kanan atas" },
];

const homepageOfferSourceOptions = [
  { value: "active_featured_offer", label: "Active featured offer" },
  { value: "manual", label: "Manual" },
];

const activeFeaturedOfferVisibility = {
  path: "offer_section.source",
  equals: "active_featured_offer",
} satisfies PageEditorFieldVisibility;

const manualOfferVisibility = {
  path: "offer_section.source",
  equals: "manual",
} satisfies PageEditorFieldVisibility;

const homepageActiveOfferBenefitDefaults = [
  "Trial belajar langsung",
  "Cocok untuk pemula",
  "Konsultasi jalur Jepang",
];

const homepageActiveFeaturedOfferDefaults = {
  active_badge_label: "GRATIS, TANPA BIAYA PENDAFTARAN",
  active_headline_override: "",
  active_description_override: "",
  active_campaign_image_id: "",
  active_cta_label: "Daftar Kelas Gratis",
  active_cta_href: "",
  active_urgency_label: "",
  active_microcopy: "Gratis, tanpa biaya pendaftaran",
  active_benefit_items: homepageActiveOfferBenefitDefaults,
};

const offerSourceOptions = [
  ...homepageOfferSourceOptions,
  { value: "disabled", label: "Disabled" },
];

const featuredProgramsSourceOptions = [
  { value: "featured", label: "Featured" },
  { value: "manual", label: "Manual" },
];

const latestJobSourceOptions = [
  { value: "latest_active", label: "Latest active" },
];

const latestBlogSourceOptions = [
  { value: "latest_published", label: "Latest published" },
];

const mediaHeroFields: PageEditorField[] = [
  {
    kind: "select",
    path: "media_type",
    label: "Media type",
    options: mediaTypeOptions,
  },
  { kind: "media", path: "media_id", label: "Media", cropPreset: "hero" },
  {
    kind: "select",
    path: "media_position",
    label: "Posisi media desktop",
    options: mediaPositionOptions,
  },
  {
    kind: "select",
    path: "mobile_media_type",
    label: "Jenis media mobile",
    options: mediaTypeOptions,
  },
  { kind: "media", path: "mobile_media_id", label: "Media mobile", cropPreset: "portrait" },
  {
    kind: "select",
    path: "mobile_media_position",
    label: "Posisi media mobile",
    options: mediaPositionOptions,
  },
  { kind: "text", path: "eyebrow_label", label: "Eyebrow label" },
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "subheadline", label: "Subheadline" },
  { kind: "text", path: "primary_cta_label", label: "Primary CTA label" },
  {
    kind: "textarea",
    path: "primary_cta_whatsapp_message",
    label: "Primary CTA WhatsApp message",
  },
  { kind: "text", path: "secondary_cta_label", label: "Secondary CTA label" },
  {
    kind: "text",
    path: "secondary_cta_href",
    label: "Secondary CTA href",
    inputType: "url",
  },
];

const basicHeroFields: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "subheadline", label: "Subheadline" },
  { kind: "media", path: "image_id", label: "Image", cropPreset: "hero" },
  {
    kind: "select",
    path: "media_position",
    label: "Posisi image desktop",
    options: mediaPositionOptions,
  },
  { kind: "media", path: "mobile_media_id", label: "Image mobile", cropPreset: "portrait" },
  {
    kind: "select",
    path: "mobile_media_position",
    label: "Posisi image mobile",
    options: mediaPositionOptions,
  },
  { kind: "text", path: "primary_cta_label", label: "Primary CTA label" },
  {
    kind: "textarea",
    path: "primary_cta_whatsapp_message",
    label: "Primary CTA WhatsApp message",
  },
];

const sortableFields: PageEditorField[] = [
  { kind: "switch", path: "is_enabled", label: "Enabled" },
  { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
];

const statFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Icon" },
  { kind: "text", path: "value", label: "Value" },
  { kind: "text", path: "label", label: "Label" },
  ...sortableFields,
];

const faqFields: PageEditorField[] = [
  { kind: "text", path: "question", label: "Question" },
  { kind: "textarea", path: "answer", label: "Answer" },
  ...sortableFields,
];

const finalCtaFields: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "description", label: "Description" },
  { kind: "text", path: "cta_label", label: "CTA label" },
  {
    kind: "textarea",
    path: "whatsapp_message_template",
    label: "WhatsApp message template",
  },
];

const contactSectionFields: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "description", label: "Description" },
  { kind: "switch", path: "use_global_contact", label: "Use global contact" },
];

const statDefault = (sortOrder: number) => ({
  icon_key: "",
  value: "",
  label: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const faqDefault = (sortOrder: number) => ({
  question: "",
  answer: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const trustCardDefault = (sortOrder: number) => ({
  icon_key: "",
  headline: "",
  description: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const stepDefault = (sortOrder: number) => ({
  icon_key: "",
  title: "",
  description: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const homepageWorkFieldDefault = (sortOrder: number) => ({
  icon_key: "",
  title: "",
  description: "",
  image_id: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const homepageAudiencePathDefault = (sortOrder: number) => ({
  icon_key: "",
  title: "",
  description: "",
  cta_label: "",
  href: "",
  sort_order: sortOrder,
  is_enabled: true,
});

const homepageDisplayTextDefault = {
  trust_title: "",
  trust_description: "",
  audience_paths_title: "",
  audience_paths_description: "",
  programs_title: "",
  programs_description: "",
  programs_cta_label: "",
  work_fields_title: "",
  work_fields_description: "",
  jobs_title: "",
  jobs_description: "",
  jobs_cta_label: "",
  steps_title: "",
  steps_description: "",
  applicant_steps_title: "",
  applicant_steps_description: "",
  testimonials_title: "",
  faq_title: "",
  faq_description: "",
  blogs_title: "",
  blogs_description: "",
  blogs_cta_label: "",
};

const emptyBasicHero = {
  headline: "",
  subheadline: "",
  image_id: "",
  mobile_media_id: "",
  media_position: "center",
  mobile_media_position: "center",
  primary_cta_label: "",
  primary_cta_whatsapp_message: "",
};

const emptyMediaHero = {
  media_type: "image",
  media_id: "",
  mobile_media_type: "image",
  mobile_media_id: "",
  media_position: "center",
  mobile_media_position: "center",
  eyebrow_label: "",
  headline: "",
  subheadline: "",
  primary_cta_label: "",
  primary_cta_whatsapp_message: "",
  secondary_cta_label: "",
  secondary_cta_href: "",
};

const emptyFinalCta = {
  headline: "",
  description: "",
  cta_label: "",
  whatsapp_message_template: "",
};

// ── Japan shared field templates ──

const japanMediaTypeOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "slider", label: "Slider" },
];

const japanBasicMediaTypeOptions = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

const japanHeroFields: PageEditorField[] = [
  {
    kind: "select",
    path: "media_type",
    label: "Jenis media",
    options: japanMediaTypeOptions,
  },
  { kind: "media", path: "media_id", label: "Media", cropPreset: "hero" },
  {
    kind: "media-array",
    path: "slider_media_ids",
    label: "Media slider",
    addLabel: "Tambah slide",
    itemLabel: "Slide",
    defaultItem: "",
    cropPreset: "hero",
  },
  {
    kind: "select",
    path: "media_position",
    label: "Posisi media desktop",
    options: mediaPositionOptions,
  },
  {
    kind: "select",
    path: "mobile_media_type",
    label: "Jenis media mobile",
    options: japanBasicMediaTypeOptions,
  },
  { kind: "media", path: "mobile_media_id", label: "Media mobile", cropPreset: "portrait" },
  {
    kind: "select",
    path: "mobile_media_position",
    label: "Posisi media mobile",
    options: mediaPositionOptions,
  },
  { kind: "text", path: "headline", label: "Judul utama" },
  { kind: "textarea", path: "subheadline", label: "Subjudul" },
  { kind: "text", path: "eyebrow_label", label: "Label kecil" },
  { kind: "text", path: "primary_cta_label", label: "Label CTA utama" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Template pesan LINE utama",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Label CTA kedua",
  },
  {
    kind: "text",
    path: "secondary_href",
    label: "Link CTA kedua",
    inputType: "url",
  },
];

const japanBasicHeroFields: PageEditorField[] = [
  {
    kind: "select",
    path: "media_type",
    label: "Jenis media",
    options: japanBasicMediaTypeOptions,
  },
  { kind: "media", path: "media_id", label: "Media", cropPreset: "hero" },
  {
    kind: "select",
    path: "media_position",
    label: "Posisi media desktop",
    options: mediaPositionOptions,
  },
  {
    kind: "select",
    path: "mobile_media_type",
    label: "Jenis media mobile",
    options: japanBasicMediaTypeOptions,
  },
  { kind: "media", path: "mobile_media_id", label: "Media mobile", cropPreset: "portrait" },
  {
    kind: "select",
    path: "mobile_media_position",
    label: "Posisi media mobile",
    options: mediaPositionOptions,
  },
  { kind: "text", path: "headline", label: "Judul utama" },
  { kind: "textarea", path: "subheadline", label: "Subjudul" },
  { kind: "text", path: "eyebrow_label", label: "Label kecil" },
  { kind: "text", path: "primary_cta_label", label: "Label CTA utama" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Template pesan LINE utama",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Label CTA kedua",
  },
  {
    kind: "text",
    path: "secondary_href",
    label: "Link CTA kedua",
    inputType: "url",
  },
];

const japanCandidateHeroModelOptions = [
  { value: "standard", label: "Hero standar" },
  { value: "candidate_pool", label: "Candidate pool" },
];

const japanReadinessStatusOptions = [
  { value: "completed", label: "Selesai" },
  { value: "in_progress", label: "Berjalan" },
  { value: "planned", label: "Direncanakan" },
];

const japanRecruitmentHeroModelOptions = [
  { value: "standard", label: "Hero standar" },
  { value: "network_map", label: "Network map" },
];

const japanFinalCtaFields: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Judul CTA" },
  { kind: "textarea", path: "description", label: "Deskripsi CTA" },
  { kind: "text", path: "primary_cta_label", label: "Label CTA utama" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Template pesan LINE utama",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Label CTA kedua",
  },
  {
    kind: "text",
    path: "secondary_href",
    label: "Link CTA kedua",
    inputType: "url",
  },
];

const japanFinalCtaFieldsWithDoc: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Judul CTA" },
  { kind: "textarea", path: "description", label: "Deskripsi CTA" },
  { kind: "text", path: "primary_cta_label", label: "Label CTA utama" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Template pesan LINE utama",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Label CTA kedua",
  },
  {
    kind: "text",
    path: "secondary_document_url",
    label: "URL dokumen kedua",
    inputType: "url",
  },
];

const japanSortableFields: PageEditorField[] = [
  { kind: "switch", path: "is_enabled", label: "Aktif" },
  { kind: "number", path: "sort_order", label: "Urutan", min: 0 },
];

const japanIconTitleDescSortFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Icon" },
  { kind: "text", path: "title", label: "Judul" },
  { kind: "textarea", path: "description", label: "Deskripsi" },
  ...japanSortableFields,
];

const japanProofStatFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Ikon" },
  { kind: "text", path: "value", label: "Nilai" },
  { kind: "text", path: "label", label: "Label" },
  ...japanSortableFields,
];

const japanStatFields: PageEditorField[] = japanProofStatFields;

const japanTimelineFields: PageEditorField[] = [
  { kind: "text", path: "year_label", label: "Label tahun" },
  { kind: "text", path: "title", label: "Judul" },
  { kind: "textarea", path: "description", label: "Deskripsi" },
  ...japanSortableFields,
];

const japanEmptyHero = {
  media_type: "image",
  media_id: "",
  mobile_media_type: "image",
  mobile_media_id: "",
  media_position: "center",
  mobile_media_position: "center",
  headline: "",
  subheadline: "",
  eyebrow_label: "",
  primary_cta_label: "",
  primary_line_message_template: "",
  secondary_cta_label: "",
  secondary_href: "",
};

const japanEmptyCandidatePoolHero = {
  eyebrow_label: "",
  headline: "",
  subheadline: "",
  primary_cta_label: "",
  primary_line_message_template: "",
  secondary_cta_label: "",
  secondary_href: "",
  trust_note: "",
  stats: [],
  candidate_cards: [],
};

const japanEmptyNetworkMapHero = {
  panel_title: "",
  panel_badge_label: "",
  trust_note: "",
};

const japanEmptyHomepageHero = {
  ...japanEmptyHero,
  slider_media_ids: [],
};

const japanEmptyFinalCta = {
  headline: "",
  description: "",
  primary_cta_label: "",
  primary_line_message_template: "",
  secondary_cta_label: "",
  secondary_href: "",
};

const japanEmptyFinalCtaWithDoc = {
  headline: "",
  description: "",
  primary_cta_label: "",
  primary_line_message_template: "",
  secondary_cta_label: "",
  secondary_document_url: "",
};

const japanDefaultLeadershipQuote = {
  is_enabled: true,
  quote:
    "「私たちは単なる労働力の送り出し機関ではありません。候補者が日本で成功するまで、責任を持って関わり続ける長期的なパートナーです。」",
  attribution_name: "Aris Supriyadi",
  attribution_role: "代表取締役",
  photo_image_id: "",
};

const japanEmptyIconTitleDesc = {
  icon_key: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyProofStat = {
  icon_key: "",
  value: "",
  label: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyStat = { ...japanEmptyProofStat };

const japanEmptyTimeline = {
  year_label: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyStep = {
  icon_key: "",
  step_label: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanStepFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Icon" },
  { kind: "text", path: "step_label", label: "Step label" },
  { kind: "text", path: "title", label: "Title" },
  { kind: "textarea", path: "description", label: "Description" },
  ...japanSortableFields,
];

const japanEmptyRegion = {
  region_name: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyNetworkNode = {
  region_label: "",
  title: "",
  description: "",
  image_id: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyGalleryItem = {
  media_id: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyReadinessCriterion = {
  competency_label: "",
  assessment_method: "",
  pass_standard: "",
  evidence_label: "",
  failure_action: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptySectorModule = {
  icon_key: "",
  sector_label: "",
  title: "",
  description: "",
  focus_items: [],
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyQualityGate = {
  stage_label: "",
  title: "",
  assessment_method: "",
  pass_standard: "",
  evidence_label: "",
  failure_action: "",
  sort_order: 0,
  is_enabled: true,
};

const japanHomepageDisplayText = {
  achievements_title: "",
  why_us_title: "",
  latest_news_title: "",
  latest_news_cta_label: "",
  legalities_title: "",
  new_badge_label: "",
};

const japanAboutDisplayText = {
  timeline_title: "",
  values_title: "",
  facilities_title: "",
  team_title: "",
  legal_overview_title: "",
};

const japanTrainingDisplayText = {
  training_pillars_title: "",
  training_flow_title: "",
  curriculum_areas_title: "",
  evaluation_items_title: "",
  training_gallery_title: "",
};

const japanCandidateDisplayText = {
  candidate_strengths_title: "候補者の特徴",
  supported_pathways_title: "対応可能な在留資格・採用ルート",
  candidate_examples_title: "候補者プロフィール例",
  selection_assurance_title: "選考前の確認体制",
  selection_assurance_description:
    "候補者の希望条件、職種理解、日本語学習状況を事前に確認し、企業様の採用基準に沿ってご提案します。",
  handoff_process_title: "ご相談から候補者提案まで",
  handoff_process_description:
    "採用条件の確認から候補者紹介、面接調整まで、実務に合わせて段階的に進めます。",
  faq_title: "候補者紹介に関するよくあるご質問",
  faq_description:
    "採用条件に合わせた候補者確認を進める前に、よくいただくご質問をまとめました。",
  readiness_framework_title: "受け入れ前の準備項目",
};

const japanRecruitmentDisplayText = {
  coverage_regions_title: "",
  recruitment_sources_title: "",
  screening_flow_title: "",
  network_nodes_title: "",
  quality_control_title: "",
  faq_title: "",
  faq_description: "",
};

const japanSectorPageDisplayText = {
  card_cta_label: "",
  featured_badge_label: "",
  breadcrumb_home_label: "",
  breadcrumb_sector_label: "",
  suitability_title: "",
  example_positions_title: "",
  training_alignment_title: "",
  requirements_title: "",
  process_title: "",
  faq_title: "",
  sidebar_title: "",
  sidebar_description: "",
  detail_primary_cta_label: "",
  detail_secondary_cta_label: "",
};

const japanNewsPageDisplayText = {
  card_cta_label: "",
  featured_badge_label: "",
  new_badge_label: "",
  breadcrumb_home_label: "",
  breadcrumb_news_label: "",
  related_news_title: "",
};

const japanContactDisplayText = {
  line_cta_label: "",
  contact_channels_title: "",
  contact_channels_description: "",
  consultation_topics_title: "",
  consultation_topics_description: "",
  inquiry_form_title: "",
  inquiry_form_description: "",
  preparation_title: "",
  preparation_description: "",
  business_info_title: "",
  business_info_cta_label: "",
  inquiry_flow_title: "",
  faq_title: "",
};

function japanDisplayTextSection(fields: PageEditorField[]): PageEditorSection {
  return {
    key: "display_text",
    title: "Teks tampilan",
    classification: "recommended",
    fields: fields.map((field) => ({
      ...field,
      path: `display_text.${field.path}`,
    })),
  };
}

const japanHomepageDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "achievements_title", label: "Judul section pencapaian" },
  { kind: "text", path: "why_us_title", label: "Judul section alasan memilih kami" },
  { kind: "text", path: "latest_news_title", label: "Judul section berita terbaru" },
  { kind: "text", path: "latest_news_cta_label", label: "Label tombol semua berita" },
  { kind: "text", path: "legalities_title", label: "Judul section legalitas" },
  { kind: "text", path: "new_badge_label", label: "Label badge baru" },
];

const japanAboutDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "timeline_title", label: "Judul section linimasa" },
  { kind: "text", path: "values_title", label: "Judul section nilai" },
  { kind: "text", path: "facilities_title", label: "Judul section fasilitas" },
  { kind: "text", path: "team_title", label: "Judul section tim" },
  { kind: "text", path: "legal_overview_title", label: "Judul section ringkasan legalitas" },
];

const japanTrainingDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "training_pillars_title", label: "Judul section pilar pelatihan" },
  { kind: "text", path: "training_flow_title", label: "Judul section alur pelatihan" },
  { kind: "text", path: "curriculum_areas_title", label: "Judul section area kurikulum" },
  { kind: "text", path: "evaluation_items_title", label: "Judul section evaluasi" },
  { kind: "text", path: "training_gallery_title", label: "Judul section galeri pelatihan" },
];

const japanCandidateDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "candidate_strengths_title", label: "Judul section keunggulan kandidat" },
  { kind: "text", path: "supported_pathways_title", label: "Judul section izin tinggal" },
  { kind: "text", path: "candidate_examples_title", label: "Judul section contoh kandidat" },
  { kind: "text", path: "selection_assurance_title", label: "Judul section konfirmasi seleksi" },
  {
    kind: "textarea",
    path: "selection_assurance_description",
    label: "Deskripsi section konfirmasi seleksi",
  },
  { kind: "text", path: "handoff_process_title", label: "Judul section alur pengajuan" },
  {
    kind: "textarea",
    path: "handoff_process_description",
    label: "Deskripsi section alur pengajuan",
  },
  { kind: "text", path: "faq_title", label: "Judul FAQ" },
  { kind: "textarea", path: "faq_description", label: "Deskripsi FAQ" },
  { kind: "text", path: "readiness_framework_title", label: "Judul section persiapan kerja" },
];

const japanRecruitmentDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "coverage_regions_title", label: "Judul section area cakupan" },
  { kind: "text", path: "recruitment_sources_title", label: "Judul section kanal rekrutmen" },
  { kind: "text", path: "screening_flow_title", label: "Judul section alur seleksi" },
  { kind: "text", path: "network_nodes_title", label: "Judul section titik jaringan" },
  { kind: "text", path: "quality_control_title", label: "Judul section kontrol kualitas" },
  { kind: "text", path: "faq_title", label: "Judul FAQ" },
  { kind: "textarea", path: "faq_description", label: "Deskripsi FAQ" },
];

const japanSectorPageDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "card_cta_label", label: "Label tombol kartu sektor" },
  { kind: "text", path: "featured_badge_label", label: "Label badge unggulan" },
  { kind: "text", path: "breadcrumb_home_label", label: "Label breadcrumb beranda" },
  { kind: "text", path: "breadcrumb_sector_label", label: "Label breadcrumb sektor" },
  { kind: "text", path: "suitability_title", label: "Judul section kesesuaian" },
  { kind: "text", path: "example_positions_title", label: "Judul section contoh posisi" },
  { kind: "text", path: "training_alignment_title", label: "Judul section keterkaitan pelatihan" },
  { kind: "text", path: "requirements_title", label: "Judul section syarat kandidat" },
  { kind: "text", path: "process_title", label: "Judul section proses" },
  { kind: "text", path: "faq_title", label: "Judul section pertanyaan umum" },
  { kind: "text", path: "sidebar_title", label: "Judul sidebar detail" },
  { kind: "textarea", path: "sidebar_description", label: "Deskripsi sidebar detail" },
  { kind: "text", path: "detail_primary_cta_label", label: "Fallback tombol utama detail" },
  { kind: "text", path: "detail_secondary_cta_label", label: "Fallback tombol kedua detail" },
];

const japanNewsPageDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "card_cta_label", label: "Label tombol kartu berita" },
  { kind: "text", path: "featured_badge_label", label: "Label badge unggulan" },
  { kind: "text", path: "new_badge_label", label: "Label badge baru" },
  { kind: "text", path: "breadcrumb_home_label", label: "Label breadcrumb beranda" },
  { kind: "text", path: "breadcrumb_news_label", label: "Label breadcrumb berita" },
  { kind: "text", path: "related_news_title", label: "Judul section berita terkait" },
];

const japanContactDisplayTextFields: PageEditorField[] = [
  { kind: "text", path: "line_cta_label", label: "Fallback label tombol LINE" },
  { kind: "text", path: "contact_channels_title", label: "Judul section channel kontak" },
  { kind: "textarea", path: "contact_channels_description", label: "Deskripsi channel kontak" },
  { kind: "text", path: "consultation_topics_title", label: "Judul topik konsultasi" },
  { kind: "textarea", path: "consultation_topics_description", label: "Deskripsi topik konsultasi" },
  { kind: "text", path: "inquiry_form_title", label: "Judul formulir inquiry" },
  { kind: "textarea", path: "inquiry_form_description", label: "Deskripsi formulir inquiry" },
  { kind: "text", path: "preparation_title", label: "Judul informasi yang perlu disiapkan" },
  { kind: "textarea", path: "preparation_description", label: "Deskripsi informasi yang perlu disiapkan" },
  { kind: "text", path: "business_info_title", label: "Judul section informasi bisnis" },
  { kind: "text", path: "business_info_cta_label", label: "Label tombol informasi bisnis" },
  { kind: "text", path: "inquiry_flow_title", label: "Judul section alur kontak" },
  { kind: "text", path: "faq_title", label: "Judul FAQ" },
];


export const PAGE_EDITOR_DEFINITIONS = {
  "indonesia.homepage": {
    variantKey: "indonesia",
    pageKey: "homepage",
    title: "Beranda",
    publicPath: "/",
    defaultData: {
      hero: emptyMediaHero,
      display_text: homepageDisplayTextDefault,
      offer_section: {
        is_enabled: false,
        source: "active_featured_offer",
        manual_offer_id: "",
        fallback_badge_label: "",
        fallback_headline: "",
        fallback_description: "",
        fallback_image_id: "",
        fallback_cta_label: "",
        fallback_cta_href: "",
        ...homepageActiveFeaturedOfferDefaults,
      },
      stats: [statDefault(0), statDefault(1), statDefault(2)],
      trust_cards: [
        trustCardDefault(0),
        trustCardDefault(1),
        trustCardDefault(2),
      ],
      audience_paths: [
        homepageAudiencePathDefault(0),
        homepageAudiencePathDefault(1),
      ],
      foundation_section: {
        is_enabled: true,
        eyebrow_label: "",
        headline: "",
        description: "",
        bullet_items: [],
        cta_label: "",
        cta_href: "",
      },
      featured_programs: {
        source: "featured",
        manual_program_ids: [],
        max_items: 3,
      },
      latest_jobs: {
        is_enabled: true,
        source: "latest_active",
        max_items: 5,
      },
      work_fields: [],
      steps: [stepDefault(0), stepDefault(1), stepDefault(2), stepDefault(3)],
      applicant_steps: [stepDefault(0), stepDefault(1), stepDefault(2), stepDefault(3)],
      faqs: [faqDefault(0), faqDefault(1), faqDefault(2)],
      testimonials: [],
      latest_blogs: {
        is_enabled: true,
        source: "latest_published",
        max_items: 5,
      },
      contact_section: {
        headline: "",
        description: "",
        use_global_contact: true,
      },
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: mediaHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      {
        key: "display_text",
        title: "Teks Tampilan",
        classification: "recommended",
        fields: [
          { kind: "text", path: "trust_title", label: "Judul alasan memilih HIT" },
          { kind: "textarea", path: "trust_description", label: "Deskripsi alasan memilih HIT" },
          { kind: "text", path: "audience_paths_title", label: "Judul pilihan kebutuhan" },
          { kind: "textarea", path: "audience_paths_description", label: "Deskripsi pilihan kebutuhan" },
          { kind: "text", path: "programs_title", label: "Judul program" },
          { kind: "textarea", path: "programs_description", label: "Deskripsi program" },
          { kind: "text", path: "programs_cta_label", label: "Label tombol semua program" },
          { kind: "text", path: "work_fields_title", label: "Judul bidang kerja" },
          { kind: "textarea", path: "work_fields_description", label: "Deskripsi bidang kerja" },
          { kind: "text", path: "jobs_title", label: "Judul lowongan" },
          { kind: "textarea", path: "jobs_description", label: "Deskripsi lowongan" },
          { kind: "text", path: "jobs_cta_label", label: "Label tombol semua lowongan" },
          { kind: "text", path: "steps_title", label: "Judul alur" },
          { kind: "textarea", path: "steps_description", label: "Deskripsi alur" },
          { kind: "text", path: "applicant_steps_title", label: "Judul alur pelamar kerja" },
          { kind: "textarea", path: "applicant_steps_description", label: "Deskripsi alur pelamar kerja" },
          { kind: "text", path: "testimonials_title", label: "Judul testimoni" },
          { kind: "text", path: "faq_title", label: "Judul FAQ" },
          { kind: "textarea", path: "faq_description", label: "Deskripsi FAQ" },
          { kind: "text", path: "blogs_title", label: "Judul artikel" },
          { kind: "textarea", path: "blogs_description", label: "Deskripsi artikel" },
          { kind: "text", path: "blogs_cta_label", label: "Label tombol semua artikel" },
        ].map((field) => ({ ...field, path: `display_text.${field.path}` })) as PageEditorField[],
      },
      {
        key: "audience_paths",
        title: "Pilihan Kebutuhan Pengguna",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "audience_paths",
            label: "Pilihan kebutuhan",
            itemLabel: "Jalur pengguna",
            addLabel: "Tambah jalur",
            defaultItem: homepageAudiencePathDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "cta_label", label: "Label CTA" },
              { kind: "text", path: "href", label: "Link CTA", inputType: "url" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "offer_section",
        title: "Offer Section",
        classification: "optional",
        fields: [
          {
            kind: "switch",
            path: "offer_section.is_enabled",
            label: "Enabled",
          },
          {
            kind: "select",
            path: "offer_section.source",
            label: "Source",
            options: homepageOfferSourceOptions,
            helpText:
              "Pilih Active featured offer untuk menarik offer aktif dari collection, atau Manual untuk memilih offer/fallback sendiri.",
          },
          {
            kind: "text",
            path: "offer_section.manual_offer_id",
            label: "Manual offer ID",
            visibleWhen: manualOfferVisibility,
            helpText:
              "Isi ID offer jika ingin mengunci homepage ke satu offer tertentu. Jika kosong, field fallback di bawah akan dipakai.",
            usage: "Dipakai hanya ketika Source diset ke Manual.",
          },
          {
            kind: "text",
            path: "offer_section.fallback_badge_label",
            label: "Fallback badge label",
            visibleWhen: manualOfferVisibility,
            helpText:
              "Badge cadangan ketika manual offer tidak dipilih atau datanya tidak tersedia.",
          },
          {
            kind: "text",
            path: "offer_section.fallback_headline",
            label: "Fallback headline",
            visibleWhen: manualOfferVisibility,
            helpText:
              "Judul cadangan untuk mode Manual. Section tetap bisa tampil walau belum ada collection offer.",
          },
          {
            kind: "textarea",
            path: "offer_section.fallback_description",
            label: "Fallback description",
            visibleWhen: manualOfferVisibility,
            helpText: "Deskripsi singkat cadangan untuk mode Manual.",
          },
          {
            kind: "media",
            path: "offer_section.fallback_image_id",
            label: "Fallback image",
            visibleWhen: manualOfferVisibility,
            cropPreset: "offer",
            helpText:
              "Gambar cadangan mode Manual. Gunakan rasio 16:10, ideal 1600x1000 px, dan pastikan wajah/objek utama berada di tengah.",
          },
          {
            kind: "text",
            path: "offer_section.fallback_cta_label",
            label: "Fallback CTA label",
            visibleWhen: manualOfferVisibility,
            helpText: "Label tombol cadangan untuk mode Manual.",
            example: "Daftar Sekarang",
          },
          {
            kind: "text",
            path: "offer_section.fallback_cta_href",
            label: "Fallback CTA href",
            inputType: "url",
            visibleWhen: manualOfferVisibility,
            helpText: "Link tombol cadangan untuk mode Manual.",
            example: "/offer/kelas-gratis",
          },
          {
            kind: "media",
            path: "offer_section.active_campaign_image_id",
            label: "Thumbnail campaign offer",
            cropPreset: "offer",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Gambar ini khusus Offer Section homepage. Jika kosong, banner memakai gambar dari active featured offer agar tampilan tidak blank.",
            usage:
              "Dipakai hanya ketika Source diset ke Active featured offer sebagai override thumbnail campaign. Rasio crop 16:10, ideal 1600x1000 px, minimal disarankan 1200x750 px.",
            example:
              "Pilih foto dengan subjek utama di area tengah agar tidak terpotong di mobile dan desktop.",
          },
          {
            kind: "text",
            path: "offer_section.active_badge_label",
            label: "Badge campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Label kecil untuk menarik perhatian sebelum user membaca judul offer aktif.",
            example: "GRATIS, TANPA BIAYA PENDAFTARAN",
          },
          {
            kind: "text",
            path: "offer_section.active_headline_override",
            label: "Override headline campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Opsional. Isi hanya jika judul collection offer terlalu panjang atau kurang kuat untuk homepage.",
            usage: "Jika kosong, headline tetap memakai judul dari active featured offer.",
          },
          {
            kind: "textarea",
            path: "offer_section.active_description_override",
            label: "Override deskripsi campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Opsional. Isi jika deskripsi collection terlalu umum untuk kebutuhan marketing homepage.",
            usage: "Jika kosong, deskripsi tetap memakai excerpt dari active featured offer.",
          },
          {
            kind: "text",
            path: "offer_section.active_cta_label",
            label: "CTA campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText: "Label tombol utama untuk offer aktif.",
            example: "Daftar Kelas Gratis",
          },
          {
            kind: "text",
            path: "offer_section.active_cta_href",
            label: "CTA campaign href",
            inputType: "url",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Opsional. Jika kosong, tombol otomatis menuju detail active featured offer.",
            example: "/offer/kelas-gratis",
          },
          {
            kind: "text",
            path: "offer_section.active_urgency_label",
            label: "Urgency label campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Opsional untuk membuat konteks waktu/kuota lebih jelas tanpa memenuhi headline.",
            example: "Kuota terbatas bulan ini",
          },
          {
            kind: "string-array",
            path: "offer_section.active_benefit_items",
            label: "Benefit campaign",
            itemLabel: "Benefit",
            addLabel: "Tambah benefit",
            defaultItem: "Benefit baru",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Tulis 2-3 alasan singkat yang menjawab keraguan user sebelum klik CTA.",
            usage: "Muncul sebagai chips benefit di dalam Offer Section homepage.",
          },
          {
            kind: "text",
            path: "offer_section.active_microcopy",
            label: "Microcopy CTA campaign",
            visibleWhen: activeFeaturedOfferVisibility,
            helpText:
              "Teks kecil di samping tombol untuk menurunkan rasa ragu user.",
            example: "Gratis, tanpa biaya pendaftaran",
          },
        ],
      },
      {
        key: "stats",
        title: "Statistik",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Statistik",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: statDefault(0),
            sortOrderField: "sort_order",
            fields: statFields,
          },
        ],
      },
      {
        key: "trust_cards",
        title: "Trust Cards",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "trust_cards",
            label: "Trust cards",
            itemLabel: "Trust card",
            addLabel: "Add card",
            defaultItem: trustCardDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "headline", label: "Headline" },
              { kind: "textarea", path: "description", label: "Description" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "foundation_section",
        title: "Fondasi HIT",
        classification: "recommended",
        fields: [
          { kind: "switch", path: "foundation_section.is_enabled", label: "Tampilkan section" },
          { kind: "text", path: "foundation_section.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "foundation_section.headline", label: "Judul" },
          { kind: "textarea", path: "foundation_section.description", label: "Deskripsi" },
          {
            kind: "string-array",
            path: "foundation_section.bullet_items",
            label: "Poin pendukung",
            itemLabel: "Poin",
            addLabel: "Tambah poin",
            defaultItem: "",
          },
          { kind: "text", path: "foundation_section.cta_label", label: "Label tombol" },
          {
            kind: "text",
            path: "foundation_section.cta_href",
            label: "Link tombol",
            inputType: "url",
          },
        ],
      },
      {
        key: "featured_programs",
        title: "Featured Programs",
        classification: "required",
        fields: [
          {
            kind: "select",
            path: "featured_programs.source",
            label: "Source",
            options: featuredProgramsSourceOptions,
          },
          {
            kind: "string-array",
            path: "featured_programs.manual_program_ids",
            label: "Manual program IDs",
            itemLabel: "Program ID",
            addLabel: "Add program ID",
          },
          {
            kind: "number",
            path: "featured_programs.max_items",
            label: "Max items",
            min: 1,
            max: 3,
          },
        ],
      },
      {
        key: "latest_jobs",
        title: "Latest Jobs",
        classification: "recommended",
        fields: [
          {
            kind: "switch",
            path: "latest_jobs.is_enabled",
            label: "Tampilkan lowongan",
          },
          {
            kind: "select",
            path: "latest_jobs.source",
            label: "Source",
            options: latestJobSourceOptions,
          },
          {
            kind: "number",
            path: "latest_jobs.max_items",
            label: "Max items",
            min: 1,
            max: 20,
          },
        ],
      },
      {
        key: "work_fields",
        title: "Bidang Kerja",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "work_fields",
            label: "Bidang kerja yang dipersiapkan",
            itemLabel: "Bidang kerja",
            addLabel: "Tambah bidang",
            defaultItem: homepageWorkFieldDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Nama bidang" },
              { kind: "textarea", path: "description", label: "Deskripsi persiapan" },
              { kind: "media", path: "image_id", label: "Gambar bidang" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "steps",
        title: "Steps",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "steps",
            label: "Steps",
            itemLabel: "Step",
            addLabel: "Add step",
            defaultItem: stepDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "applicant_steps",
        title: "Alur Pelamar Kerja",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "applicant_steps",
            label: "Tahapan pelamar kerja",
            itemLabel: "Tahap",
            addLabel: "Tambah tahap",
            defaultItem: stepDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "faqs",
        title: "FAQs",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "faqs",
            label: "FAQs",
            itemLabel: "FAQ",
            addLabel: "Add FAQ",
            defaultItem: faqDefault(0),
            sortOrderField: "sort_order",
            fields: faqFields,
          },
        ],
      },
      {
        key: "testimonials",
        title: "Testimonials",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "testimonials",
            label: "Testimonials",
            itemLabel: "Testimonial",
            addLabel: "Add testimonial",
            defaultItem: {
              name: "",
              role_or_program: "",
              quote: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "text", path: "role_or_program", label: "Role or program" },
              { kind: "textarea", path: "quote", label: "Quote" },
              { kind: "media", path: "image_id", label: "Image" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "latest_blogs",
        title: "Latest Blogs",
        classification: "recommended",
        fields: [
          {
            kind: "switch",
            path: "latest_blogs.is_enabled",
            label: "Tampilkan artikel",
          },
          {
            kind: "select",
            path: "latest_blogs.source",
            label: "Source",
            options: latestBlogSourceOptions,
          },
          {
            kind: "number",
            path: "latest_blogs.max_items",
            label: "Max items",
            min: 1,
            max: 20,
          },
        ],
      },
      {
        key: "contact_section",
        title: "Contact Section",
        classification: "required",
        fields: contactSectionFields.map((field) => ({
          ...field,
          path: `contact_section.${field.path}`,
        })),
      },
    ],
  },
  "indonesia.program_page": {
    variantKey: "indonesia",
    pageKey: "program_page",
    title: "Program Page",
    publicPath: "/program",
    defaultData: {
      hero: {
        ...emptyBasicHero,
        secondary_cta_label: "",
      },
      stats: [],
      filter_config: {
        enable_program_type_filter: true,
        enable_gender_filter: true,
        enable_education_filter: true,
        enable_language_filter: true,
      },
      faq: [],
      final_cta: emptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: [
          ...basicHeroFields,
          {
            kind: "text" as const,
            path: "secondary_cta_label",
            label: "Secondary CTA label",
          },
        ].map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      {
        key: "stats",
        title: "Statistik",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Statistik",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: statDefault(0),
            sortOrderField: "sort_order",
            fields: statFields,
          },
        ],
      },
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_program_type_filter",
            label: "Program type filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_gender_filter",
            label: "Gender filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_education_filter",
            label: "Education filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_language_filter",
            label: "Language filter",
          },
        ],
      },
      {
        key: "faq",
        title: "FAQ",
        classification: "optional",
        fields: [faqArrayField("faq")],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: finalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },
  "indonesia.job_page": {
    variantKey: "indonesia",
    pageKey: "job_page",
    title: "Job Page",
    publicPath: "/job",
    defaultData: {
      hero: emptyBasicHero,
      information_notice: {
        eyebrow: "",
        headline: "",
        description: "",
      },
      filter_config: {
        enable_job_type_filter: true,
        enable_job_field_filter: true,
        enable_gender_filter: true,
        enable_language_filter: true,
      },
      faq: [],
      final_cta: emptyFinalCta,
    },
    sections: [
      simpleBasicHeroSection(),
      {
        key: "information_notice",
        title: "Information notice",
        classification: "required",
        fields: [
          { kind: "text", path: "information_notice.eyebrow", label: "Eyebrow" },
          { kind: "text", path: "information_notice.headline", label: "Headline" },
          { kind: "textarea", path: "information_notice.description", label: "Description" },
        ],
      },
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_job_type_filter",
            label: "Job type filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_job_field_filter",
            label: "Job field filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_gender_filter",
            label: "Gender filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_language_filter",
            label: "Language filter",
          },
        ],
      },
      {
        key: "faq",
        title: "FAQ",
        classification: "optional",
        fields: [faqArrayField("faq")],
      },
      finalCtaSection(),
    ],
  },
  "indonesia.blog_page": {
    variantKey: "indonesia",
    pageKey: "blog_page",
    title: "Blog Page",
    publicPath: "/blog",
    defaultData: {
      hero: emptyBasicHero,
      filter_config: {
        enable_content_type_filter: true,
        enable_category_filter: true,
        enable_tag_filter: true,
      },
      offer_section: {
        source: "active_featured_offer",
        manual_offer_id: "",
      },
    },
    sections: [
      simpleBasicHeroSection(),
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_content_type_filter",
            label: "Filter tipe konten",
          },
          {
            kind: "switch",
            path: "filter_config.enable_category_filter",
            label: "Category filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_tag_filter",
            label: "Tag filter",
          },
        ],
      },
      {
        key: "offer_section",
        title: "Offer Section",
        classification: "optional",
        fields: [
          {
            kind: "select",
            path: "offer_section.source",
            label: "Source",
            options: offerSourceOptions,
          },
          {
            kind: "text",
            path: "offer_section.manual_offer_id",
            label: "Manual offer ID",
          },
        ],
      },
    ],
  },
  "indonesia.tentang_kami": {
    variantKey: "indonesia",
    pageKey: "tentang_kami",
    title: "Tentang Kami",
    publicPath: "/tentang-kami",
    defaultData: {
      hero: emptyMediaHero,
      proof_stats: [],
      company_status: {
        eyebrow_label: "",
        headline: "",
        description: "",
        status_label: "",
        last_updated_label: "",
        facts: [],
      },
      story: {
        badge_label: "",
        headline: "",
        body: "",
        image_id: "",
      },
      japan_relationship: {
        eyebrow_label: "",
        headline: "",
        description: "",
        people: [],
        cooperation_scope: [],
        clarification_note: "",
      },
      education_quality: {
        image_id: "",
        eyebrow_label: "",
        qualification_label: "",
        headline: "",
        description: "",
        leader_name: "",
        leader_role: "",
        experience_label: "",
        focus_items: [],
      },
      operational_readiness: {
        headline: "",
        description: "",
        items: [],
      },
      timeline: [],
      vision_mission: {
        vision_headline: "",
        vision_description: "",
        mission_headline: "",
        mission_description: "",
      },
      values: [],
      team_members: [],
      gallery: {
        media_ids: [],
      },
      partners: [],
      legalities: [],
      contact_section: {
        headline: "",
        description: "",
        use_global_contact: true,
      },
      final_cta: {
        headline: "",
        description: "",
        primary_cta_label: "",
        primary_whatsapp_message: "",
        secondary_cta_label: "",
        secondary_href: "",
      },
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: mediaHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      {
        key: "proof_stats",
        title: "Statistik bukti",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Statistik bukti",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: statDefault(0),
            sortOrderField: "sort_order",
            fields: statFields,
          },
        ],
      },
      {
        key: "company_status",
        title: "Identitas dan status lembaga",
        classification: "required",
        fields: [
          { kind: "text", path: "company_status.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "company_status.headline", label: "Judul utama" },
          { kind: "textarea", path: "company_status.description", label: "Deskripsi" },
          { kind: "text", path: "company_status.status_label", label: "Status saat ini" },
          {
            kind: "text",
            path: "company_status.last_updated_label",
            label: "Tanggal pembaruan",
          },
          {
            kind: "array",
            path: "company_status.facts",
            label: "Fakta lembaga",
            itemLabel: "Fakta",
            addLabel: "Tambah fakta",
            defaultItem: {
              icon_key: "",
              value: "",
              label: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "value", label: "Nilai" },
              { kind: "text", path: "label", label: "Label" },
              { kind: "textarea", path: "description", label: "Penjelasan" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "story",
        title: "Latar belakang pendirian",
        classification: "required",
        fields: [
          { kind: "text", path: "story.badge_label", label: "Label kecil" },
          { kind: "text", path: "story.headline", label: "Judul utama" },
          { kind: "textarea", path: "story.body", label: "Cerita pendirian" },
          { kind: "media", path: "story.image_id", label: "Gambar" },
        ],
      },
      {
        key: "japan_relationship",
        title: "Fondasi hubungan dengan Jepang",
        classification: "recommended",
        fields: [
          { kind: "text", path: "japan_relationship.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "japan_relationship.headline", label: "Judul utama" },
          { kind: "textarea", path: "japan_relationship.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "japan_relationship.people",
            label: "Pihak yang terlibat",
            itemLabel: "Pihak",
            addLabel: "Tambah pihak",
            defaultItem: {
              side_label: "",
              name: "",
              role: "",
              organization: "",
              summary: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "side_label", label: "Label pihak" },
              { kind: "text", path: "name", label: "Nama" },
              { kind: "text", path: "role", label: "Peran" },
              { kind: "text", path: "organization", label: "Organisasi" },
              { kind: "textarea", path: "summary", label: "Ringkasan" },
              ...sortableFields,
            ],
          },
          {
            kind: "string-array",
            path: "japan_relationship.cooperation_scope",
            label: "Bentuk kontribusi",
            itemLabel: "Kontribusi",
            addLabel: "Tambah kontribusi",
          },
          {
            kind: "textarea",
            path: "japan_relationship.clarification_note",
            label: "Catatan batas peran",
          },
        ],
      },
      {
        key: "education_quality",
        title: "Penanggung jawab dan mutu pendidikan",
        classification: "required",
        fields: [
          { kind: "media", path: "education_quality.image_id", label: "Foto penanggung jawab" },
          { kind: "text", path: "education_quality.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "education_quality.qualification_label", label: "Kualifikasi utama" },
          { kind: "text", path: "education_quality.headline", label: "Judul utama" },
          { kind: "textarea", path: "education_quality.description", label: "Deskripsi" },
          { kind: "text", path: "education_quality.leader_name", label: "Nama" },
          { kind: "text", path: "education_quality.leader_role", label: "Jabatan" },
          { kind: "text", path: "education_quality.experience_label", label: "Pengalaman" },
          {
            kind: "string-array",
            path: "education_quality.focus_items",
            label: "Fokus pendidikan",
            itemLabel: "Fokus",
            addLabel: "Tambah fokus",
          },
        ],
      },
      {
        key: "operational_readiness",
        title: "Kondisi operasional saat ini",
        classification: "required",
        fields: [
          { kind: "text", path: "operational_readiness.headline", label: "Judul" },
          { kind: "textarea", path: "operational_readiness.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "operational_readiness.items",
            label: "Kesiapan operasional",
            itemLabel: "Kesiapan",
            addLabel: "Tambah kesiapan",
            defaultItem: {
              status: "planned",
              status_label: "",
              icon_key: "",
              title: "",
              description: "",
              target_label: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              {
                kind: "select",
                path: "status",
                label: "Status",
                options: japanReadinessStatusOptions,
              },
              { kind: "text", path: "status_label", label: "Label status" },
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "target_label", label: "Catatan progres" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "timeline",
        title: "Perjalanan lembaga",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "timeline",
            label: "Linimasa",
            itemLabel: "Peristiwa",
            addLabel: "Tambah peristiwa",
            defaultItem: {
              year_label: "",
              title: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "year_label", label: "Tahun atau periode" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "vision_mission",
        title: "Vision & Mission",
        classification: "required",
        fields: [
          {
            kind: "text",
            path: "vision_mission.vision_headline",
            label: "Vision headline",
          },
          {
            kind: "textarea",
            path: "vision_mission.vision_description",
            label: "Vision description",
          },
          {
            kind: "text",
            path: "vision_mission.mission_headline",
            label: "Mission headline",
          },
          {
            kind: "textarea",
            path: "vision_mission.mission_description",
            label: "Mission description",
          },
        ],
      },
      {
        key: "values",
        title: "Values",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "values",
            label: "Values",
            itemLabel: "Value",
            addLabel: "Add value",
            defaultItem: {
              icon_key: "",
              headline: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "headline", label: "Headline" },
              { kind: "textarea", path: "description", label: "Description" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "team_members",
        title: "Team Members",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "team_members",
            label: "Team members",
            itemLabel: "Team member",
            addLabel: "Add team member",
            defaultItem: {
              name: "",
              role: "",
              organization_name: "",
              responsibility: "",
              credentials: "",
              bio: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "text", path: "role", label: "Role" },
              { kind: "text", path: "organization_name", label: "Organization" },
              { kind: "textarea", path: "credentials", label: "Credentials" },
              { kind: "textarea", path: "responsibility", label: "Responsibility" },
              { kind: "textarea", path: "bio", label: "Bio" },
              { kind: "media", path: "image_id", label: "Image", cropPreset: "portrait" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "gallery",
        title: "Gallery",
        classification: "optional",
        fields: [
          {
            kind: "media-array",
            path: "gallery.media_ids",
            label: "Gallery media",
            itemLabel: "Media",
            addLabel: "Add media",
          },
        ],
      },
      {
        key: "partners",
        title: "Partners",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "partners",
            label: "Partners",
            itemLabel: "Partner",
            addLabel: "Add partner",
            defaultItem: {
              name: "",
              logo_image_id: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "media", path: "logo_image_id", label: "Logo image" },
              { kind: "textarea", path: "description", label: "Description" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "legalities",
        title: "Legalities",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "legalities",
            label: "Legalities",
            itemLabel: "Legality",
            addLabel: "Add legality",
            defaultItem: {
              icon_key: "",
              type_label: "",
              title: "",
              description: "",
              issuing_authority: "",
              issued_date_label: "",
              status_label: "",
              document_label: "",
              document_url: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "type_label", label: "Nomor atau jenis dokumen" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "text", path: "issuing_authority", label: "Instansi penerbit" },
              { kind: "text", path: "issued_date_label", label: "Tanggal terbit" },
              { kind: "text", path: "status_label", label: "Status dokumen" },
              { kind: "text", path: "document_label", label: "Document label" },
              {
                kind: "text",
                path: "document_url",
                label: "Document URL",
                inputType: "url",
              },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "contact_section",
        title: "Contact Section",
        classification: "required",
        fields: contactSectionFields.map((field) => ({
          ...field,
          path: `contact_section.${field.path}`,
        })),
      },
      {
        key: "final_cta",
        title: "Ajakan tindakan akhir",
        classification: "required",
        fields: [
          { kind: "text", path: "final_cta.headline", label: "Judul" },
          { kind: "textarea", path: "final_cta.description", label: "Deskripsi" },
          { kind: "text", path: "final_cta.primary_cta_label", label: "Label WhatsApp" },
          {
            kind: "textarea",
            path: "final_cta.primary_whatsapp_message",
            label: "Pesan WhatsApp",
          },
          { kind: "text", path: "final_cta.secondary_cta_label", label: "Label tombol kedua" },
          {
            kind: "text",
            path: "final_cta.secondary_href",
            label: "Tautan tombol kedua",
            inputType: "url",
          },
        ],
      },
    ],
  },
  "indonesia.karir_page": {
    variantKey: "indonesia",
    pageKey: "karir_page",
    title: "Karir Page",
    publicPath: "/karir",
    defaultData: {
      hero: emptyBasicHero,
      filter_config: {
        enable_department_filter: true,
        enable_employment_type_filter: true,
        enable_work_arrangement_filter: true,
      },
      faq: [],
      final_cta: emptyFinalCta,
    },
    sections: [
      simpleBasicHeroSection(),
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_department_filter",
            label: "Department filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_employment_type_filter",
            label: "Employment type filter",
          },
          {
            kind: "switch",
            path: "filter_config.enable_work_arrangement_filter",
            label: "Work arrangement filter",
          },
        ],
      },
      {
        key: "faq",
        title: "FAQ",
        classification: "optional",
        fields: [faqArrayField("faq")],
      },
      finalCtaSection(),
    ],
  },
  // ── Japan page definitions ──

  "japan.homepage": {
    variantKey: "japan",
    pageKey: "homepage",
    title: "Beranda",
    publicPath: "/",
    defaultData: {
      hero: japanEmptyHomepageHero,
      display_text: japanHomepageDisplayText,
      stats: [
        { ...japanEmptyStat, sort_order: 0 },
        { ...japanEmptyStat, sort_order: 1 },
        { ...japanEmptyStat, sort_order: 2 },
      ],
      achievements: [],
      latest_news: {
        source: "latest_published",
        max_items: 4,
      },
      why_indonesia_section: {
        media_type: "image",
        image_id: "",
        eyebrow_label: "",
        headline: "",
        description: "",
        bullet_items: [],
        cta_label: "",
        target_page: "candidate_profile",
      },
      why_us_cards: [
        {
          key: "about",
          icon_key: "",
          title: "",
          description: "",
          href: "",
          sort_order: 0,
          is_enabled: true,
        },
        {
          key: "recruitment_network",
          icon_key: "",
          title: "",
          description: "",
          href: "",
          sort_order: 1,
          is_enabled: true,
        },
        {
          key: "sectors",
          icon_key: "",
          title: "",
          description: "",
          href: "",
          sort_order: 2,
          is_enabled: true,
        },
        {
          key: "training_method",
          icon_key: "",
          title: "",
          description: "",
          href: "",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      partnership_flow: {
        headline: "",
        description: "",
        items: [],
      },
      legalities: [],
      final_cta: japanEmptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanHomepageDisplayTextFields),
      {
        key: "stats",
        title: "Statistik",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Statistik",
            itemLabel: "Stat",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyStat,
            sortOrderField: "sort_order",
            fields: japanStatFields,
          },
        ],
      },
      {
        key: "achievements",
        title: "Pencapaian",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "achievements",
            label: "Pencapaian",
            itemLabel: "Pencapaian",
            addLabel: "Tambah pencapaian",
            defaultItem: {
              icon_key: "",
              title: "",
              description: "",
              document_label: "",
              document_url: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "document_label", label: "Label dokumen" },
              { kind: "text", path: "document_url", label: "URL dokumen", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "latest_news",
        title: "Berita terbaru",
        classification: "recommended",
        fields: [
          {
            kind: "select",
            path: "latest_news.source",
            label: "Sumber",
            options: [{ value: "latest_published", label: "Terbaru terpublikasi" }],
          },
          {
            kind: "number",
            path: "latest_news.max_items",
            label: "Jumlah maksimal",
            min: 1,
            max: 4,
          },
        ],
      },
      {
        key: "why_indonesia_section",
        title: "Bagian mengapa Indonesia",
        classification: "recommended",
        fields: [
          {
            kind: "select",
            path: "why_indonesia_section.media_type",
            label: "Jenis media",
            options: japanBasicMediaTypeOptions,
          },
          { kind: "media", path: "why_indonesia_section.image_id", label: "Media" },
          { kind: "text", path: "why_indonesia_section.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "why_indonesia_section.headline", label: "Judul utama" },
          { kind: "textarea", path: "why_indonesia_section.description", label: "Deskripsi" },
          {
            kind: "string-array",
            path: "why_indonesia_section.bullet_items",
            label: "Poin bullet",
            itemLabel: "Poin",
            addLabel: "Tambah poin",
            defaultItem: "",
          },
          { kind: "text", path: "why_indonesia_section.cta_label", label: "Label CTA" },
          {
            kind: "select",
            path: "why_indonesia_section.target_page",
            label: "Halaman tujuan",
            options: [{ value: "candidate_profile", label: "Profil kandidat" }],
          },
        ],
      },
      {
        key: "why_us_cards",
        title: "Kartu alasan memilih kami",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "why_us_cards",
            label: "Kartu alasan memilih kami",
            itemLabel: "Kartu",
            addLabel: "Tambah kartu",
            defaultItem: {
              key: "",
              icon_key: "",
              title: "",
              description: "",
              href: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              {
                kind: "select",
                path: "key",
                label: "Jenis kartu",
                options: [
                  { value: "about", label: "Tentang kami" },
                  { value: "recruitment_network", label: "Jaringan rekrutmen" },
                  { value: "sectors", label: "Sektor" },
                  { value: "training_method", label: "Metode pelatihan" },
                ],
              },
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "href", label: "Link" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "partnership_flow",
        title: "Alur kemitraan",
        classification: "recommended",
        fields: [
          {
            kind: "text",
            path: "partnership_flow.headline",
            label: "Judul utama",
          },
          {
            kind: "textarea",
            path: "partnership_flow.description",
            label: "Deskripsi",
          },
          {
            kind: "array",
            path: "partnership_flow.items",
            label: "Tahapan",
            itemLabel: "Tahap",
            addLabel: "Tambah tahap",
            defaultItem: {
              step_label: "",
              icon_key: "",
              title: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "step_label", label: "Label tahap" },
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "legalities",
        title: "Legalitas",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "legalities",
            label: "Legalitas",
            itemLabel: "Legalitas",
            addLabel: "Tambah legalitas",
            defaultItem: {
              type_label: "",
              title: "",
              description: "",
              issuing_authority: "",
              issued_date_label: "",
              status_label: "",
              document_label: "",
              document_url: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "type_label", label: "Label jenis" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "issuing_authority", label: "Instansi penerbit" },
              { kind: "text", path: "issued_date_label", label: "Tanggal terbit" },
              { kind: "text", path: "status_label", label: "Status dokumen" },
              { kind: "text", path: "document_label", label: "Label dokumen" },
              { kind: "text", path: "document_url", label: "URL dokumen", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.tentang_kami": {
    variantKey: "japan",
    pageKey: "tentang_kami",
    title: "Tentang Kami",
    publicPath: "/about",
    defaultData: {
      hero: japanEmptyHero,
      display_text: japanAboutDisplayText,
      proof_stats: [],
      company_status: {
        eyebrow_label: "",
        headline: "",
        description: "",
        status_label: "",
        last_updated_label: "",
        facts: [],
      },
      story: {
        image_id: "",
        eyebrow_label: "",
        headline: "",
        body: "",
      },
      japan_relationship: {
        eyebrow_label: "",
        headline: "",
        description: "",
        people: [],
        cooperation_scope: [],
        clarification_note: "",
      },
      education_quality: {
        image_id: "",
        eyebrow_label: "",
        qualification_label: "",
        headline: "",
        description: "",
        leader_name: "",
        leader_role: "",
        experience_label: "",
        focus_items: [],
      },
      operational_readiness: {
        headline: "",
        description: "",
        items: [],
      },
      leadership_quote: japanDefaultLeadershipQuote,
      timeline: [],
      vision_mission: {
        vision_headline: "",
        vision_description: "",
        mission_headline: "",
        mission_description: "",
      },
      values: [],
      facilities: [],
      team_members: [],
      legal_overview: [],
      final_cta: japanEmptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanAboutDisplayTextFields),
      {
        key: "proof_stats",
        title: "Statistik bukti",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Statistik bukti",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "company_status",
        title: "Status perusahaan",
        classification: "required",
        fields: [
          { kind: "text", path: "company_status.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "company_status.headline", label: "Judul utama" },
          { kind: "textarea", path: "company_status.description", label: "Deskripsi" },
          { kind: "text", path: "company_status.status_label", label: "Label status" },
          {
            kind: "text",
            path: "company_status.last_updated_label",
            label: "Label pembaruan terakhir",
          },
          {
            kind: "array",
            path: "company_status.facts",
            label: "Fakta perusahaan",
            itemLabel: "Fakta",
            addLabel: "Tambah fakta",
            defaultItem: {
              icon_key: "",
              value: "",
              label: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "value", label: "Nilai" },
              { kind: "text", path: "label", label: "Label" },
              { kind: "textarea", path: "description", label: "Keterangan" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "story",
        title: "Cerita",
        classification: "required",
        fields: [
          { kind: "media", path: "story.image_id", label: "Gambar" },
          { kind: "text", path: "story.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "story.headline", label: "Judul utama" },
          { kind: "textarea", path: "story.body", label: "Isi cerita" },
        ],
      },
      {
        key: "japan_relationship",
        title: "Hubungan profesional Jepang",
        classification: "required",
        fields: [
          {
            kind: "text",
            path: "japan_relationship.eyebrow_label",
            label: "Label kecil",
          },
          { kind: "text", path: "japan_relationship.headline", label: "Judul utama" },
          {
            kind: "textarea",
            path: "japan_relationship.description",
            label: "Deskripsi hubungan",
          },
          {
            kind: "array",
            path: "japan_relationship.people",
            label: "Tokoh utama",
            itemLabel: "Tokoh",
            addLabel: "Tambah tokoh",
            defaultItem: {
              side_label: "",
              name: "",
              role: "",
              organization: "",
              summary: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "side_label", label: "Label sisi" },
              { kind: "text", path: "name", label: "Nama" },
              { kind: "text", path: "role", label: "Peran" },
              { kind: "text", path: "organization", label: "Organisasi" },
              { kind: "textarea", path: "summary", label: "Ringkasan hubungan" },
              ...japanSortableFields,
            ],
          },
          {
            kind: "string-array",
            path: "japan_relationship.cooperation_scope",
            label: "Ruang lingkup kerja sama",
            itemLabel: "Ruang lingkup",
            addLabel: "Tambah ruang lingkup",
            defaultItem: "",
          },
          {
            kind: "textarea",
            path: "japan_relationship.clarification_note",
            label: "Catatan penjelas",
          },
        ],
      },
      {
        key: "education_quality",
        title: "Sorotan mutu pendidikan",
        classification: "required",
        fields: [
          { kind: "media", path: "education_quality.image_id", label: "Foto" },
          {
            kind: "text",
            path: "education_quality.eyebrow_label",
            label: "Label kecil",
          },
          {
            kind: "text",
            path: "education_quality.qualification_label",
            label: "Label kualifikasi",
          },
          { kind: "text", path: "education_quality.headline", label: "Judul utama" },
          {
            kind: "textarea",
            path: "education_quality.description",
            label: "Deskripsi",
          },
          { kind: "text", path: "education_quality.leader_name", label: "Nama pimpinan" },
          { kind: "text", path: "education_quality.leader_role", label: "Jabatan" },
          {
            kind: "text",
            path: "education_quality.experience_label",
            label: "Label pengalaman",
          },
          {
            kind: "string-array",
            path: "education_quality.focus_items",
            label: "Fokus pendidikan",
            itemLabel: "Fokus",
            addLabel: "Tambah fokus",
            defaultItem: "",
          },
        ],
      },
      {
        key: "operational_readiness",
        title: "Kesiapan operasional",
        classification: "required",
        fields: [
          {
            kind: "text",
            path: "operational_readiness.headline",
            label: "Judul utama",
          },
          {
            kind: "textarea",
            path: "operational_readiness.description",
            label: "Deskripsi",
          },
          {
            kind: "array",
            path: "operational_readiness.items",
            label: "Item kesiapan",
            itemLabel: "Item",
            addLabel: "Tambah item",
            defaultItem: {
              status: "planned",
              status_label: "",
              icon_key: "",
              title: "",
              description: "",
              target_label: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              {
                kind: "select",
                path: "status",
                label: "Status",
                options: japanReadinessStatusOptions,
              },
              { kind: "text", path: "status_label", label: "Label status" },
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "target_label", label: "Label waktu/target" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "leadership_quote",
        title: "Kutipan pimpinan",
        classification: "recommended",
        fields: [
          { kind: "switch", path: "leadership_quote.is_enabled", label: "Aktif" },
          { kind: "textarea", path: "leadership_quote.quote", label: "Kutipan" },
          { kind: "text", path: "leadership_quote.attribution_name", label: "Nama atribusi" },
          { kind: "text", path: "leadership_quote.attribution_role", label: "Jabatan atribusi" },
          { kind: "media", path: "leadership_quote.photo_image_id", label: "Foto opsional" },
        ],
      },
      {
        key: "timeline",
        title: "Linimasa",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "timeline",
            label: "Linimasa",
            itemLabel: "Entri",
            addLabel: "Tambah entri",
            defaultItem: japanEmptyTimeline,
            sortOrderField: "sort_order",
            fields: japanTimelineFields,
          },
        ],
      },
      {
        key: "vision_mission",
        title: "Visi dan misi",
        classification: "required",
        fields: [
          { kind: "text", path: "vision_mission.vision_headline", label: "Judul visi" },
          { kind: "textarea", path: "vision_mission.vision_description", label: "Deskripsi visi" },
          { kind: "text", path: "vision_mission.mission_headline", label: "Judul misi" },
          { kind: "textarea", path: "vision_mission.mission_description", label: "Deskripsi misi" },
        ],
      },
      {
        key: "values",
        title: "Nilai",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "values",
            label: "Nilai",
            itemLabel: "Nilai",
            addLabel: "Tambah nilai",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "facilities",
        title: "Fasilitas",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "facilities",
            label: "Fasilitas",
            itemLabel: "Fasilitas",
            addLabel: "Tambah fasilitas",
            defaultItem: {
              title: "",
              description: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "media", path: "image_id", label: "Gambar" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "team_members",
        title: "Anggota tim",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "team_members",
            label: "Anggota tim",
            itemLabel: "Anggota",
            addLabel: "Tambah anggota",
            defaultItem: {
              name: "",
              role: "",
              bio: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "name", label: "Nama" },
              { kind: "text", path: "role", label: "Peran" },
              { kind: "text", path: "organization_name", label: "Organisasi" },
              { kind: "textarea", path: "responsibility", label: "Tanggung jawab" },
              { kind: "textarea", path: "credentials", label: "Kualifikasi" },
              { kind: "textarea", path: "bio", label: "Bio" },
              { kind: "media", path: "image_id", label: "Gambar", cropPreset: "portrait" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "legal_overview",
        title: "Ringkasan legalitas",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "legal_overview",
            label: "Ringkasan legalitas",
            itemLabel: "Legalitas",
            addLabel: "Tambah legalitas",
            defaultItem: {
              type_label: "",
              title: "",
              description: "",
              document_label: "",
              document_url: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "type_label", label: "Label jenis" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "text", path: "document_label", label: "Label dokumen" },
              { kind: "text", path: "document_url", label: "URL dokumen", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.metode_pelatihan": {
    variantKey: "japan",
    pageKey: "metode_pelatihan",
    title: "Metode Pelatihan",
    publicPath: "/training-method",
    defaultData: {
      hero: japanEmptyHero,
      display_text: japanTrainingDisplayText,
      curriculum_download: {
        headline: "",
        description: "",
        file_url: "",
        button_label: "",
        version_label: "",
        updated_label: "",
        language_label: "",
        scope_label: "",
        is_enabled: false,
      },
      partner_risks: {
        eyebrow_label: "",
        headline: "",
        description: "",
        items: [],
      },
      training_pillars: [],
      training_flow: [],
      program_overview: {
        eyebrow_label: "",
        headline: "",
        description: "",
        stats: [],
        stages: [],
      },
      curriculum_stats: [],
      curriculum_areas: [],
      sector_modules: {
        eyebrow_label: "",
        headline: "",
        description: "",
        items: [],
      },
      evaluation_items: [],
      readiness_standards: {
        eyebrow_label: "",
        headline: "",
        description: "",
        criteria: [],
      },
      quality_gates: {
        eyebrow_label: "",
        headline: "",
        description: "",
        governance_note: "",
        items: [],
      },
      partner_report: {
        eyebrow_label: "",
        headline: "",
        description: "",
        image_id: "",
        deliverables: [],
        sample_document_url: "",
        sample_document_file_id: "",
        sample_document_label: "",
      },
      outcome_evidence: {
        eyebrow_label: "",
        headline: "",
        description: "",
        stats: [],
        source_label: "",
        period_label: "",
        methodology_note: "",
      },
      training_gallery: [],
      faq_intro: { headline: "", description: "" },
      faqs: [],
      final_cta: japanEmptyFinalCtaWithDoc,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanTrainingDisplayTextFields),
      {
        key: "curriculum_download",
        title: "Unduhan kurikulum",
        classification: "optional",
        fields: [
          { kind: "switch", path: "curriculum_download.is_enabled", label: "Aktif" },
          { kind: "text", path: "curriculum_download.headline", label: "Judul utama" },
          { kind: "textarea", path: "curriculum_download.description", label: "Deskripsi" },
          { kind: "text", path: "curriculum_download.file_url", label: "URL file", inputType: "url" },
          { kind: "document", path: "curriculum_download.file_id", label: "File kurikulum" },
          { kind: "text", path: "curriculum_download.button_label", label: "Label tombol" },
          { kind: "text", path: "curriculum_download.version_label", label: "Versi dokumen" },
          { kind: "text", path: "curriculum_download.updated_label", label: "Tanggal pembaruan" },
          { kind: "text", path: "curriculum_download.language_label", label: "Bahasa dokumen" },
          { kind: "text", path: "curriculum_download.scope_label", label: "Cakupan dokumen" },
        ],
      },
      {
        key: "partner_risks",
        title: "Risiko mitra yang ditangani",
        classification: "required",
        fields: [
          { kind: "text", path: "partner_risks.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "partner_risks.headline", label: "Judul utama" },
          { kind: "textarea", path: "partner_risks.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "partner_risks.items",
            label: "Risiko yang ditangani",
            itemLabel: "Risiko",
            addLabel: "Tambah risiko",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "training_pillars",
        title: "Pilar pelatihan",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "training_pillars",
            label: "Pilar pelatihan",
            itemLabel: "Pilar",
            addLabel: "Tambah pilar",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "training_flow",
        title: "Alur pelatihan",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "training_flow",
            label: "Alur pelatihan",
            itemLabel: "Langkah",
            addLabel: "Tambah langkah",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "program_overview",
        title: "Struktur program terukur",
        classification: "required",
        fields: [
          { kind: "text", path: "program_overview.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "program_overview.headline", label: "Judul utama" },
          { kind: "textarea", path: "program_overview.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "program_overview.stats",
            label: "Parameter program",
            itemLabel: "Parameter",
            addLabel: "Tambah parameter",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
          {
            kind: "array",
            path: "program_overview.stages",
            label: "Tahapan program",
            itemLabel: "Tahap",
            addLabel: "Tambah tahap",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "curriculum_stats",
        title: "Statistik ringkas kurikulum",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "curriculum_stats",
            label: "Statistik ringkas kurikulum",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "curriculum_areas",
        title: "Area kurikulum",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "curriculum_areas",
            label: "Area kurikulum",
            itemLabel: "Area",
            addLabel: "Tambah area",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "sector_modules",
        title: "Modul berdasarkan sektor",
        classification: "recommended",
        fields: [
          { kind: "text", path: "sector_modules.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "sector_modules.headline", label: "Judul utama" },
          { kind: "textarea", path: "sector_modules.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "sector_modules.items",
            label: "Modul sektor",
            itemLabel: "Modul",
            addLabel: "Tambah modul",
            defaultItem: japanEmptySectorModule,
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Ikon" },
              { kind: "text", path: "sector_label", label: "Label sektor" },
              { kind: "text", path: "title", label: "Judul modul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              {
                kind: "string-array",
                path: "focus_items",
                label: "Fokus pembelajaran",
                itemLabel: "Fokus",
                addLabel: "Tambah fokus",
                defaultItem: "",
              },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "evaluation_items",
        title: "Item evaluasi",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "evaluation_items",
            label: "Item evaluasi",
            itemLabel: "Item",
            addLabel: "Tambah item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "readiness_standards",
        title: "Standar kelulusan kandidat",
        classification: "required",
        fields: [
          { kind: "text", path: "readiness_standards.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "readiness_standards.headline", label: "Judul utama" },
          { kind: "textarea", path: "readiness_standards.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "readiness_standards.criteria",
            label: "Kriteria kelulusan",
            itemLabel: "Kriteria",
            addLabel: "Tambah kriteria",
            defaultItem: japanEmptyReadinessCriterion,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "competency_label", label: "Kompetensi" },
              { kind: "textarea", path: "assessment_method", label: "Metode penilaian" },
              { kind: "textarea", path: "pass_standard", label: "Standar lulus" },
              { kind: "textarea", path: "evidence_label", label: "Bukti yang dicatat" },
              { kind: "textarea", path: "failure_action", label: "Tindakan jika belum lulus" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "quality_gates",
        title: "Quality gate dan remedial",
        classification: "required",
        fields: [
          { kind: "text", path: "quality_gates.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "quality_gates.headline", label: "Judul utama" },
          { kind: "textarea", path: "quality_gates.description", label: "Deskripsi" },
          { kind: "textarea", path: "quality_gates.governance_note", label: "Catatan tata kelola penilaian" },
          {
            kind: "array",
            path: "quality_gates.items",
            label: "Quality gate",
            itemLabel: "Gate",
            addLabel: "Tambah gate",
            defaultItem: japanEmptyQualityGate,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "stage_label", label: "Label tahap" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "assessment_method", label: "Metode pemeriksaan" },
              { kind: "textarea", path: "pass_standard", label: "Standar lanjut" },
              { kind: "textarea", path: "evidence_label", label: "Bukti yang disimpan" },
              { kind: "textarea", path: "failure_action", label: "Tindakan koreksi" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "partner_report",
        title: "Laporan untuk perusahaan",
        classification: "required",
        fields: [
          { kind: "text", path: "partner_report.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "partner_report.headline", label: "Judul utama" },
          { kind: "textarea", path: "partner_report.description", label: "Deskripsi" },
          { kind: "media", path: "partner_report.image_id", label: "Preview laporan" },
          {
            kind: "string-array",
            path: "partner_report.deliverables",
            label: "Isi laporan",
            itemLabel: "Isi",
            addLabel: "Tambah isi",
            defaultItem: "",
          },
          { kind: "text", path: "partner_report.sample_document_url", label: "URL contoh laporan", inputType: "url" },
          { kind: "document", path: "partner_report.sample_document_file_id", label: "File contoh laporan" },
          { kind: "text", path: "partner_report.sample_document_label", label: "Label tombol laporan" },
        ],
      },
      {
        key: "outcome_evidence",
        title: "Bukti dan metodologi data",
        classification: "recommended",
        fields: [
          { kind: "text", path: "outcome_evidence.eyebrow_label", label: "Label kecil" },
          { kind: "text", path: "outcome_evidence.headline", label: "Judul utama" },
          { kind: "textarea", path: "outcome_evidence.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "outcome_evidence.stats",
            label: "Metrik bukti",
            itemLabel: "Metrik",
            addLabel: "Tambah metrik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
          { kind: "text", path: "outcome_evidence.source_label", label: "Sumber data" },
          { kind: "text", path: "outcome_evidence.period_label", label: "Periode data" },
          { kind: "textarea", path: "outcome_evidence.methodology_note", label: "Catatan metodologi" },
        ],
      },
      {
        key: "training_gallery",
        title: "Galeri pelatihan",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "training_gallery",
            label: "Galeri pelatihan",
            itemLabel: "Item",
            addLabel: "Tambah item",
            defaultItem: japanEmptyGalleryItem,
            sortOrderField: "sort_order",
            fields: [
              { kind: "media", path: "media_id", label: "Media" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "faqs",
        title: "FAQ perusahaan",
        classification: "recommended",
        fields: [
          { kind: "text", path: "faq_intro.headline", label: "Judul utama" },
          { kind: "textarea", path: "faq_intro.description", label: "Deskripsi" },
          {
            kind: "array",
            path: "faqs",
            label: "FAQ",
            itemLabel: "FAQ",
            addLabel: "Tambah FAQ",
            defaultItem: {
              question: "",
              answer: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "question", label: "Pertanyaan" },
              { kind: "textarea", path: "answer", label: "Jawaban" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFieldsWithDoc.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.profil_kandidat": {
    variantKey: "japan",
    pageKey: "profil_kandidat",
    title: "Profil Kandidat",
    publicPath: "/candidate-profile",
    defaultData: {
      hero: { ...japanEmptyHero, model: "standard" },
      candidate_pool_hero: japanEmptyCandidatePoolHero,
      display_text: japanCandidateDisplayText,
      proof_stats: [],
      why_indonesia: {
        media_type: "image",
        image_id: "",
        headline: "",
        description: "",
        bullet_items: [],
      },
      candidate_strengths: [],
      supported_pathways: [],
      candidate_examples: [],
      selection_assurance: [],
      handoff_process: [],
      faqs: [],
      readiness_framework: [],
      partner_perspective: {
        quote: "",
        attribution_label: "",
        is_enabled: false,
      },
      final_cta: japanEmptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: [
          {
            kind: "select",
            path: "hero.model",
            label: "Model hero",
            options: japanCandidateHeroModelOptions,
          },
          ...japanBasicHeroFields.map((field) => ({
            ...field,
            path: `hero.${field.path}`,
          })),
        ],
      },
      {
        key: "candidate_pool_hero",
        title: "Hero candidate pool",
        classification: "optional",
        fields: [
          {
            kind: "text",
            path: "candidate_pool_hero.eyebrow_label",
            label: "Label kecil",
          },
          {
            kind: "text",
            path: "candidate_pool_hero.headline",
            label: "Judul utama",
          },
          {
            kind: "textarea",
            path: "candidate_pool_hero.subheadline",
            label: "Subjudul",
          },
          {
            kind: "text",
            path: "candidate_pool_hero.primary_cta_label",
            label: "Label CTA utama",
          },
          {
            kind: "textarea",
            path: "candidate_pool_hero.primary_line_message_template",
            label: "Template pesan LINE utama",
          },
          {
            kind: "text",
            path: "candidate_pool_hero.secondary_cta_label",
            label: "Label CTA kedua",
          },
          {
            kind: "text",
            path: "candidate_pool_hero.secondary_href",
            label: "Link CTA kedua",
            inputType: "url",
          },
          {
            kind: "text",
            path: "candidate_pool_hero.trust_note",
            label: "Catatan kepercayaan",
          },
          {
            kind: "array",
            path: "candidate_pool_hero.stats",
            label: "Statistik ringkas",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
          {
            kind: "array",
            path: "candidate_pool_hero.candidate_cards",
            label: "Kartu kandidat",
            itemLabel: "Kandidat",
            addLabel: "Tambah kandidat",
            defaultItem: {
              initials: "",
              name: "",
              nationality_label: "",
              target_sector_label: "",
              age_label: "",
              japanese_level_label: "",
              readiness_label: "",
              availability_label: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "initials", label: "Inisial" },
              { kind: "text", path: "name", label: "Nama kandidat" },
              { kind: "text", path: "nationality_label", label: "Kewarganegaraan" },
              { kind: "text", path: "target_sector_label", label: "Sektor target" },
              { kind: "text", path: "age_label", label: "Usia" },
              { kind: "text", path: "japanese_level_label", label: "Level bahasa Jepang" },
              { kind: "text", path: "readiness_label", label: "Status kesiapan" },
              { kind: "text", path: "availability_label", label: "Perkiraan ketersediaan" },
              { kind: "media", path: "image_id", label: "Foto kandidat" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      japanDisplayTextSection(japanCandidateDisplayTextFields),
      {
        key: "proof_stats",
        title: "Statistik bukti",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Statistik bukti",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "why_indonesia",
        title: "Mengapa Indonesia",
        classification: "required",
        fields: [
          {
            kind: "select",
            path: "why_indonesia.media_type",
            label: "Jenis media",
            options: japanBasicMediaTypeOptions,
          },
          { kind: "media", path: "why_indonesia.image_id", label: "Media" },
          { kind: "text", path: "why_indonesia.headline", label: "Judul utama" },
          { kind: "textarea", path: "why_indonesia.description", label: "Deskripsi" },
          {
            kind: "string-array",
            path: "why_indonesia.bullet_items",
            label: "Poin bullet",
            itemLabel: "Poin",
            addLabel: "Tambah poin",
            defaultItem: "",
          },
        ],
      },
      {
        key: "candidate_strengths",
        title: "Kekuatan kandidat",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "candidate_strengths",
            label: "Kekuatan kandidat",
            itemLabel: "Kekuatan",
            addLabel: "Tambah kekuatan",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "supported_pathways",
        title: "Jalur yang didukung",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "supported_pathways",
            label: "Jalur yang didukung",
            itemLabel: "Jalur",
            addLabel: "Tambah jalur",
            defaultItem: {
              pathway_label: "",
              title: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "pathway_label", label: "Label jalur" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "candidate_examples",
        title: "Contoh kandidat",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "candidate_examples",
            label: "Contoh kandidat",
            itemLabel: "Contoh",
            addLabel: "Tambah contoh",
            defaultItem: {
              initials: "",
              name: "",
              age_origin_label: "",
              background_label: "経歴・学習状況",
              background_text: "",
              target_path_label: "希望職種・在留資格",
              target_path_text: "",
              language_label: "日本語レベル",
              language_text: "",
              character_label: "面接・勤務姿勢",
              character_text: "",
              screening_label: "確認状況",
              screening_text: "",
              availability_label: "紹介可能時期",
              availability_text: "",
              readiness_label: "面接前確認済み",
              readiness_is_enabled: true,
              highlight_tags: [],
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "initials", label: "Inisial" },
              { kind: "text", path: "name", label: "Nama kandidat" },
              { kind: "text", path: "age_origin_label", label: "Usia dan asal" },
              {
                kind: "string-array",
                path: "highlight_tags",
                label: "Tag ringkas",
                itemLabel: "Tag",
                addLabel: "Tambah tag",
                defaultItem: "",
              },
              { kind: "text", path: "background_label", label: "Label latar belakang" },
              { kind: "textarea", path: "background_text", label: "Latar belakang" },
              { kind: "text", path: "target_path_label", label: "Label target jalur" },
              { kind: "textarea", path: "target_path_text", label: "Target jalur" },
              { kind: "text", path: "language_label", label: "Label kemampuan bahasa" },
              { kind: "textarea", path: "language_text", label: "Kemampuan bahasa" },
              { kind: "text", path: "character_label", label: "Label karakter" },
              { kind: "textarea", path: "character_text", label: "Karakter" },
              { kind: "text", path: "screening_label", label: "Label status konfirmasi" },
              { kind: "textarea", path: "screening_text", label: "Status konfirmasi" },
              { kind: "text", path: "availability_label", label: "Label ketersediaan" },
              { kind: "textarea", path: "availability_text", label: "Ketersediaan" },
              { kind: "switch", path: "readiness_is_enabled", label: "Tampilkan status siap seleksi" },
              { kind: "text", path: "readiness_label", label: "Label status siap seleksi" },
              { kind: "media", path: "image_id", label: "Gambar" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "selection_assurance",
        title: "選考前の確認体制",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "selection_assurance",
            label: "Konfirmasi sebelum seleksi",
            itemLabel: "Konfirmasi",
            addLabel: "Tambah konfirmasi",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "handoff_process",
        title: "ご提案までの流れ",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "handoff_process",
            label: "Alur pengajuan kandidat",
            itemLabel: "Tahap",
            addLabel: "Tambah tahap",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "faqs",
        title: "FAQ",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "faqs",
            label: "Pertanyaan umum",
            itemLabel: "FAQ",
            addLabel: "Tambah FAQ",
            defaultItem: faqDefault(0),
            sortOrderField: "sort_order",
            fields: faqFields,
          },
        ],
      },
      {
        key: "readiness_framework",
        title: "受け入れ前の準備項目",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "readiness_framework",
            label: "Kerangka kesiapan",
            itemLabel: "Item",
            addLabel: "Tambah item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "partner_perspective",
        title: "Perspektif partner",
        classification: "optional",
        fields: [
          { kind: "switch", path: "partner_perspective.is_enabled", label: "Aktif" },
          { kind: "textarea", path: "partner_perspective.quote", label: "Kutipan" },
          { kind: "text", path: "partner_perspective.attribution_label", label: "Label atribusi" },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.jaringan_rekrutmen": {
    variantKey: "japan",
    pageKey: "jaringan_rekrutmen",
    title: "Jaringan Rekrutmen",
    publicPath: "/recruitment-network",
    defaultData: {
      hero: { ...japanEmptyHero, model: "standard" },
      network_map_hero: japanEmptyNetworkMapHero,
      display_text: japanRecruitmentDisplayText,
      proof_stats: [],
      network_overview: {
        map_image_id: "",
        gallery_media_ids: [],
        headline: "",
        description: "",
      },
      coverage_regions: [],
      recruitment_sources: [],
      screening_flow: [],
      network_nodes: [],
      quality_control_items: [],
      faqs: [],
      final_cta: japanEmptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: [
          {
            kind: "select",
            path: "hero.model",
            label: "Model hero",
            options: japanRecruitmentHeroModelOptions,
          },
          ...japanBasicHeroFields.map((field) => ({
            ...field,
            path: `hero.${field.path}`,
          })),
        ],
      },
      {
        key: "network_map_hero",
        title: "Hero network map",
        classification: "optional",
        fields: [
          {
            kind: "text",
            path: "network_map_hero.panel_badge_label",
            label: "Label badge panel",
          },
          {
            kind: "text",
            path: "network_map_hero.panel_title",
            label: "Judul panel",
          },
          {
            kind: "text",
            path: "network_map_hero.trust_note",
            label: "Catatan kepercayaan",
          },
        ],
      },
      japanDisplayTextSection(japanRecruitmentDisplayTextFields),
      {
        key: "proof_stats",
        title: "Statistik bukti",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Statistik bukti",
            itemLabel: "Statistik",
            addLabel: "Tambah statistik",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "network_overview",
        title: "Ringkasan jaringan",
        classification: "required",
        fields: [
          { kind: "media", path: "network_overview.map_image_id", label: "Gambar peta" },
          {
            kind: "media-array",
            path: "network_overview.gallery_media_ids",
            label: "Slide foto ringkasan",
            itemLabel: "Foto",
            addLabel: "Tambah foto",
            defaultItem: "",
          },
          { kind: "text", path: "network_overview.headline", label: "Judul utama" },
          { kind: "textarea", path: "network_overview.description", label: "Deskripsi" },
        ],
      },
      {
        key: "coverage_regions",
        title: "Wilayah cakupan",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "coverage_regions",
            label: "Wilayah cakupan",
            itemLabel: "Wilayah",
            addLabel: "Tambah wilayah",
            defaultItem: japanEmptyRegion,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "region_name", label: "Nama wilayah" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "recruitment_sources",
        title: "Sumber rekrutmen",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "recruitment_sources",
            label: "Sumber rekrutmen",
            itemLabel: "Sumber",
            addLabel: "Tambah sumber",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "screening_flow",
        title: "Alur screening",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "screening_flow",
            label: "Alur screening",
            itemLabel: "Langkah",
            addLabel: "Tambah langkah",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "network_nodes",
        title: "Titik jaringan",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "network_nodes",
            label: "Titik jaringan",
            itemLabel: "Titik",
            addLabel: "Tambah titik",
            defaultItem: japanEmptyNetworkNode,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "region_label", label: "Label wilayah" },
              { kind: "text", path: "title", label: "Judul" },
              { kind: "textarea", path: "description", label: "Deskripsi" },
              { kind: "media", path: "image_id", label: "Gambar" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "quality_control_items",
        title: "Kontrol kualitas",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "quality_control_items",
            label: "Item kontrol kualitas",
            itemLabel: "Item",
            addLabel: "Tambah item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "faqs",
        title: "FAQ",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "faqs",
            label: "FAQ",
            itemLabel: "FAQ",
            addLabel: "Tambah FAQ",
            defaultItem: faqDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "question", label: "Pertanyaan" },
              { kind: "textarea", path: "answer", label: "Jawaban" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.sector_page": {
    variantKey: "japan",
    pageKey: "sector_page",
    title: "Halaman Sektor",
    publicPath: "/sectors",
    defaultData: {
      hero: japanEmptyHero,
      display_text: japanSectorPageDisplayText,
      filter_config: {
        enable_sector_category_filter: true,
      },
      final_cta: japanEmptyFinalCtaWithDoc,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanSectorPageDisplayTextFields),
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_sector_category_filter",
            label: "Filter kategori sektor",
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFieldsWithDoc.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.news_page": {
    variantKey: "japan",
    pageKey: "news_page",
    title: "Halaman Berita",
    publicPath: "/news",
    defaultData: {
      hero: japanEmptyHero,
      display_text: japanNewsPageDisplayText,
      filter_config: {
        enable_category_filter: true,
        enable_tag_filter: true,
      },
      final_cta: japanEmptyFinalCta,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanNewsPageDisplayTextFields),
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_category_filter",
            label: "Filter kategori",
          },
          {
            kind: "switch",
            path: "filter_config.enable_tag_filter",
            label: "Filter tag",
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFields.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },

  "japan.contact": {
    variantKey: "japan",
    pageKey: "contact",
    title: "Kontak",
    publicPath: "/contact",
    defaultData: {
      hero: japanEmptyHero,
      display_text: japanContactDisplayText,
      contact_channels: {
        line_official_account_id: "",
        line_cta_label: "",
        line_message_template: "",
        line_description: "",
        business_email: "",
        email_subject_template: "",
        email_description: "",
        form_cta_label: "",
      },
      trust_points: [],
      consultation_topics: [],
      inquiry_form: {
        submit_label: "",
        consent_label: "",
        response_note: "",
      },
      preparation_items: [],
      partnership_pic: {
        name: "",
        role: "",
        photo_image_id: "",
        description: "",
      },
      business_info: {
        description: "",
        business_hours: "",
        language_support: [],
        address: "",
        map_url: "",
        map_embed_url: "",
      },
      inquiry_flow: [],
      faqs: [],
      final_cta: japanEmptyFinalCtaWithDoc,
    },
    sections: [
      {
        key: "hero",
        title: "Hero",
        classification: "required",
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      japanDisplayTextSection(japanContactDisplayTextFields),
      {
        key: "trust_points",
        title: "Trust strip",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "trust_points",
            label: "Poin kepercayaan",
            itemLabel: "Poin",
            addLabel: "Tambah poin",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "contact_channels",
        title: "Channel kontak",
        classification: "required",
        fields: [
          { kind: "text", path: "contact_channels.line_official_account_id", label: "ID akun resmi LINE" },
          { kind: "text", path: "contact_channels.line_cta_label", label: "Label CTA LINE" },
          { kind: "textarea", path: "contact_channels.line_message_template", label: "Template pesan LINE" },
          { kind: "textarea", path: "contact_channels.line_description", label: "Deskripsi LINE" },
          { kind: "text", path: "contact_channels.business_email", label: "Email bisnis", inputType: "email" },
          { kind: "text", path: "contact_channels.email_subject_template", label: "Template subject email" },
          { kind: "textarea", path: "contact_channels.email_description", label: "Deskripsi email" },
          { kind: "text", path: "contact_channels.form_cta_label", label: "Label tombol formulir" },
        ],
      },
      {
        key: "consultation_topics",
        title: "Topik konsultasi",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "consultation_topics",
            label: "Topik konsultasi",
            itemLabel: "Topik",
            addLabel: "Tambah topik",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "inquiry_form",
        title: "Formulir inquiry",
        classification: "required",
        fields: [
          { kind: "text", path: "inquiry_form.submit_label", label: "Label tombol kirim email" },
          { kind: "textarea", path: "inquiry_form.consent_label", label: "Teks persetujuan" },
          { kind: "textarea", path: "inquiry_form.response_note", label: "Catatan waktu respons" },
        ],
      },
      {
        key: "preparation_items",
        title: "Informasi yang perlu disiapkan",
        classification: "recommended",
        fields: [
          {
            kind: "string-array",
            path: "preparation_items",
            label: "Informasi yang perlu disiapkan",
            itemLabel: "Informasi",
            addLabel: "Tambah informasi",
            defaultItem: "",
          },
        ],
      },
      {
        key: "partnership_pic",
        title: "PIC partnership",
        classification: "optional",
        fields: [
          { kind: "text", path: "partnership_pic.name", label: "Nama" },
          { kind: "text", path: "partnership_pic.role", label: "Peran" },
          { kind: "media", path: "partnership_pic.photo_image_id", label: "Foto" },
          { kind: "textarea", path: "partnership_pic.description", label: "Deskripsi" },
        ],
      },
      {
        key: "business_info",
        title: "Informasi bisnis",
        classification: "required",
        fields: [
          { kind: "textarea", path: "business_info.description", label: "Deskripsi informasi bisnis" },
          { kind: "text", path: "business_info.business_hours", label: "Jam operasional" },
          {
            kind: "string-array",
            path: "business_info.language_support",
            label: "Bahasa layanan",
            itemLabel: "Bahasa",
            addLabel: "Tambah bahasa",
            defaultItem: "",
          },
          { kind: "text", path: "business_info.address", label: "Alamat" },
          { kind: "text", path: "business_info.map_url", label: "URL peta", inputType: "url" },
          { kind: "text", path: "business_info.map_embed_url", label: "URL embed peta", inputType: "url" },
        ],
      },
      {
        key: "inquiry_flow",
        title: "Alur inquiry",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "inquiry_flow",
            label: "Alur inquiry",
            itemLabel: "Langkah",
            addLabel: "Tambah langkah",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "faqs",
        title: "FAQ",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "faqs",
            label: "FAQ",
            itemLabel: "FAQ",
            addLabel: "Tambah FAQ",
            defaultItem: {
              question: "",
              answer: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "question", label: "Pertanyaan" },
              { kind: "textarea", path: "answer", label: "Jawaban" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "CTA akhir",
        classification: "required",
        fields: japanFinalCtaFieldsWithDoc.map((field) => ({
          ...field,
          path: `final_cta.${field.path}`,
        })),
      },
    ],
  },
} satisfies Record<PageEditorDefinitionKey, PageEditorDefinition>;

export function getPageEditorDefinition(key: PageEditorDefinitionKey) {
  return PAGE_EDITOR_DEFINITIONS[key];
}

function simpleBasicHeroSection(): PageEditorSection {
  return {
    key: "hero",
    title: "Hero",
    classification: "required",
    fields: basicHeroFields.map((field) => ({
      ...field,
      path: `hero.${field.path}`,
    })),
  };
}

function faqArrayField(path: string): PageEditorField {
  return {
    kind: "array",
    path,
    label: "FAQ",
    itemLabel: "FAQ",
    addLabel: "Add FAQ",
    defaultItem: faqDefault(0),
    sortOrderField: "sort_order",
    fields: faqFields,
  };
}

function finalCtaSection(): PageEditorSection {
  return {
    key: "final_cta",
    title: "CTA akhir",
    classification: "required",
    fields: finalCtaFields.map((field) => ({
      ...field,
      path: `final_cta.${field.path}`,
    })),
  };
}
