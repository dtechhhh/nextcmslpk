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
    collectionKey: "offer",
    slug,
    path: `/offer/${slug}`,
    searchParams,
  });
}

export default async function OfferDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderDetailPage({
    collectionKey: "offer",
    slug,
    pathPrefix: "/offer",
    cacheTags: (variantId) => [
      `page:${variantId}:offer:${slug}`,
      `item:${variantId}:offer:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
