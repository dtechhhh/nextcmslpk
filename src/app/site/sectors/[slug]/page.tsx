import {
  generateItemMetadata,
  renderJapanDetailPage,
  type PageSearchParams,
  type SlugParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return generateItemMetadata({
    collectionKey: "sector",
    slug,
    path: `/sectors/${slug}`,
    searchParams,
  });
}

export default async function SectorDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderJapanDetailPage({
    collectionKey: "sector",
    slug,
    pathPrefix: "/sectors",
    cacheTags: (variantId) => [
      `page:${variantId}:sector:${slug}`,
      `item:${variantId}:sector:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
