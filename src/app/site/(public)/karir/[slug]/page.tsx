import {
  generateItemMetadata,
  renderDetailPage,
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
    collectionKey: "karir",
    slug,
    path: `/karir/${slug}`,
    searchParams,
  });
}

export default async function KarirDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderDetailPage({
    collectionKey: "karir",
    slug,
    pathPrefix: "/karir",
    cacheTags: (variantId) => [
      `page:${variantId}:karir:${slug}`,
      `item:${variantId}:karir:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
