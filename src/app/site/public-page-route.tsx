import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import type { PublicPageSearchParams } from "@/server/resolvers/public";

type PublicPageRouteProps = {
  publicPath: string;
  searchParams: Promise<PublicPageSearchParams>;
};

export async function PublicPageRoute(_props: PublicPageRouteProps): Promise<ReactNode> {
  void _props;
  notFound();
}
