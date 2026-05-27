import {
  generatePublicMetadata,
  renderTentangKami,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "tentang_kami",
    path: "/tentang-kami",
    titleFallback: "Tentang Kami",
    searchParams,
  });
}

export default async function TentangKamiPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return renderTentangKami({ searchParams });
}
