# 05 - Variant Indonesia

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: bagian Indonesia dari 05-frontend, 10-content-model, 18-variant-indonesia-field-map
Peran: SATU-SATUNYA dokumen spec variant Indonesia.

## Prinsip

```text
Variant Indonesia = website marketing B2C untuk calon siswa Indonesia.
CTA utama: WhatsApp prefilled message.
Tidak ada form publik, lead inbox, SEO manual, page builder, pilihan "Lainnya".
Tenant mengisi konten, theme menjaga layout.
Icon dari registry codebase, bukan input bebas.
```

## Routes

```text
/                   → Homepage
/program            → Program Page
/program/[slug]     → Program Detail
/job                → Job Page
/job/[slug]         → Job Detail
/tentang-kami       → Tentang Kami
/blog               → Blog Page
/blog/[slug]        → Blog Detail
/offer/[slug]       → Offer Detail (NO listing page — lihat DEC-017)
/karir              → Karir Page
/karir/[slug]       → Karir Detail
```

Catatan route:
- Offer TIDAK memiliki listing page `/offer`. Offer hanya muncul via homepage offer_section, blog page offer_section, dan blog content block offer_callout. Detail accessible via direct URL `/offer/[slug]`.

## CMS Menu

```text
Variant Indonesia
  Dashboard Ringkas
  Global
    Brand & Header
    WhatsApp & Contact
    Footer
  Pages
    Homepage
    Program Page
    Job Page
    Blog Page
    Tentang Kami
    Karir Page
  Collections
    Program
    Job
    Offer
    Blog
    Karir
  Option Data
  Media Library
```

## Global - Brand & Header

config_key: `brand_header`

```text
brand
  lpk_name               String, required
  tagline                String
  logo_image_id           MediaAsset ref
  logo_light_image_id     MediaAsset ref (untuk header transparent)

navbar[]
  key                     home | program | job | about | blog
  label                   String
  href                    String
  is_enabled              Boolean
  sort_order              Int

variant_switch
  is_enabled              Boolean
  target_variant_key      "japan"
  target_behavior         "homepage"

header_cta
  label                   String
  whatsapp_message_template  String

header_behavior
  sticky_header           Boolean, default true
  header_style            "solid" | "transparent_on_hero"
```

Rules: Header tidak memiliki dropdown pada MVP. Switch Jepang mengarah ke homepage variant Jepang. CTA header selalu WhatsApp.

## Global - WhatsApp & Contact

config_key: `whatsapp_contact`

```text
whatsapp
  number                  String, required (format: 628xxx)
  default_message_template  String
  floating_is_enabled     Boolean, default true
  floating_icon_only_label  String
  floating_label_after_scroll  String
  floating_position       "bottom_right" | "bottom_left"

contact
  phone_label             String
  email                   String
  address                 String
  map_url                 String (Google Maps embed URL)
  operational_hours       String

social_links
  instagram               String (URL, kosong = hidden)
  youtube                 String
  tiktok                  String
  facebook                String
  line                    String
```

Rules: Floating WhatsApp aktif default. Social link kosong tidak ditampilkan. Tidak ada form kontak.

## Global - Footer

config_key: `footer`

```text
brand
  logo_image_id           MediaAsset ref
  lpk_name                String
  short_description       String

quick_links[]
  key                     home | program | job | about | blog | career
  label                   String
  href                    String
  is_enabled              Boolean
  sort_order              Int

program_links
  source                  "featured" | "manual" | "disabled"
  max_items               Int
  manual_program_ids[]    String[]

contact
  use_global_contact      Boolean, default true

legal
  copyright_text          String
  show_powered_by         Boolean
```

## Page - Homepage

page_key: `homepage`

```text
hero
  media_type              "image" | "video"
  media_id                MediaAsset ref
  headline                String, required
  subheadline             String
  primary_cta_label       String
  primary_cta_whatsapp_message  String
  secondary_cta_label     String
  secondary_cta_href      String

offer_section                           [optional]
  is_enabled              Boolean
  source                  "active_featured_offer" | "manual"
  manual_offer_id         String
  fallback_badge_label    String
  fallback_headline       String
  fallback_description    String
  fallback_image_id       MediaAsset ref

stats[]                                 [required, min 3, max 5]
  icon_key                String (registry)
  value                   String
  label                   String
  sort_order              Int
  is_enabled              Boolean

trust_cards[]                           [required, min 3, max 5]
  icon_key                String (registry)
  headline                String
  description             String
  sort_order              Int
  is_enabled              Boolean

featured_programs                       [required]
  source                  "featured" | "manual"
  manual_program_ids[]    String[]
  max_items               3

latest_jobs                             [recommended]
  source                  "latest_active"
  max_items               5

steps[]                                 [recommended, min 4, max 6]
  icon_key                String (registry)
  title                   String
  description             String
  sort_order              Int
  is_enabled              Boolean

faqs[]                                  [recommended, min 3]
  question                String
  answer                  String
  sort_order              Int
  is_enabled              Boolean

testimonials[]                          [optional]
  name                    String
  role_or_program         String
  quote                   String
  image_id                MediaAsset ref
  sort_order              Int
  is_enabled              Boolean

latest_blogs                            [recommended]
  source                  "latest_published"
  max_items               5

contact_section                         [required]
  headline                String
  description             String
  use_global_contact      Boolean
```

## Page - Program Page

page_key: `program_page`

```text
hero
  headline                String
  subheadline             String
  image_id                MediaAsset ref
  primary_cta_label       String
  primary_cta_whatsapp_message  String
  secondary_cta_label     String

stats[]                                 [optional]
  icon_key, value, label, sort_order, is_enabled

filter_config
  enable_program_type_filter   Boolean
  enable_gender_filter         Boolean
  enable_education_filter      Boolean
  enable_language_filter       Boolean

faq[]                                   [optional]
  question, answer, sort_order, is_enabled

final_cta
  headline, description, cta_label, whatsapp_message_template
```

Data: published programs, sorted: featured → sort_order → terbaru.
Filters: Tipe Program, Gender, Pendidikan Minimal, Level Bahasa.

## Page - Job Page

page_key: `job_page`

```text
hero
  headline, subheadline, image_id, primary_cta_label, primary_cta_whatsapp_message

filter_config
  enable_job_type_filter, enable_job_field_filter, enable_gender_filter, enable_language_filter

faq[]                                   [optional]
  question, answer, sort_order, is_enabled

final_cta
  headline, description, cta_label, whatsapp_message_template
```

Data: active published jobs (not expired), sorted: deadline → featured → sort_order → terbaru.

## Page - Blog Page

page_key: `blog_page`

```text
hero
  headline, subheadline, image_id, primary_cta_label, primary_cta_whatsapp_message

filter_config
  enable_category_filter, enable_tag_filter

offer_section                           [optional]
  source: "active_featured_offer" | "manual" | "disabled"
  manual_offer_id
```

Data: published blogs, sorted: featured → published_at terbaru.

## Page - Tentang Kami

page_key: `tentang_kami`

```text
hero
  media_type, media_id, headline, subheadline
  primary_cta_label, primary_cta_whatsapp_message
  secondary_cta_label, secondary_cta_href

proof_stats[]                           [recommended]
  value, label, sort_order, is_enabled

story                                   [required]
  badge_label, headline, body, image_id

vision_mission                          [required]
  vision_headline, vision_description
  mission_headline, mission_description

values[]                                [recommended]
  icon_key, headline, description, sort_order, is_enabled

team_members[]                          [recommended]
  name, role, bio, image_id, sort_order, is_enabled

gallery                                 [optional]
  media_ids[]

partners[]                              [optional]
  name, logo_image_id, description, sort_order, is_enabled

legalities[]                            [optional]
  icon_key, title, description, document_label, document_url, sort_order, is_enabled

contact_section
  headline, description, use_global_contact
```

## Page - Karir Page

page_key: `karir_page`

```text
hero
  headline, subheadline, image_id, primary_cta_label, primary_cta_whatsapp_message

filter_config
  enable_department_filter, enable_employment_type_filter, enable_work_arrangement_filter

faq[]                                   [optional]

final_cta
  headline, description, cta_label, whatsapp_message_template
```

Data: active published careers (not expired).

## Collection - Program

collection_key: `program`

```text
IDENTITY
  title, slug, subtitle, short_description, overview
  thumbnail_image_id, hero_image_id
  status: draft | published
  is_featured, sort_order

CLASSIFICATION
  program_type_option_id, gender_option_id
  min_age, max_age
  education_level_option_id, language_level_option_id

CARD INFO
  duration_label, contract_label, salary_range_label
  target_language_label, visa_path_label, highlight_label

DETAIL CONTENT
  why_choose_items[], curriculum_items[], timeline_items[]
  requirements[], cost_items[], career_opportunity_items[]
  legality_partner_items[], testimonials[], faqs[]

CTA
  primary_cta_label, whatsapp_message_template
  brochure_file_id, brochure_enabled
```

## Collection - Job

collection_key: `job`

```text
IDENTITY
  title, slug, subtitle, short_description, overview
  thumbnail_image_id, hero_image_id
  status: draft | published | closed | filled
  is_featured, published_at, expired_at, sort_order

CLASSIFICATION
  job_type_option_id, job_field_option_id, gender_option_id
  language_level_option_id, education_level_option_id, related_program_id

CANDIDATE REQUIREMENTS
  min_age, max_age, certificate_required_label
  experience_required_label, ex_japan_required, required_documents[]

CARD INFO
  location_label, salary_range_label, contract_label
  deadline_label, quota_label

DETAIL CONTENT
  overview_items[], job_description, benefit_items[]
  qualification_items[], recruitment_steps[]
  gallery_media_ids[], faqs[]

CTA
  primary_cta_label, whatsapp_message_template
```

Rules: expired_at wajib. Expired tidak tampil di listing aktif. Detail expired: badge + CTA disabled.

## Collection - Offer

collection_key: `offer`

```text
IDENTITY
  title, slug, subtitle, short_description, overview
  thumbnail_image_id, hero_image_id
  status: draft | published | closed
  is_featured, start_at, expired_at, sort_order

CLASSIFICATION
  offer_type_option_id, target_audience_option_id

CAMPAIGN INFO
  schedule_label, duration_label, format_label
  quota_label, price_label, original_price_label, urgency_label

DETAIL CONTENT
  benefit_items[], detail_description, detail_checklist[]
  bonus_items[], suitable_for_items[], faqs[]

CTA
  primary_cta_label, whatsapp_message_template
```

## Collection - Blog

collection_key: `blog`

```text
IDENTITY
  title, slug, subtitle, excerpt
  cover_image_id
  status: draft | published
  is_featured, published_at, reading_time_label, sort_order

CLASSIFICATION
  category_option_id, tag_option_ids[]

AUTHOR
  author_name, author_title, author_bio, author_image_id

CONTENT BLOCKS[]
  type: heading | paragraph | quote | image | youtube_embed | offer_callout | whatsapp_cta
  sort_order
  data (per type, see Content Blocks section below)

RELATED ARTICLES
  source: same_category | same_tags | manual
  manual_blog_ids[], max_items: 3
```

## Collection - Karir

collection_key: `karir`

```text
IDENTITY
  title, slug, subtitle, short_description, overview
  thumbnail_image_id, hero_image_id
  status: draft | published | closed | filled
  is_featured, published_at, expired_at, sort_order

CLASSIFICATION
  department_option_id, employment_type_option_id, work_arrangement_option_id

CARD INFO
  location_label, salary_label, experience_label
  education_label, deadline_label

DETAIL CONTENT
  overview_items[], role_description, responsibilities[]
  requirements[], benefits[], recruitment_steps[], faqs[]

CTA
  primary_cta_label, whatsapp_message_template
```

## Content Blocks (Blog)

```text
heading:
  level: h2 | h3
  text: String

paragraph:
  text: String (plain text, no HTML — lihat DEC-016)
  MVP limitation: tidak ada bold, italic, link. Formatting via block types lain.

quote:
  text: String
  author: String (optional)

image:
  image_id: MediaAsset ref
  alt_text: String
  caption: String (optional)

youtube_embed:
  video_id: String (youtube video ID only, validated)
  caption: String (optional)

offer_callout:
  offer_id: String (ref to Offer collection item)

whatsapp_cta:
  label: String
  whatsapp_message_template: String
```

Rules: Tidak ada HTML/script bebas. YouTube hanya video ID. Offer callout mengambil dari Offer collection.

## Option Sets

```text
program_type:        Magang, Tokutei Ginou, Gijinkoku, Kelas Bahasa
gender:              Laki-laki, Perempuan, Laki-laki & Perempuan
education_level:     SMA/SMK, D3, S1
language_level:      N5, N4, N3, N2, N1
job_type:            Full-time, Part-time, Kontrak
job_field:           Manufaktur, Konstruksi, Pertanian, Perikanan, Makanan, Perhotelan, Perawatan
blog_category:       Tips, Pengalaman, Berita, Edukasi
blog_tag:            (seeded minimal, tenant tambah sendiri)
offer_type:          Promo, Event, Kelas Gratis, Paket Kelas
target_audience:     Umum, Pelajar, Fresh Graduate, Eks Jepang
career_department:   (tenant-specific, seeded empty)
career_employment_type:  Full-time, Part-time, Magang
career_work_arrangement: On-site, Hybrid, Remote
```

## Section Classification

```text
PAGE             | SECTION            | CLASSIFICATION
─────────────────────────────────────────────────────
Homepage         | hero               | required
Homepage         | offer_section      | optional
Homepage         | stats              | required
Homepage         | trust_cards        | required
Homepage         | featured_programs  | required
Homepage         | latest_jobs        | recommended
Homepage         | steps              | recommended
Homepage         | faqs               | recommended
Homepage         | testimonials       | optional
Homepage         | latest_blogs       | recommended
Homepage         | contact_section    | required
Program Page     | hero               | required
Program Page     | stats              | optional
Program Page     | filter             | required
Program Page     | faq                | optional
Program Page     | final_cta          | required
Job Page         | hero               | required
Job Page         | filter             | required
Job Page         | faq                | optional
Job Page         | final_cta          | required
Blog Page        | hero               | required
Blog Page        | filter             | required
Blog Page        | offer_section      | optional
Tentang Kami     | hero               | required
Tentang Kami     | proof_stats        | recommended
Tentang Kami     | story              | required
Tentang Kami     | vision_mission     | required
Tentang Kami     | values             | recommended
Tentang Kami     | team_members       | recommended
Tentang Kami     | gallery            | optional
Tentang Kami     | partners           | optional
Tentang Kami     | legalities         | optional
Tentang Kami     | contact_section    | required
Karir Page       | hero               | required
Karir Page       | filter             | required
Karir Page       | faq                | optional
Karir Page       | final_cta          | required
```

## Not In MVP

```text
Public lead form, public apply form, upload CV, newsletter, comment system,
email CTA karir, SEO manual, page builder, HTML/script bebas, icon input bebas,
pilihan "Lainnya".
```
