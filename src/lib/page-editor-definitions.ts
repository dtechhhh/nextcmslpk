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
  | "indonesia.karir_page";

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
