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
    collectionKey: "program",
    slug,
    path: `/program/${slug}`,
    searchParams,
  });
}

export async function defaultPage({
  params,
  searchParams,
}: {
  params: SlugParams;
  searchParams: PageSearchParams;
}) {
  const { slug } = await params;
  return renderDetailPage({
    collectionKey: "program",
    slug,
    pathPrefix: "/program",
    cacheTags: (variantId) => [
      `page:${variantId}:program:${slug}`,
      `item:${variantId}:program:${slug}`,
    ],
    revalidate: 3600,
    searchParams,
  });
}

export default defaultPage;
