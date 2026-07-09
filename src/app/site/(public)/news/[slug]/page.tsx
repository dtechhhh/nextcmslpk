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
    collectionKey: "news",
    slug,
    path: `/news/${slug}`,
    searchParams,
  });
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderJapanDetailPage({
    collectionKey: "news",
    slug,
    pathPrefix: "/news",
    cacheTags: (variantId) => [
      `page:${variantId}:news:${slug}`,
      `item:${variantId}:news:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
