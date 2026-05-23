import { PublicPageRoute } from "@/app/site/public-page-route";
import type { PublicPageSearchParams } from "@/server/resolvers/public";

type SiteCatchAllPageProps = {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<PublicPageSearchParams>;
};

export default async function SiteCatchAllPage({
  params,
  searchParams,
}: SiteCatchAllPageProps) {
  const { slug } = await params;

  return (
    <PublicPageRoute
      publicPath={`/${slug.join("/")}`}
      searchParams={searchParams}
    />
  );
}
