import {
  generatePublicMetadata,
  renderListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "karir_page",
    path: "/karir",
    titleFallback: "Karir",
    searchParams,
  });
}

export default function KarirPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderListPage({
    pageKey: "karir_page",
    collectionKey: "karir",
    path: "/karir",
    detailPathPrefix: "/karir",
    optionSetKeys: ["department", "employment_type", "work_arrangement"],
    cacheTags: (variantId) => [
      `page:${variantId}:karir_page`,
      `collection:${variantId}:karir`,
    ],
    revalidate: 60,
    searchParams,
    activeOnly: true,
  });
}
