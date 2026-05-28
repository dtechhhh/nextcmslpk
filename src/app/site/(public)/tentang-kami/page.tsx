import { redirect } from "next/navigation";

import {
  generatePublicMetadata,
  renderTentangKami,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";
import { getSiteContext } from "@/app/site/site-context";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "tentang_kami",
    path: "/tentang-kami",
    titleFallback: "Tentang Kami",
    searchParams,
  });
}

export default async function TentangKamiPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const context = await getSiteContext();

  if (context.result.type === "ok" && context.result.variant.variantKey !== "indonesia") {
    redirect("/about");
  }

  return renderTentangKami({ searchParams });
}
