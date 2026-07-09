import {
  generatePublicMetadata,
  renderHomepage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "homepage",
    path: "/",
    titleFallback: "Home",
    searchParams,
  });
}

export default function SitePage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderHomepage({ searchParams });
}
