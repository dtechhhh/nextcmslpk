import type { ConfigKey } from "@/lib/constants";
import type { MediaCropPreset } from "@/lib/media-crop";
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
  { key: "about", label: "企業情報", href: "/about", is_enabled: true, sort_order: 0 },
  {
    key: "training_method",
    label: "教育・研修",
    href: "/training-method",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "candidate_profile",
    label: "候補者情報",
    href: "/candidate-profile",
    is_enabled: true,
    sort_order: 2,
  },
  { key: "news", label: "お役立ち情報", href: "/news", is_enabled: true, sort_order: 3 },
  {
    key: "recruitment_network",
    label: "採用ネットワーク",
    href: "/recruitment-network",
    is_enabled: true,
    sort_order: 4,
  },
  { key: "sectors", label: "対応分野", href: "/sectors", is_enabled: true, sort_order: 5 },
  { key: "contact", label: "お問い合わせ", href: "/contact", is_enabled: true, sort_order: 6 },
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
  { key: "about", label: "企業情報", href: "/about", is_enabled: true, sort_order: 0 },
  {
    key: "recruitment_network",
    label: "採用ネットワーク",
    href: "/recruitment-network",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "training_method",
    label: "教育・研修",
    href: "/training-method",
    is_enabled: true,
    sort_order: 2,
  },
];

const japanResourceLinksDefault = [
  {
    key: "candidate_profile",
    label: "候補者情報",
    href: "/candidate-profile",
    document_file_id: "",
    is_enabled: true,
    sort_order: 0,
  },
  {
    key: "sectors",
    label: "対応分野",
    href: "/sectors",
    document_file_id: "",
    is_enabled: true,
    sort_order: 1,
  },
  {
    key: "news",
    label: "お役立ち情報",
    href: "/news",
    document_file_id: "",
    is_enabled: true,
    sort_order: 2,
  },
  {
    key: "curriculum",
    label: "教育内容",
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
  { kind: "select", path: "key", label: "Jenis menu", options: japanNavbarKeyOptions },
  { kind: "text", path: "label", label: "Label" },
  { kind: "text", path: "href", label: "Link" },
  { kind: "switch", path: "is_enabled", label: "Aktif" },
  { kind: "number", path: "sort_order", label: "Urutan", min: 0 },
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
        tagline: "",
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
    title: "Brand dan Header",
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
          { kind: "text", path: "brand.lpk_name", label: "Nama LPK" },
          { kind: "text", path: "brand.tagline", label: "Tagline" },
          {
            kind: "media",
            path: "brand.logo_image_id",
            label: "Logo utama",
            mediaPreset: "logo",
          },
          {
            kind: "media",
            path: "brand.logo_light_image_id",
            label: "Logo versi terang",
            mediaPreset: "logo",
          },
        ],
      },
      {
        key: "topbar",
        title: "Topbar",
        fields: [
          { kind: "switch", path: "topbar.is_enabled", label: "Aktif" },
          { kind: "text", path: "topbar.location_label", label: "Label lokasi" },
          { kind: "text", path: "topbar.email_label", label: "Label email" },
          {
            kind: "text",
            path: "topbar.business_hours_label",
            label: "Label jam operasional",
          },
        ],
      },
      {
        key: "navbar",
        title: "Navigasi",
        fields: [
          {
            kind: "array",
            path: "navbar",
            label: "Menu navigasi",
            itemLabel: "Menu",
            addLabel: "Tambah menu",
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
        title: "CTA utama header",
        fields: [
          { kind: "text", path: "header_primary_cta.label", label: "Label" },
          {
            kind: "select",
            path: "header_primary_cta.type",
            label: "Jenis",
            options: [{ value: "line", label: "LINE" }],
          },
          {
            kind: "textarea",
            path: "header_primary_cta.line_message_template",
            label: "Template pesan LINE",
          },
        ],
      },
      {
        key: "header_secondary_cta",
        title: "CTA kedua header",
        fields: [
          { kind: "switch", path: "header_secondary_cta.is_enabled", label: "Aktif" },
          { kind: "text", path: "header_secondary_cta.label", label: "Label" },
          {
            kind: "text",
            path: "header_secondary_cta.href",
            label: "URL unduhan",
            inputType: "url",
          },
        ],
      },
      {
        key: "header_behavior",
        title: "Perilaku header",
        fields: [
          { kind: "switch", path: "header_behavior.sticky_header", label: "Header melekat" },
          {
            kind: "select",
            path: "header_behavior.header_style",
            label: "Gaya header",
            options: headerStyleOptions,
          },
        ],
      },
      {
        key: "appearance",
        title: "Tampilan",
        fields: [
          {
            kind: "color",
            path: "appearance.primary_color",
            label: "Warna utama",
            placeholder: "#1e3a5f",
          },
          {
            kind: "color",
            path: "appearance.primary_hover_color",
            label: "Warna hover utama",
            placeholder: "#162d4a",
          },
          {
            kind: "color",
            path: "appearance.accent_color",
            label: "Warna aksen",
            placeholder: "#e53935",
          },
          {
            kind: "color",
            path: "appearance.cta_color",
            label: "Warna CTA",
            placeholder: "#06C755",
          },
        ],
      },
    ],
  },
  "japan.line_business_contact": {
    variantKey: "japan",
    configKey: "line_business_contact",
    title: "LINE dan Kontak Bisnis",
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
        company_profile_url: "",
        curriculum_url: "",
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
        title: "Kontak LINE",
        fields: [
          { kind: "switch", path: "line_contact.is_enabled", label: "Aktif" },
          {
            kind: "text",
            path: "line_contact.line_official_account_id",
            label: "ID akun resmi LINE",
          },
          {
            kind: "text",
            path: "line_contact.line_display_label",
            label: "Label tampilan LINE",
          },
          {
            kind: "textarea",
            path: "line_contact.default_message_template",
            label: "Template pesan default",
          },
        ],
      },
      {
        key: "business_email",
        title: "Email bisnis",
        fields: [
          { kind: "switch", path: "business_email.is_enabled", label: "Aktif" },
          { kind: "text", path: "business_email.email", label: "Email", inputType: "email" },
          {
            kind: "text",
            path: "business_email.default_subject_template",
            label: "Template subject default",
          },
        ],
      },
      {
        key: "business_contact_note",
        title: "Catatan kontak bisnis",
        fields: [
          {
            kind: "textarea",
            path: "business_contact_note.short_note",
            label: "Catatan singkat",
          },
        ],
      },
      {
        key: "business_info",
        title: "Informasi bisnis",
        fields: [
          { kind: "text", path: "business_info.phone_label", label: "Nomor telepon / label kontak" },
          { kind: "textarea", path: "business_info.address", label: "Alamat" },
          { kind: "text", path: "business_info.map_url", label: "URL peta", inputType: "url" },
          {
            kind: "text",
            path: "business_info.operational_hours",
            label: "Jam operasional",
          },
          {
            kind: "string-array",
            path: "business_info.language_support",
            label: "Bahasa layanan",
            itemLabel: "Bahasa",
            addLabel: "Tambah bahasa",
          },
        ],
      },
      {
        key: "documents",
        title: "Dokumen",
        fields: [
          {
            kind: "text",
            path: "documents.company_profile_url",
            label: "URL profil perusahaan",
            inputType: "url",
          },
          {
            kind: "text",
            path: "documents.curriculum_url",
            label: "URL kurikulum",
            inputType: "url",
          },
        ],
      },
      {
        key: "social_links",
        title: "Link sosial media",
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
            label: "Logo",
            mediaPreset: "logo",
          },
          { kind: "text", path: "brand.lpk_name", label: "Nama LPK" },
          {
            kind: "textarea",
            path: "brand.short_description",
            label: "Deskripsi singkat",
          },
        ],
      },
      {
        key: "company_links",
        title: "Link perusahaan",
        fields: [
          {
            kind: "array",
            path: "company_links",
            label: "Link perusahaan",
            itemLabel: "Link",
            addLabel: "Tambah link",
            defaultItem: {
              key: "about",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "select", path: "key", label: "Jenis link", options: japanCompanyLinkKeyOptions },
              { kind: "text", path: "label", label: "Label" },
              { kind: "text", path: "href", label: "Link" },
              { kind: "switch", path: "is_enabled", label: "Aktif" },
              { kind: "number", path: "sort_order", label: "Urutan", min: 0 },
            ],
          },
        ],
      },
      {
        key: "resource_links",
        title: "Link resource",
        fields: [
          {
            kind: "array",
            path: "resource_links",
            label: "Link resource",
            itemLabel: "Resource",
            addLabel: "Tambah resource",
            defaultItem: {
              key: "candidate_profile",
              label: "",
              href: "",
              is_enabled: true,
              sort_order: 0,
            },
            sortOrderField: "sort_order",
            fields: [
              { kind: "select", path: "key", label: "Jenis resource", options: japanResourceLinkKeyOptions },
              { kind: "text", path: "label", label: "Label" },
              { kind: "text", path: "href", label: "URL", inputType: "url" },
              { kind: "switch", path: "is_enabled", label: "Aktif" },
              { kind: "number", path: "sort_order", label: "Urutan", min: 0 },
            ],
          },
        ],
      },
      {
        key: "contact",
        title: "Kontak",
        fields: [
          {
            kind: "switch",
            path: "contact.use_global_contact",
            label: "Gunakan kontak global",
          },
        ],
      },
      {
        key: "legal",
        title: "Legal",
        fields: [
          { kind: "text", path: "legal.copyright_text", label: "Teks copyright" },
          {
            kind: "switch",
            path: "legal.show_powered_by",
            label: "Tampilkan powered by",
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
