import { PublicPageRoute } from "@/app/site/public-page-route";
import type { PublicPageSearchParams } from "@/server/resolvers/public";

type SitePageProps = {
  searchParams: Promise<PublicPageSearchParams>;
};

export default function SitePage({ searchParams }: SitePageProps) {
  return <PublicPageRoute publicPath="/" searchParams={searchParams} />;
}
