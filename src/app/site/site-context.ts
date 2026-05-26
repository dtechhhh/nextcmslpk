import { cache } from "react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";

import { resolveDomain, type DomainResolution } from "@/server/resolvers/domain";
import { resolveGlobalConfig } from "@/server/resolvers/public";

export const getSiteContext = cache(async () => {
  const host = (await headers()).get("host") || "";
  const result = await resolveDomain(host);

  if (result.type !== "ok") {
    return { result, host } as const;
  }

  const globalConfig = await unstable_cache(
    () => resolveGlobalConfig(result.variant.id),
    ["public-global-config", result.variant.id],
    { revalidate: 60, tags: [`variant:${result.variant.id}`] },
  )();

  return {
    result,
    host,
    tenant: result.tenant,
    variant: result.variant,
    variantId: result.variant.id,
    variantKey: result.variant.variantKey,
    globalConfig,
  } as const;
});

export type SiteContext = Awaited<ReturnType<typeof getSiteContext>>;
export type OkSiteContext = Extract<SiteContext, { result: Extract<DomainResolution, { type: "ok" }> }>;
