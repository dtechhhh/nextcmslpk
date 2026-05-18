# 07 - Super Admin

Status: Accepted v1
Tanggal: 2026-05-14
Menggabungkan: 08-super-admin-panel (enhanced)

## Route Structure

```text
/super-admin/login          → Login page
/super-admin/setup          → Initial setup (one-time)
/super-admin                → Dashboard overview
/super-admin/tenants        → Tenant list
/super-admin/tenants/new    → Create tenant
/super-admin/tenants/[id]   → Tenant detail + edit
/super-admin/audit-log      → Audit log viewer
/super-admin/account        → Account settings (password, TOTP)
```

## Dashboard Overview

```text
Stats cards:
  Total tenants (active / suspended)
  Total domains (active / pending)
  Total media files
  Total published pages

Recent activity:
  Last 10 audit log entries (action, user, target, time)
```

## Tenant CRUD

### Tenant List

```text
Table columns:
  Name, slug, status (ACTIVE/SUSPENDED), variants count, domains count, created_at

Filters:
  Status: All | Active | Suspended

Actions:
  + Create Tenant (link to form)
  View (link to detail)
```

### Create Tenant

```text
Form fields:
  name           String, required, min 3
  slug           String, required, auto-generated from name, editable
                 format: lowercase, alphanumeric + dash
                 unique check on blur

On submit:
  1. Create Tenant record
  2. Create Variant Indonesia + Variant Japan (default starter theme)
  3. Create ContentCollections per variant (from registry)
  4. Create default OptionSets + OptionValues (from registry)
  5. Create empty ContentPages (from page_keys)
  6. Create default GlobalConfig records (empty JSON)
  7. Log audit: tenant.create

After create → redirect to tenant detail page
```

### Tenant Detail

```text
Tabs:
  General
    Edit name, slug (slug immutable after domain assigned)
    Status toggle: ACTIVE ↔ SUSPENDED
    Created at, updated at

  Variants
    Table: key, label, theme_key, status
    Actions:
      Toggle variant status: ACTIVE ↔ DISABLED
      Change theme: dropdown of available themes (starter only on MVP)

  Domains
    Table: host, status, isPrimary, verifiedAt
    Actions:
      + Add Domain (input host, set status PENDING)
      Verify Domain (set status ACTIVE, set verifiedAt)
      Set Primary
      Disable Domain
      Delete Domain (only if PENDING)

  Tenant Admin
    Table: username, isActive, totpVerified, mustChangePassword
    Actions:
      + Create Admin (auto-generates temporary password + TOTP QR)
      Reset Password (generates new temp, sets mustChangePassword=true)
      Reset TOTP (generates new secret, sets totpVerified=false)
      Deactivate / Activate user
    Rules: max 1 tenant admin per tenant on MVP

  Audit Log (tenant-scoped)
    Last 50 entries for this tenant
    Filter by action type
```

### Suspend Tenant

```text
Action: toggle status ACTIVE → SUSPENDED

Effects:
  1. All public domains for this tenant → show SuspendedPage
  2. Tenant admin cannot login (securityStamp invalidated)
  3. All tenant users securityStamp updated → existing JWT rejected
  4. Dashboard shows "Tenant Suspended" notice
  5. Audit log: tenant.suspend

Reactivate: toggle SUSPENDED → ACTIVE
  1. Domains kembali serve content
  2. Tenant admin perlu login ulang (securityStamp sudah baru)
  3. Audit log: tenant.activate
```

## Domain Management

### Domain Lifecycle

```text
PENDING  → super admin menambahkan, belum terverifikasi
ACTIVE   → diverifikasi, domain serve public content
DISABLED → dinonaktifkan sementara, domain return 404

Verification: manual oleh super admin (cek DNS sudah pointing)
```

### Domain Rules

```text
- 1 host = 1 variant (unique constraint)
- Minimal 1 ACTIVE domain per variant untuk public render
- isPrimary dipakai untuk canonical URL
- host tidak boleh sama dengan SUPER_ADMIN_DOMAIN atau DASHBOARD_DOMAIN
- host format: valid hostname tanpa protocol
```

## Audit Log Viewer

```text
Table columns:
  timestamp, action, user.username, targetType, targetId, metadata preview

Filters:
  Tenant: All | specific tenant
  Action: all | tenant.* | content.* | user.* | media.*
  Date range: last 7 days | 30 days | custom

Pagination: 50 per page, offset-based
Sort: newest first (default)
```

## Account Settings

```text
Change Password:
  - Current password + new password (min 12 chars) + confirm
  - Updates securityStamp

Reset TOTP:
  - Current password confirmation
  - Generate new TOTP secret + QR
  - Verify new TOTP code
  - Updates securityStamp
```

## UI Framework

```text
Layout:
  Sidebar (collapsible) + main content area
  Sidebar items: Overview, Tenants, Audit Log, Account

Components: shadcn/ui
  Table, Form, Dialog, Badge, Button, Card
  Toast for success/error notifications
  AlertDialog for destructive actions (suspend, delete domain)
  Sheet for mobile sidebar

No custom theme needed — dashboard uses shadcn/ui defaults.
```

## Authorization Checks

```text
Every /super-admin/* route:
  1. Check session exists
  2. Check role === "SUPER_ADMIN"
  3. If not → redirect to /super-admin/login

Setup endpoint:
  Only accessible when user count with role SUPER_ADMIN === 0
  Requires SETUP_SECRET env variable match
```
