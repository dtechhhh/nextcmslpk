import {
  generatePublicMetadata,
  renderJapanStaticPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "tentang_kami",
    path: "/about",
    titleFallback: "About",
    searchParams,
  });
}

export default function AboutPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderJapanStaticPage({
    kind: "about",
    pageKey: "tentang_kami",
    path: "/about",
    cacheTags: (variantId) => [`page:${variantId}:tentang_kami`],
    revalidate: 3600,
    searchParams,
  });
}
