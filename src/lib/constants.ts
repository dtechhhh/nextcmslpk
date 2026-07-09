export const COLLECTIONS_INDONESIA = [
  { key: "program", label: "Program", hasExpiry: false },
  { key: "job", label: "Info Job", hasExpiry: true },
  { key: "offer", label: "Offer", hasExpiry: true },
  { key: "blog", label: "Blog", hasExpiry: false },
  { key: "karir", label: "Karir", hasExpiry: true },
] as const;

export const COLLECTIONS_JAPAN = [
  { key: "news", label: "News", hasExpiry: false },
  { key: "sector", label: "Sector", hasExpiry: false },
] as const;

export const PAGE_KEYS_INDONESIA = [
  "homepage",
  "program_page",
  "job_page",
  "blog_page",
  "tentang_kami",
  "karir_page",
] as const;

export const PAGE_KEYS_JAPAN = [
  "homepage",
  "tentang_kami",
  "metode_pelatihan",
  "profil_kandidat",
  "jaringan_rekrutmen",
  "sector_page",
  "news_page",
  "contact",
] as const;

export const CONFIG_KEYS_INDONESIA = [
  "brand_header",
  "whatsapp_contact",
  "footer",
] as const;

export const CONFIG_KEYS_JAPAN = [
  "brand_header",
  "line_business_contact",
  "footer",
] as const;

export const RATE_LIMITS = {
  login: {
    endpoint: "Login",
    window: "15 min",
    windowSeconds: 15 * 60,
    maxAttempts: 5,
    key: "IP + username",
  },
  totpVerify: {
    endpoint: "TOTP verify",
    window: "5 min",
    windowSeconds: 5 * 60,
    maxAttempts: 3,
    key: "IP + username",
  },
  initialSetup: {
    endpoint: "Initial setup",
    window: "15 min",
    windowSeconds: 15 * 60,
    maxAttempts: 3,
    key: "IP",
  },
  changePassword: {
    endpoint: "Change password",
    window: "15 min",
    windowSeconds: 15 * 60,
    maxAttempts: 5,
    key: "userId",
  },
  mediaUpload: {
    endpoint: "Media upload",
    window: "1 min",
    windowSeconds: 60,
    maxAttempts: 20,
    key: "tenantId",
  },
  dashboardMutation: {
    endpoint: "Dashboard mutation",
    window: "1 min",
    windowSeconds: 60,
    maxAttempts: 60,
    key: "tenantId",
  },
  publicPageRequest: {
    endpoint: "Public page request",
    window: "none",
    windowSeconds: null,
    maxAttempts: null,
    key: "-",
  },
} as const;

export type IndonesiaCollectionKey =
  (typeof COLLECTIONS_INDONESIA)[number]["key"];
export type JapanCollectionKey = (typeof COLLECTIONS_JAPAN)[number]["key"];
export type CollectionKey = IndonesiaCollectionKey | JapanCollectionKey;
export type IndonesiaPageKey = (typeof PAGE_KEYS_INDONESIA)[number];
export type JapanPageKey = (typeof PAGE_KEYS_JAPAN)[number];
export type PageKey = IndonesiaPageKey | JapanPageKey;
export type IndonesiaConfigKey = (typeof CONFIG_KEYS_INDONESIA)[number];
export type JapanConfigKey = (typeof CONFIG_KEYS_JAPAN)[number];
export type ConfigKey = IndonesiaConfigKey | JapanConfigKey;
