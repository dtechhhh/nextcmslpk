import {
  generatePublicMetadata,
  renderJapanStaticPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "contact",
    path: "/contact",
    titleFallback: "Contact",
    searchParams,
  });
}

export default function ContactPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderJapanStaticPage({
    kind: "contact",
    pageKey: "contact",
    path: "/contact",
    cacheTags: (variantId) => [`page:${variantId}:contact`],
    revalidate: 3600,
    searchParams,
  });
}
