# Decisions Log

Status: Living Document
Tanggal mulai: 2026-05-14

## Format

Setiap keputusan dicatat dengan:

```text
ID:       DEC-XXX
Tanggal:  YYYY-MM-DD
Status:   Accepted | Superseded | Rejected
Konteks:  Mengapa keputusan ini perlu diambil
Keputusan: Apa yang diputuskan
Alasan:   Mengapa pilihan ini yang terbaik
Dampak:   Apa yang berubah akibat keputusan ini
```

---

## DEC-001: Next.js App Router (bukan Pages Router)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Perlu framework React dengan SSR/ISR + App Router.
Keputusan: Next.js 16 App Router.
Alasan:    Server Components default, built-in caching, server actions, ISR.
Dampak:    Semua routing menggunakan app/ directory.
```

## DEC-002: Supabase PostgreSQL (bukan PlanetScale/Neon)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Perlu managed PostgreSQL dengan free tier cukup untuk MVP.
Keputusan: Supabase (hanya database, bukan full Supabase ecosystem).
Alasan:    Free tier 500MB, PgBouncer built-in, Asia region, Prisma compatible.
Dampak:    Menggunakan Prisma ORM, bukan Supabase client untuk query.
```

## DEC-003: Cloudflare R2 (bukan Supabase Storage)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   LPK site image-heavy, 10+ tenant × 1000 visitor = significant egress.
Keputusan: Cloudflare R2 untuk media storage.
Alasan:    Zero egress fees, S3-compatible, built-in CDN, 10GB free storage.
           Supabase Storage: $0.09/GB egress setelah 5GB free.
Dampak:    Tambah @aws-sdk/client-s3, presigned URL upload flow.
           Supabase tetap dipakai untuk database.
```

## DEC-004: Auth.js v5 Credentials (bukan Supabase Auth)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Perlu auth dengan TOTP mandatory + JWT stateless.
Keputusan: Auth.js v5 dengan Credentials provider.
Alasan:    Full control atas flow, TOTP custom, securityStamp, idle timeout.
           Supabase Auth tidak mendukung mandatory TOTP untuk credentials.
Dampak:    Password hashing sendiri (bcrypt), TOTP sendiri (otpauth).
```

## DEC-005: publishedDataJson (bukan single dataJson)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Single dataJson = draft edits langsung bocor ke public view.
Keputusan: Tambah publishedDataJson field pada ContentPage dan ContentItem.
Alasan:    Atomic publish: tenant edit draft tanpa mempengaruhi live site.
           Publish = snapshot dataJson ke publishedDataJson.
Dampak:    Public renderer WAJIB baca publishedDataJson, bukan dataJson.
           Dashboard editor baca dataJson.
```

## DEC-006: Upstash Redis untuk Rate Limiting (bukan in-memory)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Vercel serverless = stateless, in-memory rate limit tidak berfungsi.
Keputusan: Upstash Redis dengan @upstash/ratelimit SDK.
Alasan:    Serverless-native, pay-per-use, REST API (no persistent connection).
           Free tier: 10K commands/day cukup untuk MVP.
Dampak:    Tambah env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN.
```

## DEC-007: Security Stamp (bukan database session)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Perlu force-invalidate JWT saat suspend/reset tanpa session store.
Keputusan: securityStamp field di User model, disimpan di JWT payload.
Alasan:    Ringan: 1 query per mutation untuk verify stamp match.
           Tidak perlu Redis session store atau database session table.
Dampak:    Suspend tenant → update all user stamps → existing JWT rejected.
```

## DEC-008: Tenant-Scoped Prisma Wrapper (bukan RLS)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Dashboard queries harus tenant-isolated, Supabase RLS terlalu tied.
Keputusan: Application-level tenant-scoped wrapper: tenantDb(session).
Alasan:    Type-safe, testable, ORM-agnostic, reviewable di code review.
           RLS: debugging sulit, Prisma bypass RLS secara default.
Dampak:    Dashboard folder WAJIB pakai tenantDb(session) untuk semua query.
```

## DEC-009: Fine-Grained Cache Tags (bukan broad invalidation)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Broad revalidation (revalidateTag(tenantId)) = cache stampede.
Keputusan: Granular tags: page:{variantId}:{pageKey}, collection:{...}, item:{...}.
Alasan:    Publish 1 blog → hanya invalidate blog list + blog detail.
           Tidak invalidate homepage, program page, dll.
Dampak:    Setiap publish/unpublish action memanggil tag spesifik.
```

## DEC-010: 1 Theme Codebase "Starter" (bukan 2 theme terpisah)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Dua variant (Indonesia + Jepang) membutuhkan visual berbeda.
Keputusan: 1 theme "starter" dengan shared components, variant-specific pages.
Alasan:    DRY: 22 section components shared, hanya page composition berbeda.
           Lebih mudah maintain, konsisten brand.
Dampak:    Theme structure: design-system/ + components/ + pages/indonesia/ + pages/japan/.
```

## DEC-011: HIT Brand Colors Sebagai Default

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Client pertama: Hashimoto Indo Trust, logo biru + merah.
Keputusan: Sky Blue (#4FB5E5) sebagai Indonesia primary, brand red (#E53935) sebagai accent.
           Deep Navy (#1e3a5f) sebagai Japan primary.
Alasan:    Blue dari globe logo = approachable professional.
           Red dari pesawat = dynamic energy, sparingly for badges.
           Navy = Japanese corporate authority.
Dampak:    Design tokens di 09-THEME-RENDERING.md sudah menggunakan warna ini.
```

## DEC-012: No-Goals Eksplisit

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Over-engineering risk: agent bisa menambah fitur yang tidak diminta.
Keputusan: Daftar eksplisit fitur yang TIDAK masuk MVP (lihat 01-PRODUCT.md).
Alasan:    Clarity > ambiguity. Agent punya batasan jelas.
Dampak:    No billing, no self-service, no form publik, no versioning, no Redis cache,
           no background jobs, no multi-user per tenant, no custom theme upload.
```

## DEC-013: Manual-First Operations

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   MVP = 1-10 tenants, managed by 1 super admin.
Keputusan: Semua operasi tenant bersifat manual (create, domain verify, user provision).
Alasan:    Tidak perlu automate yang belum ada volume.
           Self-service signup = security + billing complexity premature.
Dampak:    Tidak ada public signup, tidak ada billing, tidak ada auto domain verify.
```

## DEC-014: Global Config Langsung Live (No Draft/Publish)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   VariantGlobalConfig (header, footer, WhatsApp/LINE settings) tidak memiliki
           publishedDataJson dan status seperti ContentPage/ContentItem.
           Ini berarti setiap edit global config langsung live di public site.
Keputusan: Global config edits are immediately live — tidak ada draft/publish flow.
Alasan:    Global config jarang berubah (brand, contact info, footer).
           Menambah publishedDataJson ke global config = complexity yang tidak worth it untuk MVP.
           Tenant admin yang mengedit header/footer mengharapkan perubahan langsung terlihat.
Dampak:    VariantGlobalConfig hanya memiliki dataJson (no publishedDataJson).
           Public renderer membaca dataJson langsung dari VariantGlobalConfig.
           Agent TIDAK boleh menambah publish flow ke global config.
           Post-MVP: bisa ditambahkan jika ada kebutuhan preview global config.
```

## DEC-015: Preview Mode via Query Param

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Dashboard menyebut "preview" tapi tidak ada mekanisme yang didefinisikan.
           Tenant admin perlu melihat draft content sebelum publish.
Keputusan: Preview via public URL dengan query param ?preview=true&token={previewToken}.
Alasan:    Lebih simple daripada iframe in-dashboard.
           Tenant admin bisa lihat content persis seperti tampilan public.
           Token mencegah akses preview oleh public user.
Dampak:    Public resolver: jika ?preview=true → validate token → baca dataJson bukan publishedDataJson.
           Preview token di-generate per session, expire 1 jam.
           Preview TIDAK di-cache (no-store).
           Dashboard menampilkan tombol "Preview" yang membuka tab baru ke public URL + preview params.
```

## DEC-016: Blog Paragraph Plain Text Only (MVP)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Blog content block type "paragraph" didefinisikan sebagai plain text, no HTML.
           Ini berarti tidak ada bold, italic, link, atau formatting lain di paragraf.
Keputusan: Blog paragraph = plain text only. Tidak ada rich text editor di MVP.
Alasan:    Company profile blog tidak memerlukan rich formatting.
           Rich text editor = significant complexity (sanitization, XSS prevention, editor UX).
           Formatting tersedia via content block types lain: heading, quote, image, youtube.
Dampak:    Dashboard blog editor: paragraph input = textarea biasa.
           Agent TIDAK boleh implement rich text / WYSIWYG editor.
           Post-MVP: bisa ditambahkan content block type "rich_text" jika ada kebutuhan.
```

## DEC-017: Offer Tanpa Listing Page

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Routes mendefinisikan /offer/[slug] (detail) tapi TIDAK ADA /offer (listing page).
Keputusan: Offer tidak memiliki listing page terpisah. Offer hanya muncul via:
           - Homepage offer_section (featured/manual)
           - Blog Page offer_section (featured/manual)
           - Blog content block offer_callout
           Detail offer accessible via direct URL /offer/[slug].
Alasan:    Offer adalah promosi temporal, bukan katalog permanen.
           Surfacing via homepage + blog sudah cukup untuk discovery.
           Listing page terpisah = overhead tanpa value tambah untuk MVP.
Dampak:    Tidak ada route /offer di public site.
           Tidak ada page_key "offer_page" di ContentPage.
           Agent TIDAK boleh membuat offer listing page.
```

## DEC-018: Auto-Save Last Write Wins

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Dashboard auto-save debounced 1s, tapi tidak ada spec untuk concurrent editing.
           MVP = 1 tenant admin per tenant, concurrent edit sangat jarang.
Keputusan: Last write wins policy. Tidak ada optimistic locking di MVP.
Alasan:    MVP hanya 1 user per tenant, concurrent conflict hampir tidak mungkin.
           Optimistic locking (updatedAt check) = complexity premature.
Dampak:    Jika dua tab membuka editor yang sama, save terakhir menang.
           Agent TIDAK perlu implement conflict detection atau version check.
           Post-MVP: tambahkan updatedAt check + "Content has been modified" warning.
```

## DEC-019: Orphaned R2 Files — Manual Cleanup (MVP)

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Upload flow: client uploads to R2, then confirms. Jika confirm step gagal,
           file tetap ada di R2 tanpa record aktif di database.
Keputusan: Accept orphaned files di MVP. Cleanup manual via R2 dashboard atau Supabase query.
           Setelah implementasi dashboard cleanup, tenant admin bisa scan kandidat cleanup
           dari Media Library lalu menghapus resource terpilih.
Alasan:    Orphan rate sangat rendah (hanya terjadi jika upload sukses tapi confirm gagal).
           R2 free tier 10GB cukup besar untuk MVP.
           Cron job = complexity + infrastruktur tambahan.
Dampak:    MediaAsset records dengan status UPLOADING > 1 jam = kemungkinan orphan.
           Media Library cleanup menampilkan UPLOADING > 1 jam, ACTIVE unused > 7 hari,
           dan object R2 tanpa record media sebagai kandidat delete manual.
           Delete tetap melakukan re-check referensi sebelum hapus.
           Agent TIDAK perlu implement background cleanup job.
           Post-MVP: cron job to delete UPLOADING records > 1 hour + R2 file cleanup.
```

## DEC-020: Zod Validation dari Field Specs

```text
Tanggal:   2026-05-14
Status:    Accepted
Konteks:   Dokumen mendefinisikan field types + constraints (required, min length, format)
           tapi tidak ada referensi ke validation schema. Agent perlu membuat schema dari specs.
Keputusan: Zod sebagai validation library. Schema didefinisikan per form di codebase,
           derived dari field specs di variant dokumen (05, 06).
Alasan:    Type-safe, composable, excellent error messages.
           Zod schemas bisa di-share antara server actions dan client forms.
           Prisma types + Zod = full type safety dari form ke database.
Dampak:    Setiap server action memiliki Zod schema untuk input validation.
           Dashboard forms menggunakan Zod schema yang sama untuk client-side validation.
           Schema files: src/lib/validations/{collection-key}.ts, {page-key}.ts, {config-key}.ts.
           Refer ke variant docs (05, 06) untuk field constraints.
```

---

## DEC-021: Upgrade Tech Stack ke Versi Terbaru (Mei 2026)

```text
ID:       DEC-021
Tanggal:  2026-05-18
Status:   Accepted
Konteks:  Tech stack awal ditulis saat training data agent belum mencakup
          rilis terbaru. Audit manual dilakukan sebelum mulai coding
          untuk memastikan tidak ada breaking change yang terlewat.
Keputusan:
  - Next.js 15 → Next.js 16
    middleware.ts diganti proxy.ts, export function "middleware" → "proxy"
  - Prisma 6 → Prisma 7
    prisma.config.ts wajib, auto-seed dan auto-generate dihapus,
    generator output path wajib, Prisma Client sekarang ES module
  - Node.js 20 LTS → Node.js 22 LTS
    Node 20 sudah End-of-Life April 2026
  - next-auth@beta → next-auth@latest
    Auth.js v5 sudah stable sejak late 2024
Alasan:
  - Node 20 EOL berarti tidak ada security patch — wajib upgrade.
  - Next.js 16 memiliki breaking change proxy.ts yang jika tidak
    diupdate akan membuat seluruh multi-tenant routing gagal total.
  - Prisma 7 adalah versi default saat npm install dijalankan saat ini.
  - Auth.js v5 @beta tag menyebabkan agent menggunakan pola lama
    yang tidak kompatibel dengan Next.js 16.
Dampak:
  - Semua referensi middleware.ts di codebase → proxy.ts
  - Semua export function middleware → export function proxy
  - Auth.js wajib split config: auth.config.ts (edge) + auth.ts (server)
  - prisma.config.ts wajib ada di root project
  - Seed tidak auto-run setelah migrate — harus eksplisit
  - Import Prisma Client dari output path yang dikonfigurasi di schema
```
