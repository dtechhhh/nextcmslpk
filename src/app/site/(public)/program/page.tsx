import {
  generatePublicMetadata,
  renderListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "program_page",
    path: "/program",
    titleFallback: "Program",
    searchParams,
  });
}

export default function ProgramPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderListPage({
    pageKey: "program_page",
    collectionKey: "program",
    path: "/program",
    detailPathPrefix: "/program",
    optionSetKeys: ["program_type", "gender", "education_level", "language_level"],
    cardLabelOptionKeys: ["program_type"],
    cacheTags: (variantId) => [
      `page:${variantId}:program_page`,
      `collection:${variantId}:program`,
    ],
    revalidate: 60,
    searchParams,
  });
}
