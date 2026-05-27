import { headers } from "next/headers";

import NotFoundPage from "@/themes/starter/pages/shared/NotFoundPage";
import { resolveDomain } from "@/server/resolvers/domain";

export default async function SiteNotFoundPage() {
  let variantKey: string | undefined;

  try {
    const host = (await headers()).get("host") || "";
    const result = await resolveDomain(host);

    if (result.type === "ok") {
      variantKey = result.variant.variantKey;
    } else if (result.type === "unavailable") {
      variantKey = result.variant.key;
    }
  } catch {
    // Domain not resolved — fallback to default (indonesia)
  }

  return <NotFoundPage variantKey={variantKey} />;
}
