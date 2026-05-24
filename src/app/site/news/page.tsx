import {
  generatePublicMetadata,
  renderJapanListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "news_page",
    path: "/news",
    titleFallback: "News",
    searchParams,
  });
}

export default function NewsPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderJapanListPage({
    kind: "news",
    pageKey: "news_page",
    collectionKey: "news",
    path: "/news",
    cacheTags: (variantId) => [
      `page:${variantId}:news_page`,
      `collection:${variantId}:news`,
    ],
    revalidate: 60,
    searchParams,
  });
}
