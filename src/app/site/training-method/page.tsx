import {
  generatePublicMetadata,
  renderJapanStaticPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "metode_pelatihan",
    path: "/training-method",
    titleFallback: "Training Method",
    searchParams,
  });
}

export default function TrainingMethodPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return renderJapanStaticPage({
    kind: "training_method",
    pageKey: "metode_pelatihan",
    path: "/training-method",
    cacheTags: (variantId) => [`page:${variantId}:metode_pelatihan`],
    revalidate: 3600,
    searchParams,
  });
}
