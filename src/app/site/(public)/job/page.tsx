import {
  generatePublicMetadata,
  renderListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "job_page",
    path: "/job",
    titleFallback: "Lowongan",
    searchParams,
  });
}

export default function JobPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderListPage({
    pageKey: "job_page",
    collectionKey: "job",
    path: "/job",
    detailPathPrefix: "/job",
    optionSetKeys: ["job_type", "job_field", "gender", "language_level"],
    cardLabelOptionKeys: ["job_field", "job_type"],
    cardMetaKeys: ["location_label"],
    cacheTags: (variantId) => [
      `page:${variantId}:job_page`,
      `collection:${variantId}:job`,
    ],
    revalidate: 60,
    searchParams,
    activeOnly: true,
  });
}
