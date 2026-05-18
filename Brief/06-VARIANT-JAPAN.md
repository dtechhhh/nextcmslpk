# 06 - Variant Jepang

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: bagian Jepang dari 05-frontend, 10-content-model, 19-variant-jepang-field-map
Peran: SATU-SATUNYA dokumen spec variant Jepang.

## Prinsip

```text
Variant Jepang = website B2B trust-building untuk calon partner perusahaan Jepang.
CTA utama: LINE Official Account.
CTA sekunder: email bisnis untuk komunikasi formal.
Bukan translation dari variant Indonesia.
Tidak ada form publik, lead inbox, SEO manual, page builder, pilihan "Lainnya".
Tenant mengisi konten, theme menjaga layout.
Font tambahan: Noto Sans JP untuk konten bahasa Jepang.
```

## Routes

```text
/                      → Homepage
/about                 → Tentang Kami
/training-method       → Metode Pelatihan
/candidate-profile     → Profil Kandidat
/recruitment-network   → Jaringan Rekrutmen
/sectors               → Sector Page
/sectors/[slug]        → Sector Detail
/news                  → News Page
/news/[slug]           → News Detail
/contact               → Contact Page
```

## CMS Menu

```text
Variant Jepang
  Dashboard Ringkas
  Global
    Brand & Header
    LINE & Business Contact
    Footer
  Pages
    Homepage
    Tentang Kami
    Metode Pelatihan
    Profil Kandidat
    Jaringan Rekrutmen
    Contact
    News Page
    Sector Page
  Collections
    News / Blog
    Sector
  Option Data
  Media & Documents
```

## Global - Brand & Header

config_key: `brand_header`

```text
brand
  lpk_name               String, required
  tagline                 String
  logo_image_id           MediaAsset ref
  logo_light_image_id     MediaAsset ref

topbar
  location_label          String
  email_label             String
  business_hours_label    String
  is_enabled              Boolean

navbar[]
  key                     about | training_method | candidate_profile | news | recruitment_network | sectors | contact
  label                   String
  href                    String
  is_enabled              Boolean
  sort_order              Int

header_primary_cta
  label                   String
  type                    "line"
  line_message_template   String

header_secondary_cta
  label                   String
  type                    "document" | "internal_link"
  document_file_id        MediaAsset ref
  href                    String
  is_enabled              Boolean

header_behavior
  sticky_header           Boolean, default true
  header_style            "solid" | "transparent_on_hero"
```

Rules: Header tidak memiliki dropdown pada MVP. CTA utama header adalah LINE. CTA sekunder dapat berupa Download Profile atau Curriculum.

## Global - LINE & Business Contact

config_key: `line_business_contact`

```text
line_contact
  line_official_account_id  String
  line_display_label        String
  default_message_template  String
  is_enabled                Boolean

business_email
  email                     String
  default_subject_template  String
  is_enabled                Boolean

business_contact_note
  short_note                String

business_info
  phone_label               String
  address                   String
  map_url                   String
  operational_hours         String
  language_support[]        String[]

documents
  company_profile_file_id   MediaAsset ref
  curriculum_file_id        MediaAsset ref

social_links
  line                      String
  linkedin                  String
  youtube                   String
  instagram                 String
```

Rules: LINE menjadi channel utama. Email untuk dokumen formal. Social link kosong tidak ditampilkan.

## Global - Footer

config_key: `footer`

```text
brand
  logo_image_id           MediaAsset ref
  lpk_name                String
  short_description       String

company_links[]
  key                     about | recruitment_network | training_method
  label, href, is_enabled, sort_order

resource_links[]
  key                     candidate_profile | sectors | news | curriculum
  label, href, document_file_id, is_enabled, sort_order

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
  media_type              "image" | "video" | "slider"
  media_id                MediaAsset ref
  slider_media_ids[]      MediaAsset ref[]
  headline                String, required
  subheadline             String
  eyebrow_label           String

stats[]                                 [required, min 3, max 6]
  icon_key, value, label, sort_order, is_enabled

achievements[]                          [recommended, max 6]
  icon_key, title, description
  document_label, document_url
  sort_order, is_enabled

latest_news                             [recommended]
  source: "latest_published"
  max_items: 4

why_indonesia_section                   [recommended]
  image_id, eyebrow_label, headline, description
  bullet_items[]
  cta_label, target_page: "candidate_profile"

why_us_cards[]                          [required, default 4]
  key: about | recruitment_network | sectors | training_method
  icon_key, title, description, href
  sort_order, is_enabled

legalities[]                            [optional, max 8]
  type_label, title, description
  document_label, document_url
  sort_order, is_enabled

final_cta                               [required]
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_href
```

## Page - Tentang Kami

page_key: `tentang_kami`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

proof_stats[]                           [recommended]
  value, label, sort_order, is_enabled

story                                   [required]
  image_id, eyebrow_label, headline, body

timeline[]                              [recommended]
  year_label, title, description, sort_order, is_enabled

vision_mission                          [required]
  vision_headline, vision_description
  mission_headline, mission_description

values[]                                [recommended]
  icon_key, title, description, sort_order, is_enabled

facilities[]                            [optional]
  title, description, image_id, sort_order, is_enabled

team_members[]                          [recommended]
  name, role, bio, image_id, sort_order, is_enabled

legal_overview[]                        [optional]
  type_label, title, description
  document_label, document_url, sort_order, is_enabled

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_href
```

## Page - Metode Pelatihan

page_key: `metode_pelatihan`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

curriculum_download                     [optional]
  headline, description, file_id, button_label, is_enabled

training_pillars[]                      [required, min 3, max 6]
  icon_key, title, description, sort_order, is_enabled

training_flow[]                         [required, min 3, max 6]
  step_label, title, description, sort_order, is_enabled

curriculum_areas[]                      [recommended]
  icon_key, title, description, sort_order, is_enabled

evaluation_items[]                      [recommended, min 3, max 6]
  icon_key, title, description, sort_order, is_enabled

training_gallery[]                      [optional]
  media_id, title, description, sort_order, is_enabled

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_document_file_id
```

## Page - Profil Kandidat

page_key: `profil_kandidat`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

proof_stats[]                           [recommended]
  value, label, sort_order, is_enabled

why_indonesia                           [required]
  image_id, headline, description, bullet_items[]

candidate_strengths[]                   [required]
  icon_key, title, description, sort_order, is_enabled

supported_pathways[]                    [recommended]
  pathway_label, title, description, sort_order, is_enabled

candidate_examples[]                    [optional]
  profile_label, title, description, image_id, sort_order, is_enabled

readiness_framework[]                   [recommended]
  icon_key, title, description, sort_order, is_enabled

partner_perspective                     [optional]
  quote, attribution_label, is_enabled

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_href
```

Rules: Candidate examples adalah representative profile, bukan data pribadi kandidat aktif.

## Page - Jaringan Rekrutmen

page_key: `jaringan_rekrutmen`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

proof_stats[]                           [recommended]
  value, label, sort_order, is_enabled

network_overview                        [required]
  map_image_id, headline, description

coverage_regions[]                      [recommended]
  region_name, description, sort_order, is_enabled

recruitment_sources[]                   [recommended]
  icon_key, title, description, sort_order, is_enabled

screening_flow[]                        [recommended]
  step_label, title, description, sort_order, is_enabled

network_nodes[]                         [optional]
  region_label, title, description, image_id, sort_order, is_enabled

quality_control_items[]                 [recommended]
  icon_key, title, description, sort_order, is_enabled

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_href
```

## Page - Sector Page

page_key: `sector_page`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

filter_config
  enable_sector_category_filter

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_document_file_id
```

Data: published sectors, sorted: featured → sort_order → terbaru.

## Page - News Page

page_key: `news_page`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

filter_config
  enable_category_filter, enable_tag_filter

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_href
```

Data: published news, sorted: featured → published_at terbaru.

## Page - Contact

page_key: `contact`

```text
hero
  media_type, media_id, headline, subheadline, eyebrow_label

contact_channels                        [required]
  line_official_account_id, line_cta_label, line_message_template
  business_email, email_subject_template

partnership_pic                         [optional]
  name, role, photo_image_id, description

business_info                           [required]
  business_hours, language_support[], address, map_url, map_embed_url

inquiry_flow[]                          [recommended]
  icon_key, title, description, sort_order, is_enabled

final_cta
  headline, description
  primary_cta_label, primary_line_message_template
  secondary_cta_label, secondary_document_file_id
```

Rules: Tidak ada public contact form. LINE menjadi contact utama.

## Collection - Sector

collection_key: `sector`

```text
IDENTITY
  title, slug, subtitle, short_description, overview
  thumbnail_image_id, hero_image_id
  status: draft | published
  is_featured, sort_order

CLASSIFICATION
  sector_category_option_id

SECTOR CONTENT
  suitability_items[], example_positions[]
  training_alignment_items[], candidate_requirements[]
  process_items[]

CTA
  primary_cta_label, line_message_template
  secondary_cta_label, secondary_document_file_id
```

Rules: Sector bukan lowongan aktif — ini katalog kapasitas LPK. Tidak ada expired_at.

## Collection - News

collection_key: `news`

```text
IDENTITY
  title, slug, subtitle, excerpt, cover_image_id
  status: draft | published
  is_featured, published_at, reading_time_label, sort_order

CLASSIFICATION
  category_option_id, tag_option_ids[]

AUTHOR
  author_name, author_title, author_image_id

CONTENT BLOCKS[]
  type: heading | paragraph | quote | image | youtube_embed | line_cta | sector_callout
  sort_order, data

RELATED ARTICLES
  source: same_category | same_tags | manual
  manual_news_ids[], max_items: 3
```

Content block types Jepang:

```text
heading:       { level: h2|h3, text }
paragraph:     { text }
quote:         { text, author? }
image:         { image_id, alt_text, caption? }
youtube_embed: { video_id, caption? }
line_cta:      { label, line_message_template }
sector_callout:{ sector_id }
```

## Option Sets

```text
japan_news_category:     ニュース, イベント, お知らせ, パートナー訪問, 研修活動, 候補者派遣
japan_news_tag:          (seeded minimal, tenant tambah sendiri)
japan_sector_category:   製造業, 建設業, 農業, 介護, 食品加工, 外食業, 宿泊業
japan_candidate_pathway: 技能実習, 特定技能, 技術・人文知識・国際業務
japan_language_support:  日本語, English, Bahasa Indonesia
```

## Section Classification

```text
PAGE                  | SECTION              | CLASSIFICATION
──────────────────────────────────────────────────────────────
Homepage              | hero                 | required
Homepage              | stats                | required
Homepage              | achievements         | recommended
Homepage              | latest_news          | recommended
Homepage              | why_indonesia        | recommended
Homepage              | why_us_cards         | required
Homepage              | legalities           | optional
Homepage              | final_cta            | required
Tentang Kami          | hero                 | required
Tentang Kami          | proof_stats          | recommended
Tentang Kami          | story                | required
Tentang Kami          | timeline             | recommended
Tentang Kami          | vision_mission       | required
Tentang Kami          | values               | recommended
Tentang Kami          | facilities           | optional
Tentang Kami          | team_members         | recommended
Tentang Kami          | legal_overview       | optional
Tentang Kami          | final_cta            | required
Metode Pelatihan     | hero                 | required
Metode Pelatihan     | curriculum_download  | optional
Metode Pelatihan     | training_pillars     | required
Metode Pelatihan     | training_flow        | required
Metode Pelatihan     | curriculum_areas     | recommended
Metode Pelatihan     | evaluation_items     | recommended
Metode Pelatihan     | training_gallery     | optional
Metode Pelatihan     | final_cta            | required
Profil Kandidat      | hero                 | required
Profil Kandidat      | proof_stats          | recommended
Profil Kandidat      | why_indonesia        | required
Profil Kandidat      | candidate_strengths  | required
Profil Kandidat      | supported_pathways   | recommended
Profil Kandidat      | candidate_examples   | optional
Profil Kandidat      | readiness_framework  | recommended
Profil Kandidat      | partner_perspective  | optional
Profil Kandidat      | final_cta            | required
Jaringan Rekrutmen   | hero                 | required
Jaringan Rekrutmen   | proof_stats          | recommended
Jaringan Rekrutmen   | network_overview     | required
Jaringan Rekrutmen   | coverage_regions     | recommended
Jaringan Rekrutmen   | recruitment_sources  | recommended
Jaringan Rekrutmen   | screening_flow       | recommended
Jaringan Rekrutmen   | network_nodes        | optional
Jaringan Rekrutmen   | quality_control      | recommended
Jaringan Rekrutmen   | final_cta            | required
Sector Page          | hero                 | required
Sector Page          | filter               | required
Sector Page          | final_cta            | required
News Page            | hero                 | required
News Page            | filter               | required
News Page            | final_cta            | required
Contact              | hero                 | required
Contact              | contact_channels     | required
Contact              | partnership_pic      | optional
Contact              | business_info        | required
Contact              | inquiry_flow         | recommended
Contact              | final_cta            | required
```

## Not In MVP

```text
Public inquiry form, lead inbox, LINE Messaging API backend, newsletter,
comment system, SEO manual, page builder, HTML/script, icon input bebas,
pilihan "Lainnya", job listing variant Jepang, upload dokumen kandidat publik.
```
