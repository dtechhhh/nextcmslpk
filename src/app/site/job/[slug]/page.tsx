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
    collectionKey: "job",
    slug,
    path: `/job/${slug}`,
    searchParams,
  });
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderDetailPage({
    collectionKey: "job",
    slug,
    pathPrefix: "/job",
    cacheTags: (variantId) => [
      `page:${variantId}:job:${slug}`,
      `item:${variantId}:job:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}
