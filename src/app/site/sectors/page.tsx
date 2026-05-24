import {
  generatePublicMetadata,
  renderJapanListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "sector_page",
    path: "/sectors",
    titleFallback: "Sectors",
    searchParams,
  });
}

export default function SectorsPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderJapanListPage({
    kind: "sector",
    pageKey: "sector_page",
    collectionKey: "sector",
    path: "/sectors",
    cacheTags: (variantId) => [
      `page:${variantId}:sector_page`,
      `collection:${variantId}:sector`,
    ],
    revalidate: 60,
    searchParams,
  });
}
