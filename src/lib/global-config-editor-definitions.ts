import type { ConfigKey } from "@/lib/constants";
import type { MediaPreset } from "@/lib/media-constraints";
import type { VariantKey } from "@/types";

export type GlobalConfigData = Record<string, unknown>;

export type GlobalConfigFieldOption = {
  value: string;
  label: string;
};

type BaseField = {
  path: string;
  label: string;
  placeholder?: string;
};

export type GlobalConfigField =
  | (BaseField & {
      kind: "text";
      inputType?: "text" | "email" | "url" | "tel";
    })
  | (BaseField & {
      kind: "color";
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
      options: GlobalConfigFieldOption[];
    })
  | (BaseField & {
      kind: "media";
      mediaPreset?: MediaPreset;
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
      kind: "array";
      addLabel?: string;
      itemLabel?: string;
      defaultItem: GlobalConfigData;
      sortOrderField?: string;
      fields: GlobalConfigField[];
    });

export type GlobalConfigSection = {
  key: string;
  title: string;
  fields: GlobalConfigField[];
};

export type GlobalConfigEditorKey =
  | "indonesia.brand_header"
  | "indonesia.whatsapp_contact"
  | "indonesia.footer"
  | "japan.brand_header"
  | "japan.line_business_contact"
  | "japan.footer";

export type GlobalConfigEditorDefinition = {
  variantKey: VariantKey;
  configKey: ConfigKey;
  title: string;
  defaultData: GlobalConfigData;
  sections: GlobalConfigSection[];
};

const headerStyleOptions = [
  { value: "solid", label: "Solid" },
  { value: "transparent_on_hero", label: "Transparent on hero" },
];

const indonesiaNavbarKeyOptions = [
  { value: "home", label: "Home" },
  { value: "program", label: "Program" },
  { value: "job", label: "Job" },
  { value: "about", label: "About" },
  { value: "blog", label: "Blog" },
];

const japanNavbarKeyOptions = [
  { value: "about", label: "About" },
  { value: "training_method", label: "Training Method" },
  { value: "candidate_profile", label: "Candidate Profile" },
  { value: "news", label: "News" },
  { value: "recruitment_network", label: "Recruitment Network" },
  { value: "sectors", label: "Sectors" },
  { value: "contact", label: "Contact" },
];

const indonesiaQuickLinkKeyOptions = [
  { value: "home", label: "Home" },
  { value: "program", label: "Program" },
  { value: "job", label: "Job" },
  { value: "about", label: "About" },
  { value: "blog", label: "Blog" },
  { value: "career", label: "Career" },
];

const japanCompanyLinkKeyOptions = [
  { value: "about", label: "About" },
  { value: "recruitment_network", label: "Recruitment Network" },
  { value: "training_method", label: "Training Method" },
];

const japanResourceLinkKeyOptions = [
  { value: "candidate_profile", label: "Candidate Profile" },
  { value: "sectors", label: "Sectors" },
  { value: "news", label: "News" },
  { value: "curriculum", label: "Curriculum" },
];

const indonesiaNavbarDefault = [
  { key: "home", label: "Home", href: "/", is_enabled: true, sort_order: 0 },
  { key: "program", label: "Program", href: "/program", is_enabled: true, sort_order: 1 },
  { key: "job", label: "Job", href: "/job", is_enabled: true, sort_order: 2 },
  { key: "about", label: "Tentang Kami", href: "/tentang-kami", is_enabled: true, sort_order: 3 },
  { key: "blog", label: "Blog", href: "/blog", is_enabled: true, sort_order: 4 },
];

const japanNavbarDefault = [
  { key: "about", label: "About", href: "/about", is_enabled: true, sort_order: 0 },
  {
    key: "training_method",
    label: "Training Method",
    href: "/training-method",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "candidate_profile",
    label: "Candidate Profile",
    href: "/candidate-profile",
    is_enabled: true,
    sort_order: 2,
  },
  { key: "news", label: "News", href: "/news", is_enabled: true, sort_order: 3 },
  {
    key: "recruitment_network",
    label: "Recruitment Network",
    href: "/recruitment-network",
    is_enabled: true,
    sort_order: 4,
  },
  { key: "sectors", label: "Sectors", href: "/sectors", is_enabled: true, sort_order: 5 },
  { key: "contact", label: "Contact", href: "/contact", is_enabled: true, sort_order: 6 },
];

const indonesiaQuickLinksDefault = [
  { key: "home", label: "Home", href: "/", is_enabled: true, sort_order: 0 },
  { key: "program", label: "Program", href: "/program", is_enabled: true, sort_order: 1 },
  { key: "job", label: "Job", href: "/job", is_enabled: true, sort_order: 2 },
  { key: "about", label: "Tentang Kami", href: "/tentang-kami", is_enabled: true, sort_order: 3 },
  { key: "blog", label: "Blog", href: "/blog", is_enabled: true, sort_order: 4 },
  { key: "career", label: "Karir", href: "/karir", is_enabled: true, sort_order: 5 },
];

const japanCompanyLinksDefault = [
  { key: "about", label: "About", href: "/about", is_enabled: true, sort_order: 0 },
  {
    key: "recruitment_network",
    label: "Recruitment Network",
    href: "/recruitment-network",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "training_method",
    label: "Training Method",
    href: "/training-method",
    is_enabled: true,
    sort_order: 2,
  },
];

const japanResourceLinksDefault = [
  {
    key: "candidate_profile",
    label: "Candidate Profile",
    href: "/candidate-profile",
    document_file_id: "",
    is_enabled: true,
    sort_order: 0,
  },
  {
    key: "sectors",
    label: "Sectors",
    href: "/sectors",
    document_file_id: "",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "news",
    label: "News",
    href: "/news",
    document_file_id: "",
    is_enabled: true,
    sort_order: 2,
  },
  {
    key: "curriculum",
    label: "Curriculum",
    href: "",
    document_file_id: "",
    is_enabled: true,
    sort_order: 3,
  },
];

const navItemFields: GlobalConfigField[] = [
  { kind: "select", path: "key", label: "Key", options: indonesiaNavbarKeyOptions },
  { kind: "text", path: "label", label: "Label" },
  { kind: "text", path: "href", label: "Href" },
  { kind: "switch", path: "is_enabled", label: "Enabled" },
  { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
];

const japanNavItemFields: GlobalConfigField[] = [
  { kind: "select", path: "key", label: "Key", options: japanNavbarKeyOptions },
  { kind: "text", path: "label", label: "Label" },
  { kind: "text", path: "href", label: "Href" },
  { kind: "switch", path: "is_enabled", label: "Enabled" },
  { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
];

const indonesiaAppearanceDefaults = {
  primary_color: "",
  primary_hover_color: "",
  accent_color: "",
  cta_color: "",
};

const japanAppearanceDefaults = {
  primary_color: "",
  primary_hover_color: "",
  accent_color: "",
  cta_color: "",
};

export const GLOBAL_CONFIG_EDITOR_DEFINITIONS = {
  "indonesia.brand_header": {
    variantKey: "indonesia",
    configKey: "brand_header",
    title: "Brand & Header",
    defaultData: {
      brand: {
        lpk_name: "",
        logo_image_id: "",
        logo_light_image_id: "",
      },
      navbar: indonesiaNavbarDefault,
      variant_switch: {
        is_enabled: true,
        target_variant_key: "japan",
        target_behavior: "homepage",
      },
      header_cta: {
        label: "",
        whatsapp_message_template: "",
      },
      header_behavior: {
        sticky_header: true,
        header_style: "solid",
      },
      appearance: indonesiaAppearanceDefaults,
    },
    sections: [
      {
        key: "brand",
        title: "Brand",
        fields: [
          { kind: "text", path: "brand.lpk_name", label: "LPK name" },
          {
            kind: "media",
            path: "brand.logo_image_id",
            label: "Logo image",
            mediaPreset: "logo",
          },
          {
            kind: "media",
            path: "brand.logo_light_image_id",
            label: "Light logo image",
            mediaPreset: "logo",
          },
        ],
      },
      {
        key: "navbar",
        title: "Navbar",
        fields: [
          {
            kind: "array",
            path: "navbar",
            label: "Navbar items",
            itemLabel: "Menu",
            addLabel: "Add menu",
            defaultItem: {
              key: "home",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: navItemFields,
          },
        ],
      },
      {
        key: "variant_switch",
        title: "Variant Switch",
        fields: [
          { kind: "switch", path: "variant_switch.is_enabled", label: "Enabled" },
          {
            kind: "select",
            path: "variant_switch.target_variant_key",
            label: "Target variant",
            options: [{ value: "japan", label: "Japan" }],
          },
          {
            kind: "select",
            path: "variant_switch.target_behavior",
            label: "Target behavior",
            options: [{ value: "homepage", label: "Homepage" }],
          },
        ],
      },
      {
        key: "header_cta",
        title: "Header CTA",
        fields: [
          { kind: "text", path: "header_cta.label", label: "Label" },
          {
            kind: "textarea",
            path: "header_cta.whatsapp_message_template",
            label: "WhatsApp message template",
          },
        ],
      },
      {
        key: "header_behavior",
        title: "Header Behavior",
        fields: [
          { kind: "switch", path: "header_behavior.sticky_header", label: "Sticky header" },
          {
            kind: "select",
            path: "header_behavior.header_style",
            label: "Header style",
            options: headerStyleOptions,
          },
        ],
      },
      {
        key: "appearance",
        title: "Appearance",
        fields: [
          {
            kind: "color",
            path: "appearance.primary_color",
            label: "Primary color",
            placeholder: "#2e9fd6",
          },
          {
            kind: "color",
            path: "appearance.primary_hover_color",
            label: "Primary hover color",
            placeholder: "#2184b8",
          },
          {
            kind: "color",
            path: "appearance.accent_color",
            label: "Accent color",
            placeholder: "#e53935",
          },
          {
            kind: "color",
            path: "appearance.cta_color",
            label: "CTA color",
            placeholder: "#25D366",
          },
        ],
      },
    ],
  },
  "indonesia.whatsapp_contact": {
    variantKey: "indonesia",
    configKey: "whatsapp_contact",
    title: "WhatsApp & Contact",
    defaultData: {
      whatsapp: {
        number: "",
        default_message_template: "",
        floating_is_enabled: true,
        floating_icon_only_label: "",
        floating_label_after_scroll: "",
        floating_position: "bottom_right",
      },
      contact: {
        phone_label: "",
        email: "",
        address: "",
        map_url: "",
        operational_hours: "",
      },
      social_links: {
        instagram: "",
        youtube: "",
        tiktok: "",
        facebook: "",
        line: "",
      },
    },
    sections: [
      {
        key: "whatsapp",
        title: "WhatsApp",
        fields: [
          { kind: "text", path: "whatsapp.number", label: "Number", inputType: "tel" },
          {
            kind: "textarea",
            path: "whatsapp.default_message_template",
            label: "Default message template",
          },
          {
            kind: "switch",
            path: "whatsapp.floating_is_enabled",
            label: "Floating button enabled",
          },
          {
            kind: "text",
            path: "whatsapp.floating_icon_only_label",
            label: "Floating icon label",
          },
          {
            kind: "text",
            path: "whatsapp.floating_label_after_scroll",
            label: "Floating label after scroll",
          },
          {
            kind: "select",
            path: "whatsapp.floating_position",
            label: "Floating position",
            options: [
              { value: "bottom_right", label: "Bottom right" },
              { value: "bottom_left", label: "Bottom left" },
            ],
          },
        ],
      },
      {
        key: "contact",
        title: "Contact",
        fields: [
          { kind: "text", path: "contact.phone_label", label: "Phone label" },
          { kind: "text", path: "contact.email", label: "Email", inputType: "email" },
          { kind: "textarea", path: "contact.address", label: "Address" },
          { kind: "text", path: "contact.map_url", label: "Map URL", inputType: "url" },
          {
            kind: "text",
            path: "contact.operational_hours",
            label: "Operational hours",
          },
        ],
      },
      {
        key: "social_links",
        title: "Social Links",
        fields: [
          { kind: "text", path: "social_links.instagram", label: "Instagram", inputType: "url" },
          { kind: "text", path: "social_links.youtube", label: "YouTube", inputType: "url" },
          { kind: "text", path: "social_links.tiktok", label: "TikTok", inputType: "url" },
          { kind: "text", path: "social_links.facebook", label: "Facebook", inputType: "url" },
          { kind: "text", path: "social_links.line", label: "LINE", inputType: "url" },
        ],
      },
    ],
  },
  "indonesia.footer": {
    variantKey: "indonesia",
    configKey: "footer",
    title: "Footer",
    defaultData: {
      brand: {
        logo_image_id: "",
        lpk_name: "",
        short_description: "",
      },
      quick_links: indonesiaQuickLinksDefault,
      program_links: {
        source: "featured",
        max_items: 3,
        manual_program_ids: [],
      },
      contact: {
        use_global_contact: true,
      },
      legal: {
        copyright_text: "",
        show_powered_by: true,
      },
    },
    sections: [
      {
        key: "brand",
        title: "Brand",
        fields: [
          {
            kind: "media",
            path: "brand.logo_image_id",
            label: "Logo image",
            mediaPreset: "logo",
          },
          { kind: "text", path: "brand.lpk_name", label: "LPK name" },
          {
            kind: "textarea",
            path: "brand.short_description",
            label: "Short description",
          },
        ],
      },
      {
        key: "quick_links",
        title: "Quick Links",
        fields: [
          {
            kind: "array",
            path: "quick_links",
            label: "Quick links",
            itemLabel: "Link",
            addLabel: "Add link",
            defaultItem: {
              key: "home",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "select", path: "key", label: "Key", options: indonesiaQuickLinkKeyOptions },
              { kind: "text", path: "label", label: "Label" },
              { kind: "text", path: "href", label: "Href" },
              { kind: "switch", path: "is_enabled", label: "Enabled" },
              { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
            ],
          },
        ],
      },
      {
        key: "program_links",
        title: "Program Links",
        fields: [
          {
            kind: "select",
            path: "program_links.source",
            label: "Source",
            options: [
              { value: "featured", label: "Featured" },
              { value: "manual", label: "Manual" },
              { value: "disabled", label: "Disabled" },
            ],
          },
          {
            kind: "number",
            path: "program_links.max_items",
            label: "Max items",
            min: 0,
            max: 20,
          },
          {
            kind: "string-array",
            path: "program_links.manual_program_ids",
            label: "Manual program IDs",
            itemLabel: "Program ID",
            addLabel: "Add program ID",
          },
        ],
      },
      {
        key: "contact",
        title: "Contact",
        fields: [
          {
            kind: "switch",
            path: "contact.use_global_contact",
            label: "Use global contact",
          },
        ],
      },
      {
        key: "legal",
        title: "Legal",
        fields: [
          { kind: "text", path: "legal.copyright_text", label: "Copyright text" },
          {
            kind: "switch",
            path: "legal.show_powered_by",
            label: "Show powered by",
          },
        ],
      },
    ],
  },
  "japan.brand_header": {
    variantKey: "japan",
    configKey: "brand_header",
    title: "Brand & Header",
    defaultData: {
      brand: {
        lpk_name: "",
        tagline: "",
        logo_image_id: "",
        logo_light_image_id: "",
      },
      topbar: {
        location_label: "",
        email_label: "",
        business_hours_label: "",
        is_enabled: true,
      },
      navbar: japanNavbarDefault,
      header_primary_cta: {
        label: "",
        type: "line",
        line_message_template: "",
      },
      header_secondary_cta: {
        label: "",
        type: "internal_link",
        document_file_id: "",
        href: "",
        is_enabled: true,
      },
      header_behavior: {
        sticky_header: true,
        header_style: "solid",
      },
      appearance: japanAppearanceDefaults,
    },
    sections: [
      {
        key: "brand",
        title: "Brand",
        fields: [
          { kind: "text", path: "brand.lpk_name", label: "LPK name" },
          { kind: "text", path: "brand.tagline", label: "Tagline" },
          {
            kind: "media",
            path: "brand.logo_image_id",
            label: "Logo image",
            mediaPreset: "logo",
          },
          {
            kind: "media",
            path: "brand.logo_light_image_id",
            label: "Light logo image",
            mediaPreset: "logo",
          },
        ],
      },
      {
        key: "topbar",
        title: "Topbar",
        fields: [
          { kind: "switch", path: "topbar.is_enabled", label: "Enabled" },
          { kind: "text", path: "topbar.location_label", label: "Location label" },
          { kind: "text", path: "topbar.email_label", label: "Email label" },
          {
            kind: "text",
            path: "topbar.business_hours_label",
            label: "Business hours label",
          },
        ],
      },
      {
        key: "navbar",
        title: "Navbar",
        fields: [
          {
            kind: "array",
            path: "navbar",
            label: "Navbar items",
            itemLabel: "Menu",
            addLabel: "Add menu",
            defaultItem: {
              key: "about",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: japanNavItemFields,
          },
        ],
      },
      {
        key: "header_primary_cta",
        title: "Header Primary CTA",
        fields: [
          { kind: "text", path: "header_primary_cta.label", label: "Label" },
          {
            kind: "select",
            path: "header_primary_cta.type",
            label: "Type",
            options: [{ value: "line", label: "LINE" }],
          },
          {
            kind: "textarea",
            path: "header_primary_cta.line_message_template",
            label: "LINE message template",
          },
        ],
      },
      {
        key: "header_secondary_cta",
        title: "Header Secondary CTA",
        fields: [
          { kind: "switch", path: "header_secondary_cta.is_enabled", label: "Enabled" },
          { kind: "text", path: "header_secondary_cta.label", label: "Label" },
          {
            kind: "select",
            path: "header_secondary_cta.type",
            label: "Type",
            options: [
              { value: "document", label: "Document" },
              { value: "internal_link", label: "Internal link" },
            ],
          },
          {
            kind: "document",
            path: "header_secondary_cta.document_file_id",
            label: "Document file",
          },
          { kind: "text", path: "header_secondary_cta.href", label: "Href" },
        ],
      },
      {
        key: "header_behavior",
        title: "Header Behavior",
        fields: [
          { kind: "switch", path: "header_behavior.sticky_header", label: "Sticky header" },
          {
            kind: "select",
            path: "header_behavior.header_style",
            label: "Header style",
            options: headerStyleOptions,
          },
        ],
      },
      {
        key: "appearance",
        title: "Appearance",
        fields: [
          {
            kind: "color",
            path: "appearance.primary_color",
            label: "Primary color",
            placeholder: "#1e3a5f",
          },
          {
            kind: "color",
            path: "appearance.primary_hover_color",
            label: "Primary hover color",
            placeholder: "#162d4a",
          },
          {
            kind: "color",
            path: "appearance.accent_color",
            label: "Accent color",
            placeholder: "#e53935",
          },
          {
            kind: "color",
            path: "appearance.cta_color",
            label: "CTA color",
            placeholder: "#06C755",
          },
        ],
      },
    ],
  },
  "japan.line_business_contact": {
    variantKey: "japan",
    configKey: "line_business_contact",
    title: "LINE & Business Contact",
    defaultData: {
      line_contact: {
        line_official_account_id: "",
        line_display_label: "",
        default_message_template: "",
        is_enabled: true,
      },
      business_email: {
        email: "",
        default_subject_template: "",
        is_enabled: true,
      },
      business_contact_note: {
        short_note: "",
      },
      business_info: {
        phone_label: "",
        address: "",
        map_url: "",
        operational_hours: "",
        language_support: [],
      },
      documents: {
        company_profile_file_id: "",
        curriculum_file_id: "",
      },
      social_links: {
        line: "",
        linkedin: "",
        youtube: "",
        instagram: "",
      },
    },
    sections: [
      {
        key: "line_contact",
        title: "LINE Contact",
        fields: [
          { kind: "switch", path: "line_contact.is_enabled", label: "Enabled" },
          {
            kind: "text",
            path: "line_contact.line_official_account_id",
            label: "LINE official account ID",
          },
          {
            kind: "text",
            path: "line_contact.line_display_label",
            label: "LINE display label",
          },
          {
            kind: "textarea",
            path: "line_contact.default_message_template",
            label: "Default message template",
          },
        ],
      },
      {
        key: "business_email",
        title: "Business Email",
        fields: [
          { kind: "switch", path: "business_email.is_enabled", label: "Enabled" },
          { kind: "text", path: "business_email.email", label: "Email", inputType: "email" },
          {
            kind: "text",
            path: "business_email.default_subject_template",
            label: "Default subject template",
          },
        ],
      },
      {
        key: "business_contact_note",
        title: "Business Contact Note",
        fields: [
          {
            kind: "textarea",
            path: "business_contact_note.short_note",
            label: "Short note",
          },
        ],
      },
      {
        key: "business_info",
        title: "Business Info",
        fields: [
          { kind: "text", path: "business_info.phone_label", label: "Phone label" },
          { kind: "textarea", path: "business_info.address", label: "Address" },
          { kind: "text", path: "business_info.map_url", label: "Map URL", inputType: "url" },
          {
            kind: "text",
            path: "business_info.operational_hours",
            label: "Operational hours",
          },
          {
            kind: "string-array",
            path: "business_info.language_support",
            label: "Language support",
            itemLabel: "Language",
            addLabel: "Add language",
          },
        ],
      },
      {
        key: "documents",
        title: "Documents",
        fields: [
          {
            kind: "document",
            path: "documents.company_profile_file_id",
            label: "Company profile file",
          },
          {
            kind: "document",
            path: "documents.curriculum_file_id",
            label: "Curriculum file",
          },
        ],
      },
      {
        key: "social_links",
        title: "Social Links",
        fields: [
          { kind: "text", path: "social_links.line", label: "LINE", inputType: "url" },
          { kind: "text", path: "social_links.linkedin", label: "LinkedIn", inputType: "url" },
          { kind: "text", path: "social_links.youtube", label: "YouTube", inputType: "url" },
          { kind: "text", path: "social_links.instagram", label: "Instagram", inputType: "url" },
        ],
      },
    ],
  },
  "japan.footer": {
    variantKey: "japan",
    configKey: "footer",
    title: "Footer",
    defaultData: {
      brand: {
        logo_image_id: "",
        lpk_name: "",
        short_description: "",
      },
      company_links: japanCompanyLinksDefault,
      resource_links: japanResourceLinksDefault,
      contact: {
        use_global_contact: true,
      },
      legal: {
        copyright_text: "",
        show_powered_by: true,
      },
    },
    sections: [
      {
        key: "brand",
        title: "Brand",
        fields: [
          {
            kind: "media",
            path: "brand.logo_image_id",
            label: "Logo image",
            mediaPreset: "logo",
          },
          { kind: "text", path: "brand.lpk_name", label: "LPK name" },
          {
            kind: "textarea",
            path: "brand.short_description",
            label: "Short description",
          },
        ],
      },
      {
        key: "company_links",
        title: "Company Links",
        fields: [
          {
            kind: "array",
            path: "company_links",
            label: "Company links",
            itemLabel: "Link",
            addLabel: "Add link",
            defaultItem: {
              key: "about",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "select", path: "key", label: "Key", options: japanCompanyLinkKeyOptions },
              { kind: "text", path: "label", label: "Label" },
              { kind: "text", path: "href", label: "Href" },
              { kind: "switch", path: "is_enabled", label: "Enabled" },
              { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
            ],
          },
        ],
      },
      {
        key: "resource_links",
        title: "Resource Links",
        fields: [
          {
            kind: "array",
            path: "resource_links",
            label: "Resource links",
            itemLabel: "Resource",
            addLabel: "Add resource",
            defaultItem: {
              key: "candidate_profile",
              label: "",
              href: "",
              document_file_id: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "select", path: "key", label: "Key", options: japanResourceLinkKeyOptions },
              { kind: "text", path: "label", label: "Label" },
              { kind: "text", path: "href", label: "Href" },
              { kind: "document", path: "document_file_id", label: "Document file" },
              { kind: "switch", path: "is_enabled", label: "Enabled" },
              { kind: "number", path: "sort_order", label: "Sort order", min: 0 },
            ],
          },
        ],
      },
      {
        key: "contact",
        title: "Contact",
        fields: [
          {
            kind: "switch",
            path: "contact.use_global_contact",
            label: "Use global contact",
          },
        ],
      },
      {
        key: "legal",
        title: "Legal",
        fields: [
          { kind: "text", path: "legal.copyright_text", label: "Copyright text" },
          {
            kind: "switch",
            path: "legal.show_powered_by",
            label: "Show powered by",
          },
        ],
      },
    ],
  },
} satisfies Record<GlobalConfigEditorKey, GlobalConfigEditorDefinition>;

export function getGlobalConfigEditorDefinition(
  key: GlobalConfigEditorKey,
) {
  return GLOBAL_CONFIG_EDITOR_DEFINITIONS[key];
}
