# 04 - Auth & Security

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 07-auth-multitenant, 13-security, 14-observability, 15-testing-strategy

## Roles

```text
Super Admin:
  - tenantId: null
  - Mengelola semua tenant, domain, variant, theme
  - Membuat tenant admin
  - Melihat audit log global
  - Akses: /super-admin/*

Tenant Admin:
  - tenantId: {tenant_id}
  - Mengelola konten tenant sendiri
  - Tidak bisa akses tenant lain
  - Akses: /dashboard/*

Public Viewer:
  - Tidak login
  - Melihat published content
  - Akses: public site (semua domain selain admin/dashboard)
```

## Auth Model

```text
Provider:       Auth.js v5
Strategy:       Credentials (username + password + TOTP code)
Session type:   JWT (stateless)
Token storage:  HttpOnly cookie
```

### JWT Payload Shape

```typescript
interface JWTPayload {
  userId: string
  username: string
  role: "SUPER_ADMIN" | "TENANT_ADMIN"
  tenantId: string | null
  securityStamp: string
  lastActivity: number      // Unix timestamp ms
}
```

### Session Shape (Client Accessible)

```typescript
interface SessionUser {
  userId: string
  username: string
  role: "SUPER_ADMIN" | "TENANT_ADMIN"
  tenantId: string | null
}
```

## Auth Flows

### Super Admin Initial Setup

```text
Trigger: GET /super-admin/setup ketika 0 super admin di database

Flow:
  1. Cek database → jika sudah ada super admin → redirect ke login
  2. Validasi SETUP_SECRET dari environment
  3. Input: username, password (min 12 chars)
  4. Generate TOTP secret → tampilkan QR code
  5. User scan QR → input TOTP code → verifikasi
  6. Create user: role=SUPER_ADMIN, totpVerified=true
  7. Setup terkunci selamanya

Rules:
  - SETUP_SECRET hanya dipakai sekali
  - Setelah super admin pertama dibuat, endpoint setup return 404
  - Password hash: bcrypt (via bcryptjs)
  - TOTP secret: encrypted via TOTP_ENCRYPTION_KEY (AES-256)
```

### Login Flow

```text
1. Input: username + password
2. Server: find user, compare password hash
3. Jika valid → minta TOTP code
4. Input: 6-digit TOTP code
5. Server: verify TOTP code
6. Jika valid → check mustChangePassword
7. Jika mustChangePassword → redirect ke change password
8. Jika tidak → issue JWT, redirect ke dashboard

Error response (generic): "Username atau password salah"
  → JANGAN beri hint apakah username valid
```

### Tenant Admin Provisioning

```text
1. Super admin membuat tenant admin:
   - Input: username, temporary password
   - System: generate TOTP secret + QR
   - System: set mustChangePassword = true, totpVerified = false

2. Tenant admin login pertama:
   - Login dengan temporary password
   - Redirect ke change password form
   - Input password baru (min 12 chars)
   - Redirect ke TOTP setup
   - Scan QR + verify code
   - Set mustChangePassword = false, totpVerified = true
   - Login complete
```

### Idle Timeout (20 Minutes)

```text
Client-side:
  - Track last user interaction (click, keypress, scroll)
  - Store lastActivity timestamp di localStorage
  - Check setiap 60 detik: if (now - lastActivity > 20 min) → logout

Server-side:
  - JWT callback: set lastActivity = Date.now() di token
  - Setiap dashboard server action: update lastActivity di JWT
  - Auth.js jwt callback: if (now - token.lastActivity > 20 min) → return null

Catatan:
  - Idle = tidak ada interaksi user, BUKAN tidak ada request
  - Tab inactive tetap dihitung idle
  - Multiple tabs: per-tab tracking via localStorage
```

## Security Stamp

```text
Tujuan: force-invalidate JWT tanpa database session store.

Field: User.securityStamp (String, default cuid())

Flow:
  Login → simpan user.securityStamp di JWT
  Dashboard mutation → compare JWT.securityStamp vs DB.securityStamp
  Mismatch → 401 + force re-login

Trigger:
  - Suspend tenant → update all tenant users securityStamp
  - Reset password → update user securityStamp
  - Reset TOTP → update user securityStamp
  - Deactivate user → update user securityStamp

Cost: 1 small query per dashboard mutation only.
Read-only dashboard pages DO NOT check securityStamp for MVP.
```

## Tenant Isolation

### Rules

```text
1. tenant_id SELALU dari session.user.tenantId, TIDAK dari request body/params
2. variant_id harus divalidasi milik tenant session
3. content_page harus divalidasi milik variant tenant
4. content_item harus divalidasi milik variant tenant
5. media_asset harus divalidasi milik tenant session
6. option_set/value harus divalidasi milik variant tenant
```

### Enforcement

```text
- Dashboard server actions WAJIB pakai tenantDb(session) wrapper
- tenantDb auto-injects tenantId ke setiap query
- Direct prisma call di dashboard folder = P0 violation
- Super admin pakai prisma langsung (all-tenant scope)
```

### Forbidden Patterns

```typescript
// ❌ SALAH — tenant_id dari request
const page = await prisma.contentPage.findUnique({
  where: { id: body.pageId }  // tidak ada tenantId check!
})

// ✅ BENAR — tenant_id dari session
const db = tenantDb(session)
const page = await db.contentPage.findUnique({
  where: { id: body.pageId }  // tenantId auto-injected
})
```

## Rate Limiting

### Provider: Upstash Redis

```text
SDK: @upstash/ratelimit + @upstash/redis
Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
```

### Rate Limit Table

```text
Endpoint                    | Window     | Max Attempts | Key
─────────────────────────────────────────────────────────────
Login                       | 15 min     | 5            | IP + username
TOTP verify                 | 5 min      | 3            | IP + username
Initial setup               | 15 min     | 3            | IP
Change password             | 15 min     | 5            | userId
Media upload                | 1 min      | 20           | tenantId
Dashboard mutation          | 1 min      | 60           | tenantId
Public page request         | none       | (Vercel WAF) | -
```

### Implementation Pattern

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const loginLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:login",
})

// Usage in server action
const key = `${ip}:${username}`
const { success } = await loginLimiter.limit(key)
if (!success) throw new RateLimitError()
```

## Media Upload Security

```text
Allowed mime types:
  image/jpeg
  image/png
  image/webp
  application/pdf

Size limits:
  Image:    max 5 MB
  Document: max 10 MB

Path pattern:
  tenants/{tenantId}/media/{mediaId}.{ext}
  tenants/{tenantId}/documents/{mediaId}.pdf

Validation:
  1. Server validates mime type (TIDAK percaya Content-Type header saja)
  2. Server validates file size
  3. Server generates mediaId (cuid) — JANGAN pakai filename asli
  4. Presigned URL expires 10 minutes
  5. After upload: server verifies file exists di R2
  6. Delete: hanya jika media tidak dipakai (check references)
```

## R2 Bucket Security

```text
Bucket: lpk-media
  Public read:  ✅ (untuk public site render)
  Public write: ❌
  Write method: presigned URL only (server-generated, time-limited)

Tenant isolation:
  Path-based: tenants/{tenant_id}/*
  Write: server validates tenantId dari session
  Delete: server validates media ownership sebelum delete

CORS:
  Allowed origins: dashboard domain, localhost
  Allowed methods: PUT (upload only)
  Max age: 3600
```

## Public Security

```text
Public site hanya:
  - GET published content (via publishedDataJson)
  - GET published collection list
  - Outbound WhatsApp/LINE link (client-side redirect)

Rules:
  - Tidak ada public write endpoint
  - Tidak ada HTML/script bebas di content
  - YouTube embed: validasi URL format, hanya video ID
  - Media: hanya dari R2 public URL
  - Unknown domain → 404
  - Suspended tenant → SuspendedPage
  - Disabled variant → 404
  - Expired item tetap accessible via detail URL (dengan badge)
```

## Audit Log

### Events Yang Wajib Diaudit

```text
tenant.create       | Super Admin membuat tenant baru
tenant.update       | Super Admin update tenant
tenant.suspend      | Super Admin suspend tenant
tenant.activate     | Super Admin activate tenant
domain.create       | Domain baru ditambahkan
domain.update       | Domain diubah
domain.verify       | Domain diverifikasi
domain.disable      | Domain dinonaktifkan
theme.update        | Theme variant diubah
user.create         | User baru (tenant admin) dibuat
user.reset_password | Password direset
user.reset_totp     | TOTP direset
content.publish     | Page/item dipublish
content.unpublish   | Page/item di-unpublish
media.upload        | Media diupload
media.delete        | Media dihapus
option.create       | Option value ditambahkan
option.update       | Option value diubah
option.disable      | Option value dinonaktifkan
```

### Audit Log Payload

```typescript
interface AuditLogEntry {
  tenantId: string | null
  userId: string
  action: string           // e.g. "content.publish"
  targetType: string       // e.g. "ContentPage"
  targetId: string | null
  metadata: {
    // context-specific
    pageKey?: string
    collectionKey?: string
    oldStatus?: string
    newStatus?: string
    [key: string]: unknown
  }
  ipAddress: string | null
}
```

## Observability

### Error Tracking

```text
Provider:  Sentry
Config:    SENTRY_DSN env variable
Scope:     Server errors, client errors, unhandled rejections
Data:      tenantId, userId, action, request path (NO password/secret)
```

### Structured Logging

```text
Format: JSON
Level:  info, warn, error
Fields: timestamp, level, message, tenantId, userId, action, duration

Log important events:
  - Login success/failure
  - Rate limit triggered
  - Auth errors
  - Database query errors
  - Media upload success/failure
  - Publish/unpublish actions
```

### Uptime Monitoring

```text
Monitor endpoints:
  - Public homepage per tenant domain
  - Dashboard login page
  - Super admin login page

Alert on: response time > 5s, status != 200
Provider: Vercel Analytics atau UptimeRobot (free tier)
```

## Required Security Tests

```text
Tenant Isolation:
  ✓ Tenant admin A tidak bisa read/write tenant B data
  ✓ Tenant admin A tidak bisa akses media tenant B
  ✓ Direct prisma call tanpa tenantId di dashboard → error

Auth:
  ✓ Login salah 6x dalam 15 menit → rate limited
  ✓ TOTP salah 4x dalam 5 menit → rate limited
  ✓ mustChangePassword redirect berfungsi
  ✓ Idle 21 menit → auto logout
  ✓ Suspend tenant → existing JWT rejected on mutation

Public:
  ✓ Draft content tidak tampil di public
  ✓ publishedDataJson = null → 404 di public
  ✓ Unknown domain → 404
  ✓ Suspended tenant → suspended page
  ✓ Disabled variant → 404
  ✓ Expired job/offer tidak tampil di listing aktif
  ✓ Expired detail page tampil dengan badge

Media:
  ✓ Upload menolak mime type invalid
  ✓ Upload menolak file > size limit
  ✓ Upload tanpa auth → rejected
  ✓ Presigned URL expired → rejected

Security Stamp:
  ✓ securityStamp mismatch → 401
  ✓ Reset password → old JWT rejected
```
