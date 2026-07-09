import {
  generatePublicMetadata,
  renderListPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 60;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "blog_page",
    path: "/blog",
    titleFallback: "Blog",
    searchParams,
  });
}

export default function BlogPage({ searchParams }: { searchParams: PageSearchParams }) {
  return renderListPage({
    pageKey: "blog_page",
    collectionKey: "blog",
    path: "/blog",
    detailPathPrefix: "/blog",
    optionSetKeys: ["category", "tag"],
    cardLabelOptionKeys: ["category"],
    cacheTags: (variantId) => [
      `page:${variantId}:blog_page`,
      `collection:${variantId}:blog`,
    ],
    revalidate: 60,
    searchParams,
  });
}
