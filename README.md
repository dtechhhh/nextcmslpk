# nextcmslpk
Multi-tenant CMS for LPK

## Local Development

Tambahkan domain lokal berikut ke hosts file.

Windows:

```text
C:\Windows\System32\drivers\etc\hosts
```

Isi:

```text
127.0.0.1  admin.lpk.local
127.0.0.1  dashboard.lpk.local
127.0.0.1  hit-indonesia.lpk.local
127.0.0.1  hit-japan.lpk.local
```

Pastikan `.env.local` berisi:

```env
SUPER_ADMIN_DOMAIN=admin.lpk.local:3000
DASHBOARD_DOMAIN=dashboard.lpk.local:3000
```

Jalankan development server:

```bash
npm run dev
```

Route lokal:

```text
http://admin.lpk.local:3000       -> /super-admin/*
http://dashboard.lpk.local:3000   -> /dashboard/*
http://hit-indonesia.lpk.local:3000 -> /site/*
http://hit-japan.lpk.local:3000     -> /site/*
```
