# 01 - Product

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 00-brief, 01-product-spec, 09-roadmap, 11-lead-management, 12-analytics

## Product Vision

Vertical SaaS CMS khusus LPK (Lembaga Pelatihan Kerja) yang mengirim tenaga kerja Indonesia ke Jepang. Platform multi-tenant yang memungkinkan setiap LPK memiliki company profile profesional tanpa perlu developer.

## Target User

Primary:

- Calon siswa Indonesia yang ingin bekerja di Jepang (Variant Indonesia).
- Calon partner perusahaan Jepang yang ingin merekrut tenaga kerja Indonesia (Variant Jepang).

Secondary:

- Operator LPK (Tenant Admin) yang mengelola konten.
- Platform owner (Super Admin) yang mengelola semua tenant.

## Client Pertama

```text
Nama:   Hashimoto Indo Trust (HIT)
Logo:   Globe biru + pesawat merah, inisial "HIT"
Brand:  Sky Blue (#4FB5E5) + Red (#E53935)
```

## Core Problem & Solution

Problem:

- LPK kecil-menengah tidak punya budget/skill untuk buat website profesional.
- Website LPK existing umumnya tidak mobile-friendly dan tidak terupdate.
- Calon siswa sulit membandingkan program antar LPK.
- Partner Jepang sulit menilai kredibilitas LPK tanpa presence digital yang baik.

Solution:

- CMS terstruktur yang menghasilkan website LPK profesional secara otomatis.
- Tenant admin hanya mengisi konten — layout, keamanan, dan performa dijaga oleh platform.
- Dua variant (Indonesia B2C + Jepang B2B) dalam satu tenant.

## MVP Scope

### Roles

```text
Super Admin:
  - Mengelola semua tenant
  - CRUD tenant, domain, variant, theme
  - Membuat akun tenant admin
  - Melihat audit log

Tenant Admin:
  - Mengelola konten tenant sendiri
  - Mengelola global config, pages, collections, option data, media
  - Publish / unpublish content
  - 1 tenant admin per tenant pada MVP

Public Viewer:
  - Melihat published content
  - Klik CTA WhatsApp / LINE
  - Tidak login, tidak ada akun
```

### Operating Model MVP

```text
- Manual-first operation.
- Super admin membuat tenant secara manual.
- Tidak ada self-service signup.
- Tidak ada billing/subscription.
- Domain tenant diverifikasi manual oleh super admin.
- Follow-up inquiry dilakukan manual oleh tenant admin via WhatsApp/LINE.
```

### Variant Indonesia

```text
Tujuan:    Konversi calon siswa Indonesia
Audience:  B2C — individu usia 18-30 tahun
Tone:      Hangat, profesional, accessible
CTA:       WhatsApp prefilled message
Halaman:   Homepage, Program, Job, Blog, Offer, Tentang Kami, Karir
```

### Variant Jepang

```text
Tujuan:    Trust building untuk partner Jepang
Audience:  B2B — HR manager, recruiter, perusahaan Jepang
Tone:      Formal, terpercaya, corporate
CTA:       LINE Official Account + email bisnis
Halaman:   Homepage, About, Training Method, Candidate Profile,
           Recruitment Network, Sectors, News, Contact
```

## Inquiry Strategy

### WhatsApp (Indonesia)

```text
URL pattern:  https://wa.me/{number}?text={encoded_message}
Number format: 628xxxxxxxxxx (tanpa + atau spasi)

Message template per context:
  Homepage CTA:    "Halo {lpk_name}, saya tertarik dengan program pelatihan kerja ke Jepang."
  Program detail:  "Halo {lpk_name}, saya tertarik dengan program {program_name}."
  Job detail:      "Halo {lpk_name}, saya ingin melamar lowongan {job_title} di {company}."
  Offer detail:    "Halo {lpk_name}, saya tertarik dengan penawaran {offer_title}."
  Karir detail:    "Halo {lpk_name}, saya ingin melamar posisi {karir_title}."
  Floating WA:     "{default_message_template}" (konfigurasi global)

Placeholder:
  {lpk_name}      → dari brand global config
  {program_name}  → dari content item title
  {job_title}     → dari content item title
  {company}       → dari content item data (company_name)
  {offer_title}   → dari content item title
  {karir_title}   → dari content item title
```

### LINE (Jepang)

```text
URL pattern:  https://line.me/R/oaMessage/{line_id}/?{encoded_message}
Fallback:     https://page.line.me/{line_id} (jika deep link tidak support)

Message template per context:
  Homepage CTA:       "{lpk_name}のウェブサイトからお問い合わせです。"
  Sector detail:      "{sector_name}分野の人材についてお問い合わせです。"
  Contact page:       "御社のサービスについて詳しく知りたいです。"
  General inquiry:    "{default_message_template}"
```

### Email (Jepang — formal fallback)

```text
Pattern:  mailto:{email}?subject={encoded_subject}&body={encoded_body}
Dipakai untuk: dokumen formal, follow-up bisnis, contract discussion
```

Aturan:

- Tidak ada public form pada MVP.
- Tidak ada lead inbox otomatis.
- Tidak ada backend API untuk WhatsApp/LINE.
- Semua CTA adalah outbound link saja.

## Analytics Strategy

### MVP: Client-Side Only

```text
Provider:   Google Analytics 4 (via next/script)
Setup:      1 GA4 property per tenant (opsional, dikelola tenant sendiri)
Tracking:   Otomatis via GA4 default events
```

### Auto-Track Events (jika GA4 aktif)

```text
page_view       → otomatis
cta_click       → WhatsApp click, LINE click, download click
filter_use      → collection filter interaction
scroll_depth    → 25%, 50%, 75%, 100%
```

### SEO Auto-Generation

```text
CMS tenant tidak memiliki menu SEO. Metadata dihasilkan otomatis:

title:          {page_headline} | {lpk_name}
description:    {subheadline} atau {excerpt} (max 160 chars)
og:image:       {hero_image} atau {thumbnail_image}
canonical:      {current_url}
robots:         index, follow (published) / noindex (draft/preview)
```

## MVP Milestones

```text
Phase 0 — Foundation
  Repository setup, Next.js scaffold, Prisma config, env validation.

Phase 1 — Database & Helpers
  Prisma migration, seed, tenant-scoped helpers, media upload to R2.

Phase 2 — Auth
  Auth.js credentials + TOTP, role-based access, idle timeout, rate limiting.

Phase 3 — Super Admin CMS
  Tenant CRUD, domain mapping, theme assignment, audit log viewer.

Phase 4 — Tenant Dashboard
  Global config, page editors, collection editors, media library, preview.

Phase 5 — Public Renderer
  Domain resolver, theme rendering, cache/revalidation, public routes.

Phase 6 — Testing & QA
  E2E tenant isolation, security tests, performance audit.

Phase 7 — Deploy & Harden
  Staging deploy, production deploy, monitoring, post-launch hardening.
```

## Non-Goals MVP

```text
Fitur yang TIDAK masuk MVP:

- Billing / subscription / payment.
- Tenant self-service signup.
- Public lead form / inquiry form.
- Lead inbox / CRM automation.
- WhatsApp Business API backend.
- LINE Messaging API backend.
- Page builder / drag-and-drop layout.
- HTML/script bebas di konten.
- Hard delete tenant.
- Multi-user per tenant.
- Permission matrix granular.
- Custom theme upload oleh tenant.
- A/B testing.
- Newsletter / email marketing.
- Comment system.
- Multi-language (i18n) — variant bukan translation.
- SEO manual fields di CMS.
- Redis / distributed cache.
- Background jobs / queue.
- Pilihan "Lainnya" di dropdown.
```
