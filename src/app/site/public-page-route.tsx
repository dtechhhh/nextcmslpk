import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ContentPageRenderer } from "@/components/site/content-page-renderer";
import {
  resolvePublicContentPage,
  type PublicPageSearchParams,
} from "@/server/resolvers/public";

type PublicPageRouteProps = {
  publicPath: string;
  searchParams: Promise<PublicPageSearchParams>;
};

export async function PublicPageRoute({
  publicPath,
  searchParams,
}: PublicPageRouteProps) {
  const [params, headerList] = await Promise.all([searchParams, headers()]);
  const resolution = await resolvePublicContentPage({
    host: headerList.get("host") ?? "",
    publicPath,
    searchParams: params,
  });

  if (resolution.status === "invalid_preview") {
    redirect(resolution.normalPath);
  }

  if (resolution.status !== "ok") {
    notFound();
  }

  if (resolution.noStore) {
    noStore();
  }

  return (
    <ContentPageRenderer
      isPreview={resolution.isPreview}
      page={resolution.page}
    />
  );
}
