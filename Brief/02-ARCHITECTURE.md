# 02 - Architecture

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 02-architecture (enhanced)

## Architecture Principles

```text
1. Modular monolith — semua dalam 1 Next.js app, dipisahkan by folder.
2. Server-first — semua mutasi dan query sensitif di server.
3. Tenant isolation — query dashboard selalu filter tenant_id dari session.
4. Registry pattern — themes, pages, collections, icons, option sets dari codebase.
5. No public write — public site hanya membaca published content.
6. Convention over configuration — folder structure = routing, naming = contract.
```

## Tech Stack

```text
Runtime:        Node.js 22 LTS
Framework:      Next.js 16 (App Router)
Language:       TypeScript strict
Database:       PostgreSQL (Supabase)
ORM:            Prisma 7
Prisma Config:  prisma.config.ts (wajib di Prisma 7)
Auth:           Auth.js v5 (credentials + TOTP)
UI (dashboard): shadcn/ui + Tailwind CSS
UI (public):    Theme components (React + Tailwind)
Storage:        Cloudflare R2 (S3-compatible)
Rate Limiting:  Upstash Redis (@upstash/ratelimit)
Deployment:     Vercel
Monitoring:     Sentry
Font:           Inter + Noto Sans JP (Google Fonts)
```

## Application Shape

```text
4 surfaces dalam 1 Next.js app:

┌─────────────────────────────────────────────┐
│                 Next.js App                  │
├──────────┬───────────┬───────────┬──────────┤
│  Super   │  Tenant   │  Public   │  Public  │
│  Admin   │ Dashboard │ Indonesia │  Jepang  │
│  Panel   │           │  Website  │ Website  │
├──────────┴───────────┴───────────┴──────────┤
│         Server Actions / Resolvers           │
├──────────────────────────────────────────────┤
│        Prisma ORM + Tenant-Scoped DB         │
├──────────┬───────────────────────────────────┤
│ Supabase │        Cloudflare R2              │
│PostgreSQL│        (Media Storage)            │
└──────────┴───────────────────────────────────┘
```

## Multi-Tenant Model

### Domain Resolution Flow

```text
Request masuk:
  browser → Vercel → Next.js middleware

Middleware membaca host:
  host = request.headers.get("host")

Routing decision:
  if host == SUPER_ADMIN_DOMAIN    → rewrite ke /super-admin/*
  if host == DASHBOARD_DOMAIN      → rewrite ke /dashboard/*
  else                             → rewrite ke /site/* (public)
```

### Variant Resolution (Public Site)

```text
/site/[...path] layout:
  1. Ambil host dari headers
  2. Query: SELECT * FROM domains WHERE host = ? AND status = 'ACTIVE'
  3. Join: domain → variant → tenant
  4. Validasi: tenant.status == 'ACTIVE', variant.status == 'ACTIVE'
  5. Resolve theme dari variant.theme_key
  6. Pass { tenant, variant, theme, globalConfig } ke page components
```

## Middleware Strategy

### Next.js Middleware

```typescript
// proxy.ts — PSEUDOCODE (Next.js 16 proxy convention)
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const pathname = request.nextUrl.pathname

  if (host === process.env.SUPER_ADMIN_DOMAIN) {
    return NextResponse.rewrite(new URL(`/super-admin${pathname}`, request.url))
  }

  if (host === process.env.DASHBOARD_DOMAIN) {
    return NextResponse.rewrite(new URL(`/dashboard${pathname}`, request.url))
  }

  return NextResponse.rewrite(new URL(`/site${pathname}`, request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
}
```

### Local Development

```text
1. Edit hosts file (Windows: C:\Windows\System32\drivers\etc\hosts):

   127.0.0.1  admin.lpk.local
   127.0.0.1  dashboard.lpk.local
   127.0.0.1  hit-indonesia.lpk.local
   127.0.0.1  hit-japan.lpk.local

2. .env.local:

   SUPER_ADMIN_DOMAIN=admin.lpk.local:3000
   DASHBOARD_DOMAIN=dashboard.lpk.local:3000

3. Seed domain records:

   host: hit-indonesia.lpk.local:3000 → variant Indonesia
   host: hit-japan.lpk.local:3000     → variant Jepang
```

### Vercel Multi-Domain

```text
Vercel project settings → Domains:
  admin.yourdomain.com           → SUPER_ADMIN_DOMAIN
  dashboard.yourdomain.com       → DASHBOARD_DOMAIN
  hit-indonesia.example.com      → tenant domain (public)
  hit-japan.example.co.jp        → tenant domain (public)
```

## Folder Structure

```text
src/
  app/
    super-admin/              ← Super Admin panel routes
      layout.tsx
      page.tsx
      tenants/
      audit-log/
    dashboard/                ← Tenant Dashboard routes
      layout.tsx
      page.tsx
      indonesia/
      japan/
      media/
      account/
    site/                     ← Public site routes
      layout.tsx              ← domain resolver + theme provider
      page.tsx                ← homepage
      program/
      job/
      blog/
      offer/
      about/
      karir/
      sectors/
      news/
      contact/
    api/
      auth/[...nextauth]/
      upload/
    layout.tsx

  server/
    db/
      client.ts               ← Prisma client singleton
      tenant-scoped.ts         ← tenant-scoped wrapper
    actions/
      super-admin/
      tenant/
    resolvers/
      public.ts
      domain.ts
    services/
      auth.ts
      storage.ts               ← R2 upload/delete
      rate-limit.ts            ← Upstash rate limiter
      audit.ts

  themes/
    starter/
      registry.ts
      design-system/
      components/
      pages/

  lib/
    r2.ts                      ← R2 S3 client
    constants.ts
    errors.ts
    validations/

  types/
    index.ts

proxy.ts
```

## Registry Pattern

### Theme Registry

```typescript
export const starterTheme: ThemeRegistry = {
  key: "starter",
  name: "Starter Theme",
  indonesia: {
    homepage: HomePageIndonesia,
    programPage: ProgramPageIndonesia,
    // ...
  },
  japan: {
    homepage: HomePageJapan,
    aboutPage: AboutPageJapan,
    // ...
  },
  layouts: {
    indonesia: LayoutIndonesia,
    japan: LayoutJapan,
  }
}
```

### Icon Registry

```typescript
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  graduation_cap: GraduationCap,
  briefcase: Briefcase,
  plane: Plane,
  users: Users,
  building: Building,
  // ... ~30 icons
}
// Fallback: jika icon_key tidak ditemukan → HelpCircle
```

### Collection Registry

```typescript
export const COLLECTIONS_INDONESIA = [
  { key: "program", label: "Program", hasExpiry: false },
  { key: "job", label: "Info Job", hasExpiry: true },
  { key: "offer", label: "Offer", hasExpiry: true },
  { key: "blog", label: "Blog", hasExpiry: false },
  { key: "karir", label: "Karir", hasExpiry: true },
]

export const COLLECTIONS_JAPAN = [
  { key: "news", label: "News", hasExpiry: false },
  { key: "sector", label: "Sector", hasExpiry: false },
]
```

## Tenant-Scoped Database Access

Dashboard server actions WAJIB menggunakan tenant-scoped wrapper:

```typescript
// src/server/db/tenant-scoped.ts — PSEUDOCODE
export function tenantDb(session: AuthSession) {
  const tenantId = session.user.tenantId
  if (!tenantId) throw new AuthError("No tenant context")

  return {
    contentPage: {
      findMany: (args) => prisma.contentPage.findMany({
        ...args,
        where: { ...args?.where, tenantId }
      }),
      create: (args) => prisma.contentPage.create({
        data: { ...args.data, tenantId }
      }),
      update: (args) => {
        // validate ownership first, then update
      },
      delete: (args) => {
        // validate ownership first, then delete
      },
    },
    // repeat for contentItem, mediaAsset, variant, etc.
  }
}
```

Aturan:

- Dashboard folder: WAJIB pakai `tenantDb(session)`.
- Super admin folder: boleh pakai `prisma` langsung.
- Public resolver: pakai `prisma` dengan filter domain/variant/published.
- Direct `prisma` call di dashboard = P0 violation.

## Error Handling

### Error Classes

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) { super(message) }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("NOT_FOUND", `${resource} not found`, 404, { resource, id })
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403)
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super("VALIDATION_ERROR", "Validation failed", 422, { errors })
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("RATE_LIMITED", "Too many requests", 429)
  }
}
```

### User-Facing vs Developer Error

```text
User-facing:   "Email atau password salah" (generic, safe)
Developer log: "Login failed: user novan, reason: invalid_password, IP: x.x.x.x"

JANGAN expose ke user: stack trace, DB error, internal IDs, valid username hint.
```

## Pagination Contract

```text
Strategy:   offset-based
Default:    12 items per page
Maximum:    50 items per page

Response shape:
{
  items: T[]
  total: number
  page: number        // 1-indexed
  pageSize: number
  totalPages: number
}

URL:  /program?page=2&type=magang
Query: skip: (page - 1) * pageSize, take: pageSize
```

## Slugification Rules

```text
Algoritma slug generation:
  1. Lowercase seluruh string
  2. Transliterasi unicode ke ASCII (e.g. ü → u, ñ → n)
     - Jepang: slug WAJIB diisi manual (title Jepang tidak auto-transliterate)
  3. Trim whitespace awal/akhir
  4. Replace spasi dan underscore → hyphen (-)
  5. Remove karakter non-alphanumeric (kecuali hyphen)
  6. Collapse multiple hyphens → single hyphen
  7. Remove leading/trailing hyphens
  8. Max length: 80 karakter (truncate di word boundary)

Duplicate handling:
  - Unique constraint: [variantId, collectionKey, slug] untuk ContentItem
  - Unique constraint: [variantId, slug] untuk ContentPage
  - Jika slug sudah ada → append "-2", "-3", dst.
  - Check dilakukan saat create dan saat slug diedit manual

Implementasi:
  - Library: slugify (npm) atau custom function
  - Slug auto-generated dari title saat create
  - Slug editable di form (advanced section)
  - Slug IMMUTABLE setelah publish pertama (mencegah broken URLs)
  - Jika perlu ubah slug post-publish → unpublish dulu → edit → re-publish
```

## Validation Strategy

```text
Library: Zod (lihat DEC-020)

Schema structure:
  src/lib/validations/
    global/
      brand-header.ts           → schema dari brand_header config spec
      whatsapp-contact.ts       → schema dari whatsapp_contact config spec
      line-business-contact.ts  → schema dari line_business_contact config spec
      footer.ts                 → schema dari footer config spec
    pages/
      homepage.ts               → schema dari homepage dataJson
      program-page.ts           → ...
      (1 file per page_key)
    collections/
      program.ts                → schema dari program collection spec
      job.ts                    → ...
      (1 file per collection_key)
    shared/
      content-blocks.ts         → schema untuk blog/news content blocks
      media-upload.ts           → schema untuk upload request

Validation flow:
  1. Client form → Zod parse (client-side, instant feedback)
  2. Server action → Zod parse (server-side, security boundary)
  3. Prisma → database constraints (last line of defense)

Shared patterns:
  - requiredString = z.string().min(1, "Wajib diisi")
  - optionalString = z.string().optional().or(z.literal(""))
  - mediaRef = z.string().cuid().optional()
  - optionRef = z.string().cuid()
  - slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80)
  - sortableArray(itemSchema) = z.array(itemSchema.extend({ sort_order: z.number(), is_enabled: z.boolean() }))
```

## Media Upload Flow (Cloudflare R2)

```text
1. Client → Server Action: request presigned URL
   { fileName, contentType, fileSize }

2. Server validates:
   - Auth check + tenant context
   - Mime type: image/jpeg, image/png, image/webp, application/pdf
   - File size: image max 5MB, PDF max 10MB
   - Rate limit: max 20 uploads / min / tenant

3. Server generates:
   - mediaId = cuid()
   - storagePath = tenants/{tenantId}/media/{mediaId}.{ext}
   - presignedUrl = S3 PutObject signed URL (expires 10 min)
   - Saves MediaAsset record (status: UPLOADING)

4. Client → R2: PUT file directly (bypasses server)

5. Client → Server Action: confirm upload
   - Verifies file exists in R2
   - Updates MediaAsset status: ACTIVE
   - Returns public URL

Orphaned file policy (lihat DEC-019):
  - Jika confirm step gagal, file tetap di R2 tanpa record ACTIVE
  - MVP: accept orphans, manual cleanup via R2 dashboard
  - Dashboard Media Library: manual scan + delete selected cleanup candidates
  - MediaAsset records dengan status UPLOADING > 1 jam = kemungkinan orphan
  - ACTIVE media yang usage count = 0 dan berumur > 7 hari = kandidat unused cleanup
  - R2 object di prefix tenant tanpa record media = kandidat orphan object cleanup
  - Delete action wajib re-check reference count tepat sebelum hapus
  - Post-MVP: cron job delete UPLOADING records > 1 hour + R2 file cleanup
```

## Production Concerns

```text
- Vercel serverless cold start: ~200-500ms, acceptable for MVP.
- Supabase PgBouncer: enabled via DATABASE_URL.
- DIRECT_URL: migrations only (bypasses PgBouncer).
- R2 CDN: globally cached, no origin hit on repeat.
- next/image: auto-resize, WebP, lazy loading.
- Server Components default: minimal client JS.
```
