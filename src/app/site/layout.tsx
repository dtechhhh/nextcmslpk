import type { ReactNode } from "react";
import { headers } from "next/headers";

import { NotFoundPage, SuspendedPage, UnavailablePage } from "@/components/site/state-pages";
import { LayoutIndonesia } from "@/themes/starter/components/layout/LayoutIndonesia";
import { LayoutJapan } from "@/themes/starter/components/layout/LayoutJapan";
import { resolveDomain } from "@/server/resolvers/domain";
import { resolveGlobalConfig } from "@/server/resolvers/public";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const host = (await headers()).get("host") || "";
  const result = await resolveDomain(host);

  if (result.type === "not_found") {
    return <NotFoundPage />;
  }

  if (result.type === "suspended") {
    return <SuspendedPage />;
  }

  if (result.type === "unavailable") {
    return <UnavailablePage />;
  }

  const tenant = result.tenant;
  const variant = result.variant;
  const variantKey = variant.variantKey;
  const globalConfig = await resolveGlobalConfig(variant.id);

  if (variantKey === "indonesia") {
    return (
      <LayoutIndonesia
        globalConfig={globalConfig}
        tenant={tenant}
        variantId={variant.id}
      >
        {children}
      </LayoutIndonesia>
    );
  }

  if (variantKey === "japan") {
    return (
      <LayoutJapan globalConfig={globalConfig} tenant={tenant}>
        {children}
      </LayoutJapan>
    );
  }

  return <UnavailablePage />;
}
