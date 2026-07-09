import {
  generatePublicMetadata,
  renderJapanStaticPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "jaringan_rekrutmen",
    path: "/recruitment-network",
    titleFallback: "Recruitment Network",
    searchParams,
  });
}

export default function RecruitmentNetworkPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return renderJapanStaticPage({
    kind: "recruitment_network",
    pageKey: "jaringan_rekrutmen",
    path: "/recruitment-network",
    cacheTags: (variantId) => [`page:${variantId}:jaringan_rekrutmen`],
    revalidate: 3600,
    searchParams,
  });
}
