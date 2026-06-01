import type { PageKey } from "@/lib/constants";
import type { VariantKey } from "@/types";

export type PageEditorData = Record<string, unknown>;
export type PageSectionClassification = "required" | "recommended" | "optional";

export type PageEditorFieldOption = {
  value: string;
  label: string;
};

type BaseField = {
  path: string;
  label: string;
  placeholder?: string;
};

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
      kind: "media" | "document" | "icon";
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

const homepageOfferSourceOptions = [
  { value: "active_featured_offer", label: "Active featured offer" },
  { value: "manual", label: "Manual" },
];

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
  { kind: "media", path: "media_id", label: "Media" },
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
  { kind: "media", path: "image_id", label: "Image" },
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

const emptyBasicHero = {
  headline: "",
  subheadline: "",
  image_id: "",
  primary_cta_label: "",
  primary_cta_whatsapp_message: "",
};

const emptyMediaHero = {
  media_type: "image",
  media_id: "",
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
    label: "Media type",
    options: japanMediaTypeOptions,
  },
  { kind: "media", path: "media_id", label: "Media" },
  {
    kind: "media-array",
    path: "slider_media_ids",
    label: "Slider media",
    addLabel: "Add slide",
    itemLabel: "Slide",
    defaultItem: "",
  },
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "subheadline", label: "Subheadline" },
  { kind: "text", path: "eyebrow_label", label: "Eyebrow label" },
];

const japanBasicHeroFields: PageEditorField[] = [
  {
    kind: "select",
    path: "media_type",
    label: "Media type",
    options: japanBasicMediaTypeOptions,
  },
  { kind: "media", path: "media_id", label: "Media" },
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "subheadline", label: "Subheadline" },
  { kind: "text", path: "eyebrow_label", label: "Eyebrow label" },
];

const japanFinalCtaFields: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "description", label: "Description" },
  { kind: "text", path: "primary_cta_label", label: "Primary CTA label" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Primary LINE message template",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Secondary CTA label",
  },
  {
    kind: "text",
    path: "secondary_href",
    label: "Secondary CTA href",
    inputType: "url",
  },
];

const japanFinalCtaFieldsWithDoc: PageEditorField[] = [
  { kind: "text", path: "headline", label: "Headline" },
  { kind: "textarea", path: "description", label: "Description" },
  { kind: "text", path: "primary_cta_label", label: "Primary CTA label" },
  {
    kind: "textarea",
    path: "primary_line_message_template",
    label: "Primary LINE message template",
  },
  {
    kind: "text",
    path: "secondary_cta_label",
    label: "Secondary CTA label",
  },
  {
    kind: "text",
    path: "secondary_document_url",
    label: "Secondary document URL",
    inputType: "url",
  },
];

const japanSortableFields: PageEditorField[] = [
  { kind: "switch", path: "is_enabled", label: "Enabled" },
  { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
];

const japanIconTitleDescSortFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Icon" },
  { kind: "text", path: "title", label: "Title" },
  { kind: "textarea", path: "description", label: "Description" },
  ...japanSortableFields,
];

const japanProofStatFields: PageEditorField[] = [
  { kind: "text", path: "value", label: "Value" },
  { kind: "text", path: "label", label: "Label" },
  ...japanSortableFields,
];

const japanStatFields: PageEditorField[] = [
  { kind: "icon", path: "icon_key", label: "Icon" },
  ...japanProofStatFields,
];

const japanTimelineFields: PageEditorField[] = [
  { kind: "text", path: "year_label", label: "Year label" },
  { kind: "text", path: "title", label: "Title" },
  { kind: "textarea", path: "description", label: "Description" },
  ...japanSortableFields,
];

const japanEmptyHero = {
  media_type: "image",
  media_id: "",
  headline: "",
  subheadline: "",
  eyebrow_label: "",
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

const japanEmptyIconTitleDesc = {
  icon_key: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyProofStat = {
  value: "",
  label: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyStat = {
  icon_key: "",
  ...japanEmptyProofStat,
};

const japanEmptyTimeline = {
  year_label: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanEmptyStep = {
  step_label: "",
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

const japanStepFields: PageEditorField[] = [
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


export const PAGE_EDITOR_DEFINITIONS = {
  "indonesia.homepage": {
    variantKey: "indonesia",
    pageKey: "homepage",
    title: "Homepage",
    publicPath: "/",
    defaultData: {
      hero: emptyMediaHero,
      offer_section: {
        is_enabled: false,
        source: "active_featured_offer",
        manual_offer_id: "",
        fallback_badge_label: "",
        fallback_headline: "",
        fallback_description: "",
        fallback_image_id: "",
      },
      stats: [statDefault(0), statDefault(1), statDefault(2)],
      trust_cards: [
        trustCardDefault(0),
        trustCardDefault(1),
        trustCardDefault(2),
      ],
      featured_programs: {
        source: "featured",
        manual_program_ids: [],
        max_items: 3,
      },
      latest_jobs: {
        source: "latest_active",
        max_items: 5,
      },
      steps: [stepDefault(0), stepDefault(1), stepDefault(2), stepDefault(3)],
      faqs: [faqDefault(0), faqDefault(1), faqDefault(2)],
      testimonials: [],
      latest_blogs: {
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
          },
          {
            kind: "text",
            path: "offer_section.manual_offer_id",
            label: "Manual offer ID",
          },
          {
            kind: "text",
            path: "offer_section.fallback_badge_label",
            label: "Fallback badge label",
          },
          {
            kind: "text",
            path: "offer_section.fallback_headline",
            label: "Fallback headline",
          },
          {
            kind: "textarea",
            path: "offer_section.fallback_description",
            label: "Fallback description",
          },
          {
            kind: "media",
            path: "offer_section.fallback_image_id",
            label: "Fallback image",
          },
        ],
      },
      {
        key: "stats",
        title: "Stats",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
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
        title: "Stats",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
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
        title: "Final CTA",
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
      story: {
        badge_label: "",
        headline: "",
        body: "",
        image_id: "",
      },
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
        title: "Proof Stats",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Proof stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
            defaultItem: statDefault(0),
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "value", label: "Value" },
              { kind: "text", path: "label", label: "Label" },
              ...sortableFields,
            ],
          },
        ],
      },
      {
        key: "story",
        title: "Story",
        classification: "required",
        fields: [
          { kind: "text", path: "story.badge_label", label: "Badge label" },
          { kind: "text", path: "story.headline", label: "Headline" },
          { kind: "textarea", path: "story.body", label: "Body" },
          { kind: "media", path: "story.image_id", label: "Image" },
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
              bio: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "text", path: "role", label: "Role" },
              { kind: "textarea", path: "bio", label: "Bio" },
              { kind: "media", path: "image_id", label: "Image" },
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
              title: "",
              description: "",
              document_label: "",
              document_url: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
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
    title: "Homepage",
    publicPath: "/",
    defaultData: {
      hero: japanEmptyHomepageHero,
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
      {
        key: "stats",
        title: "Stats",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "stats",
            label: "Stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
            defaultItem: japanEmptyStat,
            sortOrderField: "sort_order",
            fields: japanStatFields,
          },
        ],
      },
      {
        key: "achievements",
        title: "Achievements",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "achievements",
            label: "Achievements",
            itemLabel: "Achievement",
            addLabel: "Add achievement",
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
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "text", path: "document_label", label: "Document label" },
              { kind: "text", path: "document_url", label: "Document URL", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "latest_news",
        title: "Latest News",
        classification: "recommended",
        fields: [
          {
            kind: "select",
            path: "latest_news.source",
            label: "Source",
            options: [{ value: "latest_published", label: "Latest published" }],
          },
          {
            kind: "number",
            path: "latest_news.max_items",
            label: "Max items",
            min: 1,
            max: 4,
          },
        ],
      },
      {
        key: "why_indonesia_section",
        title: "Why Indonesia Section",
        classification: "recommended",
        fields: [
          { kind: "media", path: "why_indonesia_section.image_id", label: "Image" },
          { kind: "text", path: "why_indonesia_section.eyebrow_label", label: "Eyebrow label" },
          { kind: "text", path: "why_indonesia_section.headline", label: "Headline" },
          { kind: "textarea", path: "why_indonesia_section.description", label: "Description" },
          {
            kind: "string-array",
            path: "why_indonesia_section.bullet_items",
            label: "Bullet items",
            itemLabel: "Bullet",
            addLabel: "Add bullet",
            defaultItem: "",
          },
          { kind: "text", path: "why_indonesia_section.cta_label", label: "CTA label" },
          {
            kind: "select",
            path: "why_indonesia_section.target_page",
            label: "Target page",
            options: [{ value: "candidate_profile", label: "Candidate Profile" }],
          },
        ],
      },
      {
        key: "why_us_cards",
        title: "Why Us Cards",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "why_us_cards",
            label: "Why Us Cards",
            itemLabel: "Card",
            addLabel: "Add card",
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
                label: "Key",
                options: [
                  { value: "about", label: "About" },
                  { value: "recruitment_network", label: "Recruitment Network" },
                  { value: "sectors", label: "Sectors" },
                  { value: "training_method", label: "Training Method" },
                ],
              },
              { kind: "icon", path: "icon_key", label: "Icon" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "text", path: "href", label: "Href" },
              ...japanSortableFields,
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
              { kind: "text", path: "type_label", label: "Type label" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "text", path: "document_label", label: "Document label" },
              { kind: "text", path: "document_url", label: "Document URL", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
      proof_stats: [],
      story: {
        image_id: "",
        eyebrow_label: "",
        headline: "",
        body: "",
      },
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
      {
        key: "proof_stats",
        title: "Proof Stats",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Proof stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "story",
        title: "Story",
        classification: "required",
        fields: [
          { kind: "media", path: "story.image_id", label: "Image" },
          { kind: "text", path: "story.eyebrow_label", label: "Eyebrow label" },
          { kind: "text", path: "story.headline", label: "Headline" },
          { kind: "textarea", path: "story.body", label: "Body" },
        ],
      },
      {
        key: "timeline",
        title: "Timeline",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "timeline",
            label: "Timeline",
            itemLabel: "Entry",
            addLabel: "Add entry",
            defaultItem: japanEmptyTimeline,
            sortOrderField: "sort_order",
            fields: japanTimelineFields,
          },
        ],
      },
      {
        key: "vision_mission",
        title: "Vision & Mission",
        classification: "required",
        fields: [
          { kind: "text", path: "vision_mission.vision_headline", label: "Vision headline" },
          { kind: "textarea", path: "vision_mission.vision_description", label: "Vision description" },
          { kind: "text", path: "vision_mission.mission_headline", label: "Mission headline" },
          { kind: "textarea", path: "vision_mission.mission_description", label: "Mission description" },
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
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "facilities",
        title: "Facilities",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "facilities",
            label: "Facilities",
            itemLabel: "Facility",
            addLabel: "Add facility",
            defaultItem: {
              title: "",
              description: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "media", path: "image_id", label: "Image" },
              ...japanSortableFields,
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
            itemLabel: "Member",
            addLabel: "Add member",
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
              { kind: "text", path: "name", label: "Name" },
              { kind: "text", path: "role", label: "Role" },
              { kind: "textarea", path: "bio", label: "Bio" },
              { kind: "media", path: "image_id", label: "Image" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "legal_overview",
        title: "Legal Overview",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "legal_overview",
            label: "Legal overview",
            itemLabel: "Legality",
            addLabel: "Add legality",
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
              { kind: "text", path: "type_label", label: "Type label" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "text", path: "document_label", label: "Document label" },
              { kind: "text", path: "document_url", label: "Document URL", inputType: "url" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
      curriculum_download: {
        headline: "",
        description: "",
        file_url: "",
        button_label: "",
        is_enabled: false,
      },
      training_pillars: [],
      training_flow: [],
      curriculum_areas: [],
      evaluation_items: [],
      training_gallery: [],
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
      {
        key: "curriculum_download",
        title: "Curriculum Download",
        classification: "optional",
        fields: [
          { kind: "switch", path: "curriculum_download.is_enabled", label: "Enabled" },
          { kind: "text", path: "curriculum_download.headline", label: "Headline" },
          { kind: "textarea", path: "curriculum_download.description", label: "Description" },
          { kind: "text", path: "curriculum_download.file_url", label: "File URL", inputType: "url" },
          { kind: "text", path: "curriculum_download.button_label", label: "Button label" },
        ],
      },
      {
        key: "training_pillars",
        title: "Training Pillars",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "training_pillars",
            label: "Training pillars",
            itemLabel: "Pillar",
            addLabel: "Add pillar",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "training_flow",
        title: "Training Flow",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "training_flow",
            label: "Training flow",
            itemLabel: "Step",
            addLabel: "Add step",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "curriculum_areas",
        title: "Curriculum Areas",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "curriculum_areas",
            label: "Curriculum areas",
            itemLabel: "Area",
            addLabel: "Add area",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "evaluation_items",
        title: "Evaluation Items",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "evaluation_items",
            label: "Evaluation items",
            itemLabel: "Item",
            addLabel: "Add item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "training_gallery",
        title: "Training Gallery",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "training_gallery",
            label: "Training gallery",
            itemLabel: "Item",
            addLabel: "Add item",
            defaultItem: japanEmptyGalleryItem,
            sortOrderField: "sort_order",
            fields: [
              { kind: "media", path: "media_id", label: "Media" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
      hero: japanEmptyHero,
      proof_stats: [],
      why_indonesia: {
        image_id: "",
        headline: "",
        description: "",
        bullet_items: [],
      },
      candidate_strengths: [],
      supported_pathways: [],
      candidate_examples: [],
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
        fields: japanBasicHeroFields.map((field) => ({
          ...field,
          path: `hero.${field.path}`,
        })),
      },
      {
        key: "proof_stats",
        title: "Proof Stats",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Proof stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "why_indonesia",
        title: "Why Indonesia",
        classification: "required",
        fields: [
          { kind: "media", path: "why_indonesia.image_id", label: "Image" },
          { kind: "text", path: "why_indonesia.headline", label: "Headline" },
          { kind: "textarea", path: "why_indonesia.description", label: "Description" },
          {
            kind: "string-array",
            path: "why_indonesia.bullet_items",
            label: "Bullet items",
            itemLabel: "Bullet",
            addLabel: "Add bullet",
            defaultItem: "",
          },
        ],
      },
      {
        key: "candidate_strengths",
        title: "Candidate Strengths",
        classification: "required",
        fields: [
          {
            kind: "array",
            path: "candidate_strengths",
            label: "Candidate strengths",
            itemLabel: "Strength",
            addLabel: "Add strength",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "supported_pathways",
        title: "Supported Pathways",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "supported_pathways",
            label: "Supported pathways",
            itemLabel: "Pathway",
            addLabel: "Add pathway",
            defaultItem: {
              pathway_label: "",
              title: "",
              description: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "pathway_label", label: "Pathway label" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "candidate_examples",
        title: "Candidate Examples",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "candidate_examples",
            label: "Candidate examples",
            itemLabel: "Example",
            addLabel: "Add example",
            defaultItem: {
              profile_label: "",
              title: "",
              description: "",
              image_id: "",
              sort_order: 0,
              is_enabled: true,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "profile_label", label: "Profile label" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "media", path: "image_id", label: "Image" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "readiness_framework",
        title: "Readiness Framework",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "readiness_framework",
            label: "Readiness framework",
            itemLabel: "Item",
            addLabel: "Add item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "partner_perspective",
        title: "Partner Perspective",
        classification: "optional",
        fields: [
          { kind: "switch", path: "partner_perspective.is_enabled", label: "Enabled" },
          { kind: "textarea", path: "partner_perspective.quote", label: "Quote" },
          { kind: "text", path: "partner_perspective.attribution_label", label: "Attribution label" },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
      hero: japanEmptyHero,
      proof_stats: [],
      network_overview: {
        map_image_id: "",
        headline: "",
        description: "",
      },
      coverage_regions: [],
      recruitment_sources: [],
      screening_flow: [],
      network_nodes: [],
      quality_control_items: [],
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
      {
        key: "proof_stats",
        title: "Proof Stats",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "proof_stats",
            label: "Proof stats",
            itemLabel: "Stat",
            addLabel: "Add stat",
            defaultItem: japanEmptyProofStat,
            sortOrderField: "sort_order",
            fields: japanProofStatFields,
          },
        ],
      },
      {
        key: "network_overview",
        title: "Network Overview",
        classification: "required",
        fields: [
          { kind: "media", path: "network_overview.map_image_id", label: "Map image" },
          { kind: "text", path: "network_overview.headline", label: "Headline" },
          { kind: "textarea", path: "network_overview.description", label: "Description" },
        ],
      },
      {
        key: "coverage_regions",
        title: "Coverage Regions",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "coverage_regions",
            label: "Coverage regions",
            itemLabel: "Region",
            addLabel: "Add region",
            defaultItem: japanEmptyRegion,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "region_name", label: "Region name" },
              { kind: "textarea", path: "description", label: "Description" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "recruitment_sources",
        title: "Recruitment Sources",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "recruitment_sources",
            label: "Recruitment sources",
            itemLabel: "Source",
            addLabel: "Add source",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "screening_flow",
        title: "Screening Flow",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "screening_flow",
            label: "Screening flow",
            itemLabel: "Step",
            addLabel: "Add step",
            defaultItem: japanEmptyStep,
            sortOrderField: "sort_order",
            fields: japanStepFields,
          },
        ],
      },
      {
        key: "network_nodes",
        title: "Network Nodes",
        classification: "optional",
        fields: [
          {
            kind: "array",
            path: "network_nodes",
            label: "Network nodes",
            itemLabel: "Node",
            addLabel: "Add node",
            defaultItem: japanEmptyNetworkNode,
            sortOrderField: "sort_order",
            fields: [
              { kind: "text", path: "region_label", label: "Region label" },
              { kind: "text", path: "title", label: "Title" },
              { kind: "textarea", path: "description", label: "Description" },
              { kind: "media", path: "image_id", label: "Image" },
              ...japanSortableFields,
            ],
          },
        ],
      },
      {
        key: "quality_control_items",
        title: "Quality Control",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "quality_control_items",
            label: "Quality control items",
            itemLabel: "Item",
            addLabel: "Add item",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
    title: "Sector Page",
    publicPath: "/sectors",
    defaultData: {
      hero: japanEmptyHero,
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
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
          {
            kind: "switch",
            path: "filter_config.enable_sector_category_filter",
            label: "Sector category filter",
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
    title: "News Page",
    publicPath: "/news",
    defaultData: {
      hero: japanEmptyHero,
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
      {
        key: "filter_config",
        title: "Filter",
        classification: "required",
        fields: [
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
        key: "final_cta",
        title: "Final CTA",
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
    title: "Contact",
    publicPath: "/contact",
    defaultData: {
      hero: japanEmptyHero,
      contact_channels: {
        line_official_account_id: "",
        line_cta_label: "",
        line_message_template: "",
        business_email: "",
        email_subject_template: "",
      },
      partnership_pic: {
        name: "",
        role: "",
        photo_image_id: "",
        description: "",
      },
      business_info: {
        business_hours: "",
        language_support: [],
        address: "",
        map_url: "",
        map_embed_url: "",
      },
      inquiry_flow: [],
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
      {
        key: "contact_channels",
        title: "Contact Channels",
        classification: "required",
        fields: [
          { kind: "text", path: "contact_channels.line_official_account_id", label: "LINE Official Account ID" },
          { kind: "text", path: "contact_channels.line_cta_label", label: "LINE CTA label" },
          { kind: "textarea", path: "contact_channels.line_message_template", label: "LINE message template" },
          { kind: "text", path: "contact_channels.business_email", label: "Business email", inputType: "email" },
          { kind: "text", path: "contact_channels.email_subject_template", label: "Email subject template" },
        ],
      },
      {
        key: "partnership_pic",
        title: "Partnership PIC",
        classification: "optional",
        fields: [
          { kind: "text", path: "partnership_pic.name", label: "Name" },
          { kind: "text", path: "partnership_pic.role", label: "Role" },
          { kind: "media", path: "partnership_pic.photo_image_id", label: "Photo" },
          { kind: "textarea", path: "partnership_pic.description", label: "Description" },
        ],
      },
      {
        key: "business_info",
        title: "Business Info",
        classification: "required",
        fields: [
          { kind: "text", path: "business_info.business_hours", label: "Business hours" },
          {
            kind: "string-array",
            path: "business_info.language_support",
            label: "Language support",
            itemLabel: "Language",
            addLabel: "Add language",
            defaultItem: "",
          },
          { kind: "text", path: "business_info.address", label: "Address" },
          { kind: "text", path: "business_info.map_url", label: "Map URL", inputType: "url" },
          { kind: "text", path: "business_info.map_embed_url", label: "Map embed URL", inputType: "url" },
        ],
      },
      {
        key: "inquiry_flow",
        title: "Inquiry Flow",
        classification: "recommended",
        fields: [
          {
            kind: "array",
            path: "inquiry_flow",
            label: "Inquiry flow",
            itemLabel: "Step",
            addLabel: "Add step",
            defaultItem: japanEmptyIconTitleDesc,
            sortOrderField: "sort_order",
            fields: japanIconTitleDescSortFields,
          },
        ],
      },
      {
        key: "final_cta",
        title: "Final CTA",
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
    title: "Final CTA",
    classification: "required",
    fields: finalCtaFields.map((field) => ({
      ...field,
      path: `final_cta.${field.path}`,
    })),
  };
}
