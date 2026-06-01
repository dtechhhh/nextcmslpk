import {
  COLLECTIONS_INDONESIA,
  COLLECTIONS_JAPAN,
  type CollectionKey,
} from "@/lib/constants";
import type { MediaCropPreset } from "@/lib/media-crop";
import type { VariantKey } from "@/types";

export type { CollectionKey };

export type PublishStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "FILLED";

export type CollectionOptionValue = {
  id: string;
  value: string;
  label: string;
  optionSetKey: string;
};

export type CollectionOptionSets = Record<string, CollectionOptionValue[]>;

export type SelectOption = {
  value: string;
  label: string;
};

export type ContentBlockType =
  | "heading"
  | "paragraph"
  | "quote"
  | "image"
  | "youtube_embed"
  | "offer_callout"
  | "whatsapp_cta"
  | "line_cta"
  | "sector_callout";

export type CollectionField =
  | {
      kind: "text" | "textarea" | "number" | "date" | "switch" | "document";
      path: string;
      label: string;
      placeholder?: string;
      min?: number;
      max?: number;
    }
  | {
      kind: "media";
      path: string;
      label: string;
      placeholder?: string;
      cropPreset?: MediaCropPreset;
    }
  | {
      kind: "select";
      path: string;
      label: string;
      optionSetKey?: string;
      options?: SelectOption[];
    }
  | {
      kind: "multiselect";
      path: string;
      label: string;
      optionSetKey: string;
    }
  | {
      kind: "string-array";
      path: string;
      label: string;
      itemLabel?: string;
      addLabel?: string;
      placeholder?: string;
    }
  | {
      kind: "array";
      path: string;
      label: string;
      itemLabel?: string;
      addLabel?: string;
      sortOrderField?: string;
      defaultItem: Record<string, unknown>;
      fields: CollectionField[];
    }
  | {
      kind: "content-blocks";
      path: string;
      label: string;
      blockTypes: ContentBlockType[];
    };

export type CollectionSection = {
  title: string;
  fields: CollectionField[];
};

export type CollectionFilterDefinition = {
  path: string;
  label: string;
  optionSetKey: string;
  isArray?: boolean;
};

export type CollectionDefinition = {
  key: CollectionKey;
  variantKey: VariantKey;
  label: string;
  pluralLabel: string;
  eyebrow: string;
  listPath: string;
  createPath: string;
  publicBasePath: string;
  statuses: PublishStatus[];
  hasExpiry: boolean;
  hasStartAt: boolean;
  thumbnailPath: string;
  heroPath?: string;
  descriptionPath: string;
  optionFilters: CollectionFilterDefinition[];
  listInfoPaths: string[];
  defaultData: Record<string, unknown>;
  sections: CollectionSection[];
};

const enabledSortFields = {
  is_enabled: true,
  sort_order: 0,
};

const titleDescItem = {
  title: "",
  description: "",
  ...enabledSortFields,
};

const faqItem = {
  question: "",
  answer: "",
  ...enabledSortFields,
};

const baseIdentity = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  short_description: "",
  overview: "",
  thumbnail_image_id: "",
  hero_image_id: "",
  status: "DRAFT",
  is_featured: false,
  sort_order: 0,
};

const ctaWhatsapp = {
  primary_cta_label: "",
  whatsapp_message_template: "",
};

const ctaLine = {
  primary_cta_label: "",
  line_message_template: "",
};

const titleDescFields: CollectionField[] = [
  { kind: "text", path: "title", label: "Title" },
  { kind: "textarea", path: "description", label: "Description" },
  { kind: "switch", path: "is_enabled", label: "Enabled" },
];

const faqFields: CollectionField[] = [
  { kind: "text", path: "question", label: "Question" },
  { kind: "textarea", path: "answer", label: "Answer" },
  { kind: "switch", path: "is_enabled", label: "Enabled" },
];

const identityFields: CollectionField[] = [
  { kind: "text", path: "title", label: "Title" },
  { kind: "text", path: "slug", label: "Slug" },
  { kind: "text", path: "subtitle", label: "Subtitle" },
  { kind: "textarea", path: "excerpt", label: "Excerpt" },
  { kind: "textarea", path: "short_description", label: "Short description" },
  { kind: "textarea", path: "overview", label: "Overview" },
];

const mediaFields: CollectionField[] = [
  {
    kind: "media",
    path: "thumbnail_image_id",
    label: "Thumbnail image",
    cropPreset: "thumbnail",
  },
  { kind: "media", path: "hero_image_id", label: "Hero image", cropPreset: "hero" },
];

const whatsappCtaFields: CollectionField[] = [
  { kind: "text", path: "primary_cta_label", label: "CTA label" },
  {
    kind: "textarea",
    path: "whatsapp_message_template",
    label: "WhatsApp message template",
  },
];

const lineCtaFields: CollectionField[] = [
  { kind: "text", path: "primary_cta_label", label: "Primary CTA label" },
  {
    kind: "textarea",
    path: "line_message_template",
    label: "LINE message template",
  },
  { kind: "text", path: "secondary_cta_label", label: "Secondary CTA label" },
  {
    kind: "text",
    path: "secondary_document_url",
    label: "Secondary document URL",
    placeholder: "https://...",
  },
];

const relatedSourceOptions = [
  { value: "same_category", label: "Same category" },
  { value: "same_tags", label: "Same tags" },
  { value: "manual", label: "Manual" },
];

export const COLLECTION_DEFINITIONS: Record<CollectionKey, CollectionDefinition> = {
  program: {
    key: "program",
    variantKey: "indonesia",
    label: "Program",
    pluralLabel: "Programs",
    eyebrow: "Indonesia / Collections",
    listPath: "/dashboard/indonesia/collections/program",
    createPath: "/dashboard/indonesia/collections/program/new",
    publicBasePath: "/program",
    statuses: ["DRAFT", "PUBLISHED"],
    hasExpiry: false,
    hasStartAt: false,
    thumbnailPath: "thumbnail_image_id",
    heroPath: "hero_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "program_type_option_id", label: "Program type", optionSetKey: "program_type" },
      { path: "gender_option_id", label: "Gender", optionSetKey: "gender" },
      { path: "education_level_option_id", label: "Education", optionSetKey: "education_level" },
      { path: "language_level_option_id", label: "Language", optionSetKey: "language_level" },
    ],
    listInfoPaths: ["duration_label", "capacity_label", "highlight_label"],
    defaultData: {
      ...baseIdentity,
      ...ctaWhatsapp,
      program_type_option_id: "",
      location_option_id: "",
      gender_option_id: "",
      min_age: 0,
      max_age: 0,
      education_level_option_id: "",
      language_level_option_id: "",
      duration_label: "",
      capacity_label: "",
      contract_label: "",
      salary_range_label: "",
      target_language_label: "",
      visa_path_label: "",
      highlight_label: "",
      why_choose_items: [],
      curriculum_items: [],
      timeline_items: [],
      requirements: [],
      benefits: [],
      cost_items: [],
      career_opportunity_items: [],
      legality_partner_items: [],
      testimonials: [],
      faqs: [],
      brochure_file_id: "",
      brochure_enabled: false,
    },
    sections: [
      { title: "Identity", fields: identityFields },
      { title: "Media", fields: mediaFields },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "program_type_option_id", label: "Program type", optionSetKey: "program_type" },
          { kind: "text", path: "location_option_id", label: "Location option ID" },
          { kind: "select", path: "gender_option_id", label: "Gender", optionSetKey: "gender" },
          { kind: "number", path: "min_age", label: "Minimum age", min: 0, max: 100 },
          { kind: "number", path: "max_age", label: "Maximum age", min: 0, max: 100 },
          { kind: "select", path: "education_level_option_id", label: "Education level", optionSetKey: "education_level" },
          { kind: "select", path: "language_level_option_id", label: "Language level", optionSetKey: "language_level" },
        ],
      },
      {
        title: "Card info",
        fields: [
          { kind: "text", path: "duration_label", label: "Duration label" },
          { kind: "text", path: "capacity_label", label: "Capacity label" },
          { kind: "text", path: "contract_label", label: "Contract label" },
          { kind: "text", path: "salary_range_label", label: "Salary range label" },
          { kind: "text", path: "target_language_label", label: "Target language label" },
          { kind: "text", path: "visa_path_label", label: "Visa path label" },
          { kind: "text", path: "highlight_label", label: "Highlight label" },
        ],
      },
      {
        title: "Detail content",
        fields: [
          { kind: "string-array", path: "requirements", label: "Requirements", itemLabel: "Requirement" },
          { kind: "string-array", path: "benefits", label: "Benefits", itemLabel: "Benefit" },
          { kind: "array", path: "why_choose_items", label: "Why choose items", itemLabel: "Item", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "curriculum_items", label: "Curriculum items", itemLabel: "Curriculum", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "timeline_items", label: "Timeline items", itemLabel: "Step", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "cost_items", label: "Cost items", itemLabel: "Cost", defaultItem: { title: "", amount_label: "", ...enabledSortFields }, sortOrderField: "sort_order", fields: [
            { kind: "text", path: "title", label: "Title" },
            { kind: "text", path: "amount_label", label: "Amount label" },
            { kind: "switch", path: "is_enabled", label: "Enabled" },
          ] },
          { kind: "array", path: "career_opportunity_items", label: "Career opportunities", itemLabel: "Opportunity", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "legality_partner_items", label: "Legality partners", itemLabel: "Partner", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "testimonials", label: "Testimonials", itemLabel: "Testimonial", defaultItem: { name: "", role_or_program: "", quote: "", image_id: "", ...enabledSortFields }, sortOrderField: "sort_order", fields: [
            { kind: "text", path: "name", label: "Name" },
            { kind: "text", path: "role_or_program", label: "Role/program" },
            { kind: "textarea", path: "quote", label: "Quote" },
            { kind: "media", path: "image_id", label: "Image", cropPreset: "square" },
            { kind: "switch", path: "is_enabled", label: "Enabled" },
          ] },
          { kind: "array", path: "faqs", label: "FAQ", itemLabel: "FAQ", defaultItem: faqItem, sortOrderField: "sort_order", fields: faqFields },
        ],
      },
      {
        title: "CTA",
        fields: [
          ...whatsappCtaFields,
          { kind: "document", path: "brochure_file_id", label: "Brochure file" },
          { kind: "switch", path: "brochure_enabled", label: "Brochure enabled" },
        ],
      },
    ],
  },
  job: {
    key: "job",
    variantKey: "indonesia",
    label: "Job",
    pluralLabel: "Jobs",
    eyebrow: "Indonesia / Collections",
    listPath: "/dashboard/indonesia/collections/job",
    createPath: "/dashboard/indonesia/collections/job/new",
    publicBasePath: "/job",
    statuses: ["DRAFT", "PUBLISHED", "CLOSED", "FILLED"],
    hasExpiry: true,
    hasStartAt: false,
    thumbnailPath: "thumbnail_image_id",
    heroPath: "hero_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "job_type_option_id", label: "Job type", optionSetKey: "job_type" },
      { path: "job_field_option_id", label: "Job field", optionSetKey: "job_field" },
      { path: "gender_option_id", label: "Gender", optionSetKey: "gender" },
      { path: "language_level_option_id", label: "Language", optionSetKey: "language_level" },
      { path: "education_level_option_id", label: "Education", optionSetKey: "education_level" },
    ],
    listInfoPaths: ["location_label", "salary_label", "salary_range_label", "deadline_label"],
    defaultData: {
      ...baseIdentity,
      ...ctaWhatsapp,
      status: "DRAFT",
      published_at: "",
      expired_at: "",
      job_type_option_id: "",
      location_option_id: "",
      job_field_option_id: "",
      gender_option_id: "",
      language_level_option_id: "",
      education_level_option_id: "",
      related_program_id: "",
      min_age: 0,
      max_age: 0,
      certificate_required_label: "",
      experience_required_label: "",
      ex_japan_required: false,
      required_documents: [],
      location_label: "",
      salary_label: "",
      salary_range_label: "",
      contract_label: "",
      deadline_label: "",
      quota_label: "",
      overview_items: [],
      job_description: "",
      responsibilities: [],
      requirements: [],
      benefits: [],
      benefit_items: [],
      qualification_items: [],
      recruitment_steps: [],
      gallery_media_ids: [],
      faqs: [],
    },
    sections: [
      { title: "Identity", fields: identityFields },
      { title: "Media", fields: mediaFields },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "job_type_option_id", label: "Job type", optionSetKey: "job_type" },
          { kind: "text", path: "location_option_id", label: "Location option ID" },
          { kind: "select", path: "job_field_option_id", label: "Job field", optionSetKey: "job_field" },
          { kind: "select", path: "gender_option_id", label: "Gender", optionSetKey: "gender" },
          { kind: "select", path: "language_level_option_id", label: "Language level", optionSetKey: "language_level" },
          { kind: "select", path: "education_level_option_id", label: "Education level", optionSetKey: "education_level" },
          { kind: "text", path: "related_program_id", label: "Related program ID" },
        ],
      },
      {
        title: "Dates",
        fields: [{ kind: "date", path: "expired_at", label: "Expired at" }],
      },
      {
        title: "Candidate requirements",
        fields: [
          { kind: "number", path: "min_age", label: "Minimum age", min: 0, max: 100 },
          { kind: "number", path: "max_age", label: "Maximum age", min: 0, max: 100 },
          { kind: "text", path: "certificate_required_label", label: "Certificate required label" },
          { kind: "text", path: "experience_required_label", label: "Experience required label" },
          { kind: "switch", path: "ex_japan_required", label: "Ex-Japan required" },
          { kind: "string-array", path: "required_documents", label: "Required documents", itemLabel: "Document" },
        ],
      },
      {
        title: "Card info",
        fields: [
          { kind: "text", path: "location_label", label: "Location label" },
          { kind: "text", path: "salary_label", label: "Salary label" },
          { kind: "text", path: "salary_range_label", label: "Salary range label" },
          { kind: "text", path: "contract_label", label: "Contract label" },
          { kind: "text", path: "deadline_label", label: "Deadline label" },
          { kind: "text", path: "quota_label", label: "Quota label" },
        ],
      },
      {
        title: "Detail content",
        fields: [
          { kind: "textarea", path: "job_description", label: "Job description" },
          { kind: "string-array", path: "responsibilities", label: "Responsibilities", itemLabel: "Responsibility" },
          { kind: "string-array", path: "requirements", label: "Requirements", itemLabel: "Requirement" },
          { kind: "string-array", path: "benefits", label: "Benefits", itemLabel: "Benefit" },
          { kind: "array", path: "overview_items", label: "Overview items", itemLabel: "Item", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "benefit_items", label: "Benefit items", itemLabel: "Benefit", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "qualification_items", label: "Qualification items", itemLabel: "Qualification", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "recruitment_steps", label: "Recruitment steps", itemLabel: "Step", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "string-array", path: "gallery_media_ids", label: "Gallery media IDs", itemLabel: "Media ID" },
          { kind: "array", path: "faqs", label: "FAQ", itemLabel: "FAQ", defaultItem: faqItem, sortOrderField: "sort_order", fields: faqFields },
        ],
      },
      { title: "CTA", fields: whatsappCtaFields },
    ],
  },
  offer: {
    key: "offer",
    variantKey: "indonesia",
    label: "Offer",
    pluralLabel: "Offers",
    eyebrow: "Indonesia / Collections",
    listPath: "/dashboard/indonesia/collections/offer",
    createPath: "/dashboard/indonesia/collections/offer/new",
    publicBasePath: "/offer",
    statuses: ["DRAFT", "PUBLISHED", "CLOSED"],
    hasExpiry: true,
    hasStartAt: true,
    thumbnailPath: "thumbnail_image_id",
    heroPath: "hero_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "offer_type_option_id", label: "Offer type", optionSetKey: "offer_type" },
      { path: "target_audience_option_id", label: "Target audience", optionSetKey: "target_audience" },
    ],
    listInfoPaths: ["start_at", "expired_at", "price_label", "urgency_label"],
    defaultData: {
      ...baseIdentity,
      ...ctaWhatsapp,
      status: "DRAFT",
      start_at: "",
      expired_at: "",
      offer_type_option_id: "",
      target_audience_option_id: "",
      schedule_label: "",
      duration_label: "",
      format_label: "",
      quota_label: "",
      price_label: "",
      original_price_label: "",
      urgency_label: "",
      benefit_items: [],
      detail_description: "",
      detail_checklist: [],
      terms_conditions: "",
      bonus_items: [],
      suitable_for_items: [],
      faqs: [],
    },
    sections: [
      { title: "Identity", fields: identityFields },
      { title: "Media", fields: mediaFields },
      {
        title: "Dates",
        fields: [
          { kind: "date", path: "start_at", label: "Start at" },
          { kind: "date", path: "expired_at", label: "Expired at" },
        ],
      },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "offer_type_option_id", label: "Offer type", optionSetKey: "offer_type" },
          { kind: "select", path: "target_audience_option_id", label: "Target audience", optionSetKey: "target_audience" },
        ],
      },
      {
        title: "Campaign info",
        fields: [
          { kind: "text", path: "schedule_label", label: "Schedule label" },
          { kind: "text", path: "duration_label", label: "Duration label" },
          { kind: "text", path: "format_label", label: "Format label" },
          { kind: "text", path: "quota_label", label: "Quota label" },
          { kind: "text", path: "price_label", label: "Price label" },
          { kind: "text", path: "original_price_label", label: "Original price label" },
          { kind: "text", path: "urgency_label", label: "Urgency label" },
        ],
      },
      {
        title: "Detail content",
        fields: [
          { kind: "textarea", path: "detail_description", label: "Detail description" },
          { kind: "string-array", path: "detail_checklist", label: "Detail checklist", itemLabel: "Checklist" },
          { kind: "textarea", path: "terms_conditions", label: "Terms conditions" },
          { kind: "array", path: "benefit_items", label: "Benefit items", itemLabel: "Benefit", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "bonus_items", label: "Bonus items", itemLabel: "Bonus", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "suitable_for_items", label: "Suitable for", itemLabel: "Audience", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "faqs", label: "FAQ", itemLabel: "FAQ", defaultItem: faqItem, sortOrderField: "sort_order", fields: faqFields },
        ],
      },
      { title: "CTA", fields: whatsappCtaFields },
    ],
  },
  blog: {
    key: "blog",
    variantKey: "indonesia",
    label: "Blog",
    pluralLabel: "Blogs",
    eyebrow: "Indonesia / Collections",
    listPath: "/dashboard/indonesia/collections/blog",
    createPath: "/dashboard/indonesia/collections/blog/new",
    publicBasePath: "/blog",
    statuses: ["DRAFT", "PUBLISHED"],
    hasExpiry: false,
    hasStartAt: false,
    thumbnailPath: "cover_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "category_option_id", label: "Category", optionSetKey: "blog_category" },
      { path: "tag_option_ids", label: "Tag", optionSetKey: "blog_tag", isArray: true },
    ],
    listInfoPaths: ["reading_time_label", "author_name"],
    defaultData: {
      title: "",
      slug: "",
      subtitle: "",
      excerpt: "",
      cover_image_id: "",
      status: "DRAFT",
      is_featured: false,
      published_at: "",
      reading_time_label: "",
      sort_order: 0,
      category_option_id: "",
      tag_option_ids: [],
      author_name: "",
      author_title: "",
      author_bio: "",
      author_image_id: "",
      content_blocks: [],
      related_source: "same_category",
      manual_blog_ids: [],
      related_max_items: 3,
    },
    sections: [
      {
        title: "Identity",
        fields: [
          { kind: "text", path: "title", label: "Title" },
          { kind: "text", path: "slug", label: "Slug" },
          { kind: "text", path: "subtitle", label: "Subtitle" },
          { kind: "textarea", path: "excerpt", label: "Excerpt" },
          {
            kind: "media",
            path: "cover_image_id",
            label: "Cover image",
            cropPreset: "thumbnail",
          },
          { kind: "text", path: "reading_time_label", label: "Reading time label" },
        ],
      },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "category_option_id", label: "Category", optionSetKey: "blog_category" },
          { kind: "multiselect", path: "tag_option_ids", label: "Tags", optionSetKey: "blog_tag" },
        ],
      },
      {
        title: "Author",
        fields: [
          { kind: "text", path: "author_name", label: "Author name" },
          { kind: "text", path: "author_title", label: "Author title" },
          { kind: "textarea", path: "author_bio", label: "Author bio" },
          { kind: "media", path: "author_image_id", label: "Author image", cropPreset: "square" },
        ],
      },
      {
        title: "Content blocks",
        fields: [
          {
            kind: "content-blocks",
            path: "content_blocks",
            label: "Content blocks",
            blockTypes: ["heading", "paragraph", "quote", "image", "youtube_embed", "offer_callout", "whatsapp_cta"],
          },
        ],
      },
      {
        title: "Related articles",
        fields: [
          { kind: "select", path: "related_source", label: "Source", options: relatedSourceOptions },
          { kind: "string-array", path: "manual_blog_ids", label: "Manual blog IDs", itemLabel: "Blog ID" },
          { kind: "number", path: "related_max_items", label: "Max items", min: 1, max: 10 },
        ],
      },
    ],
  },
  karir: {
    key: "karir",
    variantKey: "indonesia",
    label: "Karir",
    pluralLabel: "Karir",
    eyebrow: "Indonesia / Collections",
    listPath: "/dashboard/indonesia/collections/karir",
    createPath: "/dashboard/indonesia/collections/karir/new",
    publicBasePath: "/karir",
    statuses: ["DRAFT", "PUBLISHED", "CLOSED", "FILLED"],
    hasExpiry: true,
    hasStartAt: false,
    thumbnailPath: "thumbnail_image_id",
    heroPath: "hero_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "department_option_id", label: "Department", optionSetKey: "career_department" },
      { path: "employment_type_option_id", label: "Employment type", optionSetKey: "career_employment_type" },
      { path: "work_arrangement_option_id", label: "Work arrangement", optionSetKey: "career_work_arrangement" },
    ],
    listInfoPaths: ["location_label", "salary_label", "deadline_label"],
    defaultData: {
      ...baseIdentity,
      ...ctaWhatsapp,
      status: "DRAFT",
      published_at: "",
      expired_at: "",
      karir_type_option_id: "",
      location_option_id: "",
      department_option_id: "",
      employment_type_option_id: "",
      work_arrangement_option_id: "",
      location_label: "",
      salary_label: "",
      experience_label: "",
      education_label: "",
      deadline_label: "",
      overview_items: [],
      role_description: "",
      responsibilities: [],
      requirements: [],
      benefits: [],
      recruitment_steps: [],
      faqs: [],
    },
    sections: [
      { title: "Identity", fields: identityFields },
      { title: "Media", fields: mediaFields },
      {
        title: "Dates",
        fields: [{ kind: "date", path: "expired_at", label: "Expired at" }],
      },
      {
        title: "Classification",
        fields: [
          { kind: "text", path: "karir_type_option_id", label: "Karir type option ID" },
          { kind: "text", path: "location_option_id", label: "Location option ID" },
          { kind: "select", path: "department_option_id", label: "Department", optionSetKey: "career_department" },
          { kind: "select", path: "employment_type_option_id", label: "Employment type", optionSetKey: "career_employment_type" },
          { kind: "select", path: "work_arrangement_option_id", label: "Work arrangement", optionSetKey: "career_work_arrangement" },
        ],
      },
      {
        title: "Card info",
        fields: [
          { kind: "text", path: "location_label", label: "Location label" },
          { kind: "text", path: "salary_label", label: "Salary label" },
          { kind: "text", path: "experience_label", label: "Experience label" },
          { kind: "text", path: "education_label", label: "Education label" },
          { kind: "text", path: "deadline_label", label: "Deadline label" },
        ],
      },
      {
        title: "Detail content",
        fields: [
          { kind: "textarea", path: "role_description", label: "Role description" },
          { kind: "string-array", path: "responsibilities", label: "Responsibilities", itemLabel: "Responsibility" },
          { kind: "string-array", path: "requirements", label: "Requirements", itemLabel: "Requirement" },
          { kind: "string-array", path: "benefits", label: "Benefits", itemLabel: "Benefit" },
          { kind: "array", path: "overview_items", label: "Overview items", itemLabel: "Item", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "recruitment_steps", label: "Recruitment steps", itemLabel: "Step", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "faqs", label: "FAQ", itemLabel: "FAQ", defaultItem: faqItem, sortOrderField: "sort_order", fields: faqFields },
        ],
      },
      { title: "CTA", fields: whatsappCtaFields },
    ],
  },
  news: {
    key: "news",
    variantKey: "japan",
    label: "News",
    pluralLabel: "News",
    eyebrow: "Japan / Collections",
    listPath: "/dashboard/japan/collections/news",
    createPath: "/dashboard/japan/collections/news/new",
    publicBasePath: "/news",
    statuses: ["DRAFT", "PUBLISHED"],
    hasExpiry: false,
    hasStartAt: false,
    thumbnailPath: "cover_image_id",
    descriptionPath: "excerpt",
    optionFilters: [
      { path: "category_option_id", label: "Category", optionSetKey: "japan_news_category" },
      { path: "tag_option_ids", label: "Tag", optionSetKey: "japan_news_tag", isArray: true },
    ],
    listInfoPaths: ["reading_time_label", "author_name"],
    defaultData: {
      title: "",
      slug: "",
      subtitle: "",
      excerpt: "",
      cover_image_id: "",
      status: "DRAFT",
      is_featured: false,
      published_at: "",
      reading_time_label: "",
      sort_order: 0,
      category_option_id: "",
      tag_option_ids: [],
      author_name: "",
      author_title: "",
      author_image_id: "",
      content_blocks: [],
      related_source: "same_category",
      manual_news_ids: [],
      related_articles: [],
      related_max_items: 3,
    },
    sections: [
      {
        title: "Identity",
        fields: [
          { kind: "text", path: "title", label: "Title" },
          { kind: "text", path: "slug", label: "Slug" },
          { kind: "text", path: "subtitle", label: "Subtitle" },
          { kind: "textarea", path: "excerpt", label: "Excerpt" },
          {
            kind: "media",
            path: "cover_image_id",
            label: "Cover image",
            cropPreset: "thumbnail",
          },
          { kind: "text", path: "reading_time_label", label: "Reading time label" },
        ],
      },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "category_option_id", label: "Category", optionSetKey: "japan_news_category" },
          { kind: "multiselect", path: "tag_option_ids", label: "Tags", optionSetKey: "japan_news_tag" },
        ],
      },
      {
        title: "Author",
        fields: [
          { kind: "text", path: "author_name", label: "Author name" },
          { kind: "text", path: "author_title", label: "Author title" },
          { kind: "media", path: "author_image_id", label: "Author image", cropPreset: "square" },
        ],
      },
      {
        title: "Content blocks",
        fields: [
          {
            kind: "content-blocks",
            path: "content_blocks",
            label: "Content blocks",
            blockTypes: ["heading", "paragraph", "quote", "image", "youtube_embed", "line_cta", "sector_callout"],
          },
        ],
      },
      {
        title: "Related articles",
        fields: [
          { kind: "select", path: "related_source", label: "Source", options: relatedSourceOptions },
          { kind: "string-array", path: "manual_news_ids", label: "Manual news IDs", itemLabel: "News ID" },
          { kind: "string-array", path: "related_articles", label: "Related articles", itemLabel: "Article ID" },
          { kind: "number", path: "related_max_items", label: "Max items", min: 1, max: 10 },
        ],
      },
    ],
  },
  sector: {
    key: "sector",
    variantKey: "japan",
    label: "Sector",
    pluralLabel: "Sectors",
    eyebrow: "Japan / Collections",
    listPath: "/dashboard/japan/collections/sector",
    createPath: "/dashboard/japan/collections/sector/new",
    publicBasePath: "/sectors",
    statuses: ["DRAFT", "PUBLISHED"],
    hasExpiry: false,
    hasStartAt: false,
    thumbnailPath: "thumbnail_image_id",
    heroPath: "hero_image_id",
    descriptionPath: "short_description",
    optionFilters: [
      { path: "sector_category_option_id", label: "Sector category", optionSetKey: "japan_sector_category" },
    ],
    listInfoPaths: ["sector_category_option_id", "short_description"],
    defaultData: {
      ...baseIdentity,
      ...ctaLine,
      excerpt: "",
      short_description: "",
      status: "DRAFT",
      sector_category_option_id: "",
      suitability_items: [],
      example_positions: [],
      training_alignment_items: [],
      candidate_requirements: [],
      process_items: [],
      faqs: [],
      secondary_cta_label: "",
      secondary_document_url: "",
    },
    sections: [
      {
        title: "Identity",
        fields: [
          { kind: "text", path: "title", label: "Title" },
          { kind: "text", path: "slug", label: "Slug" },
          { kind: "text", path: "subtitle", label: "Subtitle" },
          { kind: "textarea", path: "short_description", label: "Short description" },
          { kind: "textarea", path: "overview", label: "Overview" },
        ],
      },
      { title: "Media", fields: mediaFields },
      {
        title: "Classification",
        fields: [
          { kind: "select", path: "sector_category_option_id", label: "Sector category", optionSetKey: "japan_sector_category" },
        ],
      },
      {
        title: "Sector content",
        fields: [
          { kind: "array", path: "suitability_items", label: "Suitability items", itemLabel: "Item", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "example_positions", label: "Example positions", itemLabel: "Position", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "training_alignment_items", label: "Training alignment items", itemLabel: "Alignment", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "string-array", path: "candidate_requirements", label: "Candidate requirements", itemLabel: "Requirement" },
          { kind: "array", path: "process_items", label: "Process items", itemLabel: "Process", defaultItem: titleDescItem, sortOrderField: "sort_order", fields: titleDescFields },
          { kind: "array", path: "faqs", label: "FAQ", itemLabel: "FAQ", defaultItem: faqItem, sortOrderField: "sort_order", fields: faqFields },
        ],
      },
      { title: "CTA", fields: lineCtaFields },
    ],
  },
};

export const ALL_COLLECTION_KEYS = Object.keys(COLLECTION_DEFINITIONS) as CollectionKey[];

export function getCollectionDefinition(collectionKey: CollectionKey) {
  return COLLECTION_DEFINITIONS[collectionKey];
}

export function isCollectionKey(value: string): value is CollectionKey {
  return value in COLLECTION_DEFINITIONS;
}

export function getVariantCollectionKeys(variantKey: VariantKey) {
  return (variantKey === "indonesia" ? COLLECTIONS_INDONESIA : COLLECTIONS_JAPAN).map(
    (collection) => collection.key,
  );
}

export function isAllowedCollectionKey(
  variantKey: VariantKey,
  collectionKey: string,
): collectionKey is CollectionKey {
  return getVariantCollectionKeys(variantKey).some((key) => key === collectionKey);
}

export function getPublicItemPath(collectionKey: CollectionKey, slug: string) {
  const definition = getCollectionDefinition(collectionKey);
  const safeSlug = slug.trim();

  return `${definition.publicBasePath}/${safeSlug}`;
}

export function findCollectionByPublicPath(
  variantKey: VariantKey,
  publicPath: string,
) {
  const normalizedPath = normalizePublicPath(publicPath);
  const definitions = Object.values(COLLECTION_DEFINITIONS).filter(
    (definition) => definition.variantKey === variantKey,
  );

  for (const definition of definitions) {
    const basePath = normalizePublicPath(definition.publicBasePath);

    if (normalizedPath.startsWith(`${basePath}/`)) {
      return {
        definition,
        slug: normalizedPath.slice(basePath.length + 1),
      };
    }
  }

  return null;
}

function normalizePublicPath(value: string) {
  const trimmedValue = value.trim();
  const path = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
  const withoutTrailingSlash = path.replace(/\/+$/, "");

  return withoutTrailingSlash === "" ? "/" : withoutTrailingSlash;
}
