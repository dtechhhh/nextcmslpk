# 09 - Theme & Rendering

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 04-theme, 05-frontend (public rendering), 26-cache-strategy, theme-proposal, HIT brand

## Rendering Model

```text
Public site = fully server-rendered (SSR/SSG with ISR).
No client-side data fetching for public pages.
No client components except interactive UI (carousel, accordion, floating CTA).
All content resolved server-side from publishedDataJson.
```

## Domain → Theme Resolution

```text
1. Middleware rewrites ke /site/*
2. /site layout:
   a. Resolve domain → variant → tenant
   b. Get variant.themeKey (e.g. "starter")
   c. Get globalConfig per variant
   d. Load theme registry[themeKey]
   e. Pass { tenant, variant, theme, globalConfig } via React context
3. /site page:
   a. Get pageKey from URL mapping
   b. Query ContentPage where variantId + pageKey, status = PUBLISHED
   c. Read publishedDataJson
   d. Render theme.pages[pageKey](publishedDataJson, globalConfig)
```

## Default Theme: Starter

### Design Tokens

```text
CLIENT: Hashimoto Indo Trust (HIT)
LOGO:   Globe biru + pesawat merah, inisial "HIT"

SHARED NEUTRAL (SLATE):
  --neutral-50:   #f8fafc
  --neutral-100:  #f1f5f9
  --neutral-200:  #e2e8f0
  --neutral-300:  #cbd5e1
  --neutral-400:  #94a3b8
  --neutral-500:  #64748b
  --neutral-600:  #475569
  --neutral-700:  #334155
  --neutral-800:  #1e293b
  --neutral-900:  #0f172a
  --neutral-950:  #020617

VARIANT INDONESIA (BRAND BLUE — from HIT globe):
  --primary-50:   #eef7fc
  --primary-100:  #d4ecf9
  --primary-200:  #a9d9f3
  --primary-300:  #72c2eb
  --primary-400:  #4fb5e5     ← brand blue (logo)
  --primary-500:  #2e9fd6     ← primary UI
  --primary-600:  #2184b8     ← primary hover
  --primary-700:  #186a96

  --secondary-400: #ef5350
  --secondary-500: #e53935    ← brand red (from airplane)
  --secondary-600: #c62828

  --whatsapp:     #25D366     ← CTA utama

VARIANT JEPANG (DEEP NAVY — corporate authority):
  --primary-50:   #eef2ff
  --primary-100:  #e0e7ff
  --primary-200:  #c7d2fe
  --primary-300:  #a5b4fc
  --primary-400:  #818cf8
  --primary-500:  #1e3a5f     ← primary
  --primary-600:  #162d4a     ← primary hover
  --primary-700:  #0f2035

  --accent-red:   #e53935     ← shared brand red (sparingly)
  --line:         #06C755     ← CTA utama

STATUS (shared):
  --success:      #22c55e
  --warning:      #f59e0b
  --error:        #ef4444
  --info:         #3b82f6
```

### Brand Red Usage

```text
Indonesia:
  Badge "Promo Aktif" pada offer
  Badge "Segera Ditutup" pada job mendekati deadline
  Hover accent pada navbar
  Active state indicator
  Offer banner gradient accent

Jepang:
  Topbar accent line (garis tipis)
  Badge "New" pada news terbaru
  Subtle brand marker saja
```

### Typography

```text
PRIMARY:    Inter (body, UI)
JAPANESE:   Noto Sans JP (konten Jepang)
Source:     Google Fonts via next/font

Scale:
  --text-xs:    0.75rem / 1rem
  --text-sm:    0.875rem / 1.25rem
  --text-base:  1rem / 1.5rem
  --text-lg:    1.125rem / 1.75rem
  --text-xl:    1.25rem / 1.75rem
  --text-2xl:   1.5rem / 2rem
  --text-3xl:   1.875rem / 2.25rem
  --text-4xl:   2.25rem / 2.5rem
  --text-5xl:   3rem / 1.15

Weight:
  --font-normal:    400
  --font-medium:    500
  --font-semibold:  600
  --font-bold:      700
```

### Spacing & Shape

```text
Section padding:  py-16 md:py-20 lg:py-24
Container:        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Card radius:      rounded-xl (12px)
Button radius:    rounded-lg (8px)
Input radius:     rounded-md (6px)
Badge radius:     rounded-full
Shadow card:      0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
Shadow lg:        0 10px 25px rgba(0,0,0,0.1)
```

## Shared Section Components

22 komponen shared dipakai oleh kedua variant:

```text
# | Component              | Fungsi
──────────────────────────────────────────────
1  | HeroSection           | Hero headline + CTA + media
2  | HeroSlider            | Hero carousel (JP homepage)
3  | StatsBar              | Statistik 3-6 items
4  | CardGrid              | Grid kartu 2-3 kolom
5  | CollectionList         | List/grid items + filter
6  | CollectionDetail       | Detail page layout
7  | StepFlow              | Alur langkah berurutan
8  | FAQ                   | Accordion FAQ
9  | TestimonialCarousel   | Slider testimonial
10 | TeamGrid              | Grid foto + nama + role
11 | FacilityGallery       | Gallery gambar fasilitas
12 | Timeline              | Timeline vertikal
13 | CTABanner             | Full-width CTA section
14 | OfferBanner           | Highlight offer/promo
15 | ContactInfo           | Info kontak + peta
16 | FloatingCTA           | Tombol floating (WA/LINE)
17 | ContentBlocks         | Renderer block artikel
18 | RelatedItems          | Grid item terkait
19 | FilterBar             | Filter dropdown horizontal
20 | EmptyState            | Pesan list kosong + CTA
21 | ExpiredBadge          | Badge item expired
22 | DocumentDownload      | Tombol download + icon
```

### Component Props Pattern

```typescript
// Setiap component menerima data yang sudah resolved oleh server:
interface HeroSectionProps {
  mediaType: "image" | "video"
  mediaSrc: string           // resolved R2 URL
  headline: string
  subheadline?: string
  eyebrowLabel?: string
  primaryCTA?: {
    label: string
    href: string             // wa.me/... atau line.me/...
    variant: "whatsapp" | "line" | "default"
  }
  secondaryCTA?: { label: string; href: string }
  overlay?: boolean
}
```

## Visual Tone

### Indonesia

```text
Personality:  Hangat, profesional, accessible
Background:   Light (neutral-50 / white)
Section alt:  primary-50 / neutral-100 (bergantian)
Text:         neutral-900 (heading), neutral-600 (body)
CTA:          WhatsApp green (#25D366)
Accent:       Brand red untuk badge/promo
Cards:        White, shadow-card, rounded-xl
Hero:         Gradient overlay pada gambar, teks putih
Header:       Sticky, transparent→solid on scroll
Footer:       bg-neutral-900, text-white
```

### Jepang

```text
Personality:  Formal, terpercaya, corporate
Background:   White utama
Section alt:  White / neutral-50 / primary-700 (dark section)
Text:         neutral-900 (heading), neutral-600 (body)
CTA:          LINE green (#06C755)
Accent:       Brand red hanya di topbar line
Cards:        White, border neutral-200, rounded-xl
Hero:         Clean, minimal overlay
Topbar:       bg-primary-700, text-white (email, hours, location)
Header:       Sticky, solid, 2 CTA
Footer:       bg-neutral-900, text-white
```

## Page Compositions

### Indonesia Homepage

```text
Header (sticky, transparent→solid)
HeroSection (full-width, overlay, 2 CTA)
OfferBanner [optional]
StatsBar [required]
CardGrid (trust cards) [required]
CardGrid (featured programs) [required]
CollectionList (latest jobs, compact) [recommended]
StepFlow [recommended]
TestimonialCarousel [optional]
FAQ [recommended]
CardGrid (latest blogs) [recommended]
ContactInfo + CTABanner [required]
Footer
FloatingCTA (WhatsApp, fixed bottom-right)
```

### Japan Homepage

```text
Topbar (email, hours, location)
Header (sticky, LINE + Download CTA)
HeroSlider / HeroSection
StatsBar [required]
CardGrid (achievements) [recommended]
Split layout (Why Indonesia) [recommended]
CardGrid (why us, navigational) [required]
CardGrid (latest news) [recommended]
CardGrid (legalities) [optional]
CTABanner (dark variant) [required]
Footer
```

Full page compositions for all pages: refer to 05-VARIANT-INDONESIA.md and 06-VARIANT-JAPAN.md section classification tables.

## Responsive Strategy

```text
Breakpoints:
  Mobile:   < 640px    → 1 column, stacked, CTA full-width
  Tablet:   640-1024px → 2 columns, cards side-by-side
  Desktop:  > 1024px   → 3 columns, sidebar on detail pages

Per component:
  HeroSection:     mobile: text below image | desktop: overlay/side-by-side
  CardGrid:        mobile: 1 col | tablet: 2 col | desktop: 3 col
  CollectionList:  mobile: 1 col, filter as sheet | desktop: horizontal filter bar
  Detail page:     mobile: stacked | desktop: main + sidebar
  StepFlow:        mobile: vertical | desktop: horizontal
  FAQ:             mobile: full-width | desktop: max-w-3xl centered
  TeamGrid:        mobile: 2 col | desktop: 4 col
```

## Image Optimization

```text
All images via next/image:
  - Automatic srcset generation (responsive sizes)
  - Automatic WebP conversion
  - Lazy loading (default)
  - Blur placeholder (optional, from low-res version)
  - Priority loading for hero images only

Configuration:
  // next.config.js
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: R2_PUBLIC_DOMAIN, pathname: '/tenants/**' }
    ]
  }

Image sizes:
  Hero:        1920x1080 (priority, sizes="100vw")
  Card thumb:  400x300 (lazy, sizes="(max-width: 640px) 100vw, 33vw")
  Team avatar: 200x200 (lazy, sizes="200px")
  Gallery:     800x600 (lazy)
  Logo:        200x80 (priority)
```

## Cache & Revalidation Strategy

### Public Site

```text
Cache-Control: set via Next.js revalidation

Page level:
  Homepage:        revalidate = 60 seconds (ISR)
  Collection list: revalidate = 60 seconds
  Detail page:     revalidate = 3600 seconds (1 hour)
  Static pages:    revalidate = 3600 seconds

Media (R2): cached by Cloudflare CDN automatically (immutable paths)
```

### On-Demand Revalidation

```text
Trigger: after Publish / Unpublish action in dashboard

Tag strategy:
  tenant:{tenantId}                            → revalidate ALL tenant pages
  variant:{variantId}                          → revalidate variant pages
  page:{variantId}:{pageKey}                   → revalidate specific page
  collection:{variantId}:{collectionKey}       → revalidate collection list
  item:{variantId}:{collectionKey}:{slug}      → revalidate detail page

Publish page → revalidateTag("page:{variantId}:{pageKey}")
Publish item → revalidateTag("collection:{variantId}:{collectionKey}") +
               revalidateTag("item:{variantId}:{collectionKey}:{slug}")
Update global config → revalidateTag("variant:{variantId}")
```

### Dashboard

```text
Cache-Control: no-store (dynamic, never cached)
Always fetch fresh data.
```

### Anti-Stampede

```text
ISR handles thundering herd:
  - First request after revalidation triggers regeneration
  - Subsequent requests get stale page until regeneration completes
  - No cache stampede possible

Fine-grained tags prevent over-invalidation:
  - Publish 1 blog → only blog list + that blog detail revalidated
  - NOT homepage, NOT all pages
  - Homepage revalidated only when homepage page is published
```

## State Pages

```text
NotFoundPage:      domain valid, page/item not found → 404
SuspendedPage:     tenant suspended → "Site under maintenance"
UnavailablePage:   variant disabled → 404
ExpiredBadge:      item expired → show badge on detail, disable CTA
```

### Visual Spec — State Pages

```text
LAYOUT (shared untuk semua state pages):
  - Full viewport height (min-h-screen), centered content
  - Container max-w-md, text-center
  - Minimal: NO header, NO footer, NO sidebar
  - Background: neutral-50 (light)

NotFoundPage (404):
  Visual:
    - Ilustrasi: large "404" text (text-8xl, font-bold, primary-200)
    - Heading: "Halaman Tidak Ditemukan" (ID) / "ページが見つかりません" (JP)
    - Subtext: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan."
    - CTA button: "Kembali ke Beranda" → href="/"
  Styling:
    - Heading: text-2xl, font-semibold, neutral-900
    - Subtext: text-base, neutral-500
    - CTA: primary button (variant-specific color)
    - Spacing: gap-6 antara elemen

SuspendedPage:
  Visual:
    - Icon: wrench/tool icon (dari Lucide, 64px, neutral-400)
    - Heading: "Situs Dalam Pemeliharaan"
    - Subtext: "Situs ini sedang dalam pemeliharaan. Silakan coba lagi nanti."
    - NO CTA (tidak ada link karena seluruh site suspended)
  Styling:
    - Same as 404 but tanpa CTA button
    - Icon: neutral-400

UnavailablePage:
  Visual:
    - Same layout as 404
    - Heading: "Halaman Tidak Tersedia"
    - Subtext: "Konten yang Anda cari saat ini tidak tersedia."
    - CTA: "Kembali ke Beranda" → href="/"

ExpiredBadge (bukan full page, tapi komponen di detail page):
  Visual:
    - Badge inline: background warning-50, border warning-200, text warning-700
    - Text: "Lowongan Sudah Ditutup" / "Penawaran Sudah Berakhir"
    - Position: di bawah judul, sebelum content
    - CTA button: disabled state (opacity-50, cursor-not-allowed, no hover effect)
    - Tooltip on disabled CTA: "Lowongan ini sudah tidak tersedia"
```

## Codebase Structure

```text
src/themes/starter/
  design-system/
    tokens.ts                ← color, font, spacing tokens
    variants.ts              ← Indonesia vs Japan overrides
  components/
    layout/
      Header.tsx             ← shared shell
      HeaderIndonesia.tsx    ← WA CTA, variant switch
      HeaderJapan.tsx        ← topbar, LINE + download
      Footer.tsx             ← shared shell
      FooterIndonesia.tsx
      FooterJapan.tsx
    sections/
      HeroSection.tsx ... (all 22 components)
    ui/
      Button.tsx             ← extends shadcn, WA/LINE variants
      Badge.tsx, Card.tsx, Container.tsx
  pages/
    indonesia/
      HomePage.tsx ... (11 pages)
    japan/
      HomePage.tsx ... (10 pages)
    shared/
      NotFoundPage.tsx, SuspendedPage.tsx, UnavailablePage.tsx
  registry.ts                ← theme_key → component mapping
```

## Build Strategy (Agent PRs)

```text
PR 1: Design system tokens + shared UI (Button, Card, Container, Badge)
PR 2: Section components batch 1 (Hero, Stats, CardGrid, StepFlow, FAQ, CTA)
PR 3: Section components batch 2 (Testimonial, Team, Timeline, Filter, ContentBlocks, etc)
PR 4: Layout + Indonesia pages (Header ID, Footer ID, all ID pages)
PR 5: Layout + Japan pages (Header JP, Footer JP, all JP pages)
PR 6: State pages + registry + cache integration
```
