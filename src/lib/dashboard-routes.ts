import type { VariantKey } from "@/types";

export type DashboardVariant = VariantKey;

export type DashboardRouteItem = {
  label: string;
  href: string;
};

export type DashboardCollectionRoute = DashboardRouteItem & {
  key: string;
  createHref: string;
};

export type DashboardVariantConfig = {
  label: string;
  workspaceHref: string;
  global: DashboardRouteItem[];
  pages: DashboardRouteItem[];
  collections: DashboardCollectionRoute[];
  optionsLabel: string;
  optionsHref: string;
  mediaLabel: string;
};

export const DEFAULT_DASHBOARD_VARIANT: DashboardVariant = "indonesia";

export const DASHBOARD_VARIANTS: Record<
  DashboardVariant,
  DashboardVariantConfig
> = {
  indonesia: {
    label: "Indonesia",
    workspaceHref: "/dashboard/indonesia",
    global: [
      {
        label: "Brand & Header",
        href: "/dashboard/indonesia/global/brand",
      },
      {
        label: "WhatsApp & Contact",
        href: "/dashboard/indonesia/global/whatsapp",
      },
      {
        label: "Footer",
        href: "/dashboard/indonesia/global/footer",
      },
    ],
    pages: [
      {
        label: "Homepage",
        href: "/dashboard/indonesia/pages/homepage",
      },
      {
        label: "Program Page",
        href: "/dashboard/indonesia/pages/program",
      },
      {
        label: "Job Page",
        href: "/dashboard/indonesia/pages/job",
      },
      {
        label: "Blog Page",
        href: "/dashboard/indonesia/pages/blog",
      },
      {
        label: "Tentang Kami",
        href: "/dashboard/indonesia/pages/tentang-kami",
      },
      {
        label: "Karir Page",
        href: "/dashboard/indonesia/pages/karir",
      },
    ],
    collections: [
      {
        key: "program",
        label: "Program",
        href: "/dashboard/indonesia/collections/program",
        createHref: "/dashboard/indonesia/collections/program/new",
      },
      {
        key: "job",
        label: "Job",
        href: "/dashboard/indonesia/collections/job",
        createHref: "/dashboard/indonesia/collections/job/new",
      },
      {
        key: "offer",
        label: "Offer",
        href: "/dashboard/indonesia/collections/offer",
        createHref: "/dashboard/indonesia/collections/offer/new",
      },
      {
        key: "blog",
        label: "Blog",
        href: "/dashboard/indonesia/collections/blog",
        createHref: "/dashboard/indonesia/collections/blog/new",
      },
      {
        key: "karir",
        label: "Karir",
        href: "/dashboard/indonesia/collections/karir",
        createHref: "/dashboard/indonesia/collections/karir/new",
      },
    ],
    optionsLabel: "Option Data",
    optionsHref: "/dashboard/indonesia/options",
    mediaLabel: "Media Library",
  },
  japan: {
    label: "Japan",
    workspaceHref: "/dashboard/japan",
    global: [
      {
        label: "Brand & Header",
        href: "/dashboard/japan/global/brand",
      },
      {
        label: "LINE & Business Contact",
        href: "/dashboard/japan/global/line",
      },
      {
        label: "Footer",
        href: "/dashboard/japan/global/footer",
      },
    ],
    pages: [
      {
        label: "Homepage",
        href: "/dashboard/japan/pages/homepage",
      },
      {
        label: "Tentang Kami",
        href: "/dashboard/japan/pages/tentang-kami",
      },
      {
        label: "Metode Pelatihan",
        href: "/dashboard/japan/pages/metode-pelatihan",
      },
      {
        label: "Profil Kandidat",
        href: "/dashboard/japan/pages/profil-kandidat",
      },
      {
        label: "Jaringan Rekrutmen",
        href: "/dashboard/japan/pages/jaringan-rekrutmen",
      },
      {
        label: "Contact",
        href: "/dashboard/japan/pages/contact",
      },
      {
        label: "News Page",
        href: "/dashboard/japan/pages/news",
      },
      {
        label: "Sector Page",
        href: "/dashboard/japan/pages/sector",
      },
    ],
    collections: [
      {
        key: "news",
        label: "News / Blog",
        href: "/dashboard/japan/collections/news",
        createHref: "/dashboard/japan/collections/news/new",
      },
      {
        key: "sector",
        label: "Sector",
        href: "/dashboard/japan/collections/sector",
        createHref: "/dashboard/japan/collections/sector/new",
      },
    ],
    optionsLabel: "Option Data",
    optionsHref: "/dashboard/japan/options",
    mediaLabel: "Media & Documents",
  },
};

export const DASHBOARD_VARIANT_KEYS = Object.keys(
  DASHBOARD_VARIANTS,
) as DashboardVariant[];

export function isDashboardVariant(value: string): value is DashboardVariant {
  return value === "indonesia" || value === "japan";
}

export function getDashboardVariantFromPathname(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[1];

  return segment && isDashboardVariant(segment) ? segment : null;
}
