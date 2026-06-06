# 08 - Tenant Dashboard

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 06-tenant-dashboard (enhanced)

## Route Structure

```text
/dashboard/login                        → Login page
/dashboard                              → Dashboard overview
/dashboard/indonesia                    → Indonesia variant workspace
/dashboard/indonesia/global/brand       → Brand & Header config
/dashboard/indonesia/global/whatsapp    → WhatsApp & Contact config
/dashboard/indonesia/global/footer      → Footer config
/dashboard/indonesia/pages/homepage     → Homepage editor
/dashboard/indonesia/pages/program      → Program Page editor
/dashboard/indonesia/pages/job          → Job Page editor
/dashboard/indonesia/pages/blog         → Blog Page editor
/dashboard/indonesia/pages/tentang-kami → Tentang Kami editor
/dashboard/indonesia/pages/karir        → Karir Page editor
/dashboard/indonesia/collections/program           → Program list
/dashboard/indonesia/collections/program/new       → Create program
/dashboard/indonesia/collections/program/[id]      → Edit program
/dashboard/indonesia/collections/job               → Job list
/dashboard/indonesia/collections/job/new           → Create job
/dashboard/indonesia/collections/job/[id]          → Edit job
/dashboard/indonesia/collections/offer             → Offer list
/dashboard/indonesia/collections/offer/new         → Create offer
/dashboard/indonesia/collections/offer/[id]        → Edit offer
/dashboard/indonesia/collections/blog              → Blog list
/dashboard/indonesia/collections/blog/new          → Create blog
/dashboard/indonesia/collections/blog/[id]         → Edit blog
/dashboard/indonesia/collections/karir             → Karir list
/dashboard/indonesia/collections/karir/new         → Create karir
/dashboard/indonesia/collections/karir/[id]        → Edit karir
/dashboard/indonesia/options                       → Option sets
/dashboard/japan                        → Japan variant workspace
/dashboard/japan/global/brand           → Brand & Header config
/dashboard/japan/global/line            → LINE & Business Contact config
/dashboard/japan/global/footer          → Footer config
/dashboard/japan/pages/homepage         → Homepage editor
/dashboard/japan/pages/tentang-kami     → Tentang Kami editor
/dashboard/japan/pages/metode-pelatihan → Metode Pelatihan editor
/dashboard/japan/pages/profil-kandidat  → Profil Kandidat editor
/dashboard/japan/pages/jaringan-rekrutmen → Jaringan Rekrutmen editor
/dashboard/japan/pages/contact          → Contact editor
/dashboard/japan/pages/news             → News Page editor
/dashboard/japan/pages/sector           → Sector Page editor
/dashboard/japan/collections/news              → News list
/dashboard/japan/collections/news/new          → Create news
/dashboard/japan/collections/news/[id]         → Edit news
/dashboard/japan/collections/sector            → Sector list
/dashboard/japan/collections/sector/new        → Create sector
/dashboard/japan/collections/sector/[id]       → Edit sector
/dashboard/japan/options                       → Option sets
/dashboard/media                        → Media library (shared)
/dashboard/account                      → Account settings
```

## Dashboard Overview

```text
Variant switcher: Indonesia | Japan tabs

Per variant:
  Quick stats:
    Published pages count / total pages
    Published collection items / total items
    Active offers (Indonesia only)
    Active jobs (Indonesia only)

  Quick actions:
    Go to Homepage editor
    Create new [collection item]
    View public site (link to primary domain, opens in new tab)

  Recent changes:
    Last 5 content updates by this tenant admin
```

## Page Editor

### Behavior

```text
1. Load page by tenantId + variantId + pageKey
2. Display form sesuai dataJson schema dari variant spec
3. Perubahan form ditandai sebagai unsaved changes
4. User menyimpan perubahan dengan tombol manual save
5. Save draft → update dataJson ONLY (publishedDataJson tidak berubah)
6. Publish button → copy dataJson ke publishedDataJson, set status PUBLISHED

Conflict policy (lihat DEC-018):
  - Last write wins. Tidak ada optimistic locking di MVP.
  - Jika dua tab membuka editor yang sama, save terakhir yang menang.
  - MVP = 1 user per tenant, concurrent conflict sangat jarang.
7. Unpublish → set status DRAFT (publishedDataJson tetap, tidak tampil di public)
```

### Form Construction

```text
Setiap section di page dirender sebagai collapsible form group:

  [v] Hero Section          ← collapsible header
    media_type: [image] [video]  ← radio/toggle
    media_id: [Image picker]     ← opens media library picker
    headline: [text input]
    subheadline: [textarea]
    primary_cta_label: [text input]
    primary_cta_whatsapp_message: [textarea]

  [v] Stats                 ← collapsible
    [sortable list]
      [ ] value: [input]  label: [input]  icon: [icon picker]
      [ ] value: [input]  label: [input]  icon: [icon picker]
      [+ Add stat]
```

### Input Components

```text
String          → Input text
Long text       → Textarea
Rich content    → Content Blocks editor (blog only)
Boolean         → Switch
Select          → Select dropdown (from OptionSet)
Multi select    → Checkbox group (tag_option_ids)
Image           → Media picker dialog (opens media library, filters IMAGE)
Document        → Media picker dialog (filters DOCUMENT)
Array           → Sortable list with add/remove
Date/time       → Date picker
Number          → Number input
Icon            → Icon picker (from ICON_REGISTRY, shows preview)
URL             → Input with URL validation
```

### Publishing Rules

```text
DRAFT:
  - dataJson = current editor data
  - publishedDataJson = null (never published) OR previous published data
  - Public site: not visible OR shows old published version

PUBLISHED:
  - publishedDataJson = snapshot of dataJson at publish time
  - Editing after publish → only dataJson changes
  - Re-publish → updates publishedDataJson

UNPUBLISH:
  - status = DRAFT
  - publishedDataJson retained but not served
  - Public site: 404 for this page
```

## Preview Mode

```text
Mekanisme (lihat DEC-015):
  Preview via public URL dengan query param.
  Tenant admin bisa lihat draft content persis seperti tampilan public.

Flow:
  1. Dashboard editor menampilkan tombol "Preview" di toolbar
  2. Klik Preview → server action generate previewToken (JWT, expire 1 jam)
  3. Buka tab baru ke: https://{public-domain}/{page-path}?preview=true&token={previewToken}
  4. Public resolver cek ?preview=true:
     a. Validate token (JWT verify, check expiry, check tenantId match)
     b. Jika valid → baca dataJson (bukan publishedDataJson)
     c. Jika invalid/expired → redirect ke halaman normal (publishedDataJson)
  5. Preview page menampilkan banner "PREVIEW MODE — Konten ini belum dipublish"

Rules:
  - Preview TIDAK di-cache (Cache-Control: no-store)
  - Preview token scoped ke tenantId (tidak bisa preview tenant lain)
  - Preview works untuk ContentPage DAN ContentItem
  - URL pattern ContentItem: /blog/[slug]?preview=true&token=...
  - Tombol Preview disabled jika dataJson belum pernah di-save
```

## Collection Editor

### Collection List

```text
Table columns:
  Thumbnail, title, status (badge), collection-specific info, updated_at, actions

Status badge colors:
  DRAFT:     gray
  PUBLISHED: green
  CLOSED:    orange (if applicable)
  FILLED:    blue (if applicable)

Actions per row:
  Edit (navigate to editor)
  Publish / Unpublish
  Delete (confirmation dialog)

Bulk actions: none for MVP

Filters:
  Status: All | Draft | Published
  Collection-specific filters (from option sets)

Sort: sort_order → updated_at (default)
Pagination: 12 per page
```

### Collection Item Editor

```text
Same behavior as page editor:
  1. Form sections based on collection schema
  2. Save draft → update dataJson only
  3. Publish → copy dataJson to publishedDataJson, set status PUBLISHED, set publishedAt
  4. Sidebar: status badge, dates, thumbnail preview

Additional for time-sensitive collections (job, offer, karir):
  expired_at: date picker (required for publish)
  start_at: date picker (offer only)
  Visual warning if expired_at is in the past

Additional for all:
  is_featured: switch
  sort_order: number input
  slug: auto-generated from title, editable
  thumbnail_image_id: media picker
  hero_image_id: media picker
```

## Content Blocks Editor (Blog / News)

```text
Sortable block list:
  Each block has:
    Type selector: [heading | paragraph | quote | image | youtube_embed | ...]
    Type-specific fields
    Delete button
    Drag handle for reorder

  [+ Add Block] button at bottom → opens block type selector

Block previews:
  heading:      bold text preview
  paragraph:    text preview (truncated)
  quote:        indented italic
  image:        thumbnail preview
  youtube:      video ID badge
  offer_callout / sector_callout: linked item title
  whatsapp_cta / line_cta: CTA button preview
```

## Media Library

```text
Route: /dashboard/media (shared across variants)

View: Grid (default) | List toggle
Sort: newest first
Filter: Image | Document | All

Per media card:
  Thumbnail preview (images) / file icon (documents)
  File name, size, dimensions, uploaded date
  Alt text (editable inline)
  Usage indicator: "Used in 3 items"
  Delete button (disabled if used, with tooltip "Remove from content first")

Upload:
  Drag & drop zone + file picker button
  Multi-file upload support
  Progress indicator per file
  Auto-convert to WebP (optional, via client-side before upload)
  Validates: mime type, file size before upload

Media picker (in editors):
  Modal with media library grid
  Filter: Image only / Document only
  Select → returns mediaId to form field
  Upload inline: can upload new while picking
```

## Option Data Manager

```text
Route: /dashboard/[variant]/options

Table of option sets:
  key, label, values count

Expand/edit option set:
  Sortable list of values
  Per value: label, value (auto-slug), isActive (switch)
  Add new value button
  Cannot delete value if used → deactivate instead

Rules:
  Value slug is immutable after creation
  Tenant can add values but not new option set keys (fixed by registry)
```

## Account Settings

```text
Route: /dashboard/account

Change Password:
  Current password → new password → confirm
  Min 12 chars, validate strength
  On success: update securityStamp → force re-login

View TOTP:
  Show TOTP verified status
  Cannot reset own TOTP (super admin does this)
```

## UI Framework

```text
Layout:
  Top header: tenant name, variant tabs (Indonesia | Japan), user menu
  Sidebar: variant-specific menu (Global, Pages, Collections, Options)
  Main content: editor/list area

Responsive:
  Desktop: sidebar + main
  Mobile: collapsible sidebar (sheet), full-width main

Components: shadcn/ui
  Form, Input, Textarea, Select, Switch, DatePicker
  Table, Pagination
  Dialog, AlertDialog, Sheet
  Tabs (variant switcher)
  Badge (status)
  Toast (notifications)
  Collapsible (section groups)
  DnD sortable (react-dnd or @hello-pangea/dnd for block/item ordering)

No custom theme — dashboard uses shadcn defaults.
```

## Authorization

```text
Every /dashboard/* route:
  1. Check session exists
  2. Check role === "TENANT_ADMIN"
  3. Check user.isActive === true
  4. Check tenant.status === "ACTIVE"
  5. If not → redirect to /dashboard/login or error page

Every mutation:
  1. Check securityStamp match (JWT vs DB)
  2. Use tenantDb(session) for all queries
  3. Validate variant ownership
```

## Performance Notes

```text
- Dashboard uses dynamic rendering (no cache, no-store)
- Forms use client components with server actions
- Media picker uses pagination (not load-all)
- Content blocks use lazy loading per block type
- Manual save untuk menghindari request panjang saat koneksi lambat
- Optimistic UI for publish/unpublish toggle
```
