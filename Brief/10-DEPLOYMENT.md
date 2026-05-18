# 10 - Deployment

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 16-env-infra (enhanced)

## Infrastructure

```text
Hosting:        Vercel (serverless)
Database:       Supabase PostgreSQL (connection pooling via PgBouncer)
Storage:        Cloudflare R2 (S3-compatible, zero egress)
Rate Limiting:  Upstash Redis
Monitoring:     Sentry
DNS:            Cloudflare (recommended, for R2 custom domain)
```

## Environment Variables

### .env.example

```bash
# ─── Database (Supabase) ──────────────────────
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ─── Auth (Auth.js v5) ────────────────────────
AUTH_SECRET="openssl-rand-base64-32-result"
TOTP_ENCRYPTION_KEY="openssl-rand-hex-32-result"
SETUP_SECRET="random-string-for-initial-super-admin-setup"

# ─── Domain Routing ───────────────────────────
SUPER_ADMIN_DOMAIN="admin.yourdomain.com"
DASHBOARD_DOMAIN="dashboard.yourdomain.com"

# ─── Cloudflare R2 ────────────────────────────
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="lpk-media"
R2_PUBLIC_URL="https://media.yourdomain.com"

# ─── Upstash Redis ────────────────────────────
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-rest-token"

# ─── Sentry ───────────────────────────────────
SENTRY_DSN="https://xxx@sentry.io/xxx"

# ─── App ──────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Variable Classification

```text
SECRET (never expose to client):
  DATABASE_URL, DIRECT_URL, AUTH_SECRET, TOTP_ENCRYPTION_KEY, SETUP_SECRET
  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, UPSTASH_REDIS_REST_TOKEN

SERVER-ONLY (used in server code):
  R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_PUBLIC_URL
  UPSTASH_REDIS_REST_URL
  SUPER_ADMIN_DOMAIN, DASHBOARD_DOMAIN
  SENTRY_DSN

PUBLIC (safe for client):
  NEXT_PUBLIC_APP_URL
  NODE_ENV
```

## Supabase Setup

```text
1. Create Supabase project (free tier atau Pro)
2. Region: ap-southeast-1 (Singapore) for Asia
3. Get connection strings:
   - DATABASE_URL = pooled connection (port 6543, ?pgbouncer=true)
   - DIRECT_URL = direct connection (port 5432)
4. Enable PgBouncer (default on Supabase)
5. Run Prisma migrations: npx prisma migrate deploy
6. Run seed: npx prisma db seed
```

## Cloudflare R2 Setup

```text
1. Create Cloudflare account
2. Go to R2 → Create bucket: "lpk-media"
3. Enable public access:
   - R2 bucket settings → Public Access → Enable
   - Get r2.dev URL atau setup custom domain
4. Custom domain (recommended):
   - R2 bucket → Settings → Custom Domains → Add "media.yourdomain.com"
   - Cloudflare DNS auto-configured
5. Create R2 API Token:
   - R2 → Manage R2 API Tokens → Create API Token
   - Permissions: Object Read & Write
   - Specify bucket: lpk-media
   - Save Access Key ID + Secret Access Key
6. Configure CORS:
   - R2 bucket → Settings → CORS Policy
   - Add rule:
     AllowedOrigins: ["https://dashboard.yourdomain.com", "http://localhost:3000"]
     AllowedMethods: ["PUT"]
     AllowedHeaders: ["Content-Type"]
     MaxAgeSeconds: 3600
```

## Upstash Redis Setup

```text
1. Create Upstash account (free tier: 10K commands/day)
2. Create Redis database
3. Region: ap-southeast-1 (closest to Supabase)
4. Get REST URL + REST Token
5. Set env variables
```

## Vercel Deployment

```text
1. Connect GitHub repo to Vercel
2. Set environment variables (all from .env.example)
3. Build settings:
   Framework: Next.js
   Build command: npx prisma generate && next build
   Output directory: .next
4. Add domains:
   admin.yourdomain.com
   dashboard.yourdomain.com
   (tenant domains added later)
5. Deploy
```

### Vercel Domain Management

```text
Adding tenant domain:
  1. Super admin adds domain in panel
  2. Domain status: PENDING
  3. Tenant configures DNS → CNAME to cname.vercel-dns.com
  4. Super admin adds domain in Vercel project settings
  5. Vercel auto-provisions SSL
  6. Super admin verifies in panel → status: ACTIVE
```

## Local Development

### Prerequisites

```text
Node.js 22 LTS
npm 10+
Git
```

### Setup

```bash
# Clone
git clone <repo-url>
cd nextcmslpk

# Install
npm install

# Setup env
cp .env.example .env.local
# Edit .env.local with your Supabase + R2 + Upstash credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Edit hosts file (run as admin)
# Add to C:\Windows\System32\drivers\etc\hosts:
#   127.0.0.1  admin.lpk.local
#   127.0.0.1  dashboard.lpk.local
#   127.0.0.1  hit-indonesia.lpk.local
#   127.0.0.1  hit-japan.lpk.local

# Update .env.local
# SUPER_ADMIN_DOMAIN=admin.lpk.local:3000
# DASHBOARD_DOMAIN=dashboard.lpk.local:3000

# Start dev server
npm run dev

# Access:
#   http://admin.lpk.local:3000        → Super Admin
#   http://dashboard.lpk.local:3000    → Tenant Dashboard
#   http://hit-indonesia.lpk.local:3000 → Public Indonesia
#   http://hit-japan.lpk.local:3000    → Public Japan
```

## CI/CD Pipeline

```text
Trigger: push to main branch

Steps:
  1. Install dependencies
  2. Run type check: npx tsc --noEmit
  3. Run linter: npx next lint
  4. Run tests (if any)
  5. Prisma generate
     # CATATAN: prisma migrate di Prisma 7 tidak auto-generate dan
     # tidak auto-seed. Jalankan generate dan seed secara eksplisit.
  6. Build: next build
  7. Deploy to Vercel (auto via Vercel GitHub integration)

Branch strategy:
  main           → production
  staging        → staging (optional, separate Vercel project)
  feature/*      → preview deployments (Vercel auto)
```

## Post-Deploy Checklist

```text
[ ] Super admin initial setup completed
[ ] TOTP configured for super admin
[ ] First tenant created with seed data
[ ] Tenant domains configured and verified
[ ] R2 bucket accessible with correct CORS
[ ] Rate limiting verified (Upstash dashboard shows hits)
[ ] Sentry receiving errors (test with intentional error)
[ ] Cache revalidation working (publish → check public site)
[ ] SSL certificates provisioned for all domains
[ ] Hosts file cleaned up (remove local entries)
[ ] SETUP_SECRET removed or rotated after initial setup
```

## Monitoring

```text
Sentry:
  - Server errors, client errors, unhandled rejections
  - Environment tags: production, staging
  - Release tracking via Vercel integration

Vercel Analytics:
  - Web Vitals (LCP, FID, CLS)
  - Function execution time
  - Edge function invocations

Uptime:
  - UptimeRobot (free tier) or similar
  - Monitor: public homepage, dashboard login, super admin login
  - Alert: email on downtime
```

## Scaling Notes

```text
MVP designed for:
  10-50 tenants
  ~1000 visitors/month/tenant
  ~100 media files/tenant

If scaling beyond:
  Supabase: upgrade to Pro ($25/mo) for more connections + bandwidth
  R2: free tier handles much more (10GB storage, unlimited egress)
  Upstash: upgrade if >10K commands/day ($0.2/100K commands)
  Vercel: upgrade if >100GB bandwidth/month or need more serverless invocations
```
