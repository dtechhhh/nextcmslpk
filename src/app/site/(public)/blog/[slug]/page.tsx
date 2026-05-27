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
    collectionKey: "blog",
    slug,
    path: `/blog/${slug}`,
    searchParams,
  });
}

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderDetailPage({
    collectionKey: "blog",
    slug,
    pathPrefix: "/blog",
    cacheTags: (variantId) => [
      `page:${variantId}:blog:${slug}`,
      `item:${variantId}:blog:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
