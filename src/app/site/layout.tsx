import type { ReactNode } from "react";
import { headers } from "next/headers";

import { NotFoundPage, SuspendedPage, UnavailablePage } from "@/components/site/state-pages";
import starterTheme from "@/themes/starter/registry";
import { LayoutIndonesia } from "@/themes/starter/components/layout/LayoutIndonesia";
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

  const theme = starterTheme;
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

  if (variantKey === "japan" && theme.layouts.japan) {
    const LayoutJapan = theme.layouts.japan;
    return (
      <div data-variant="japan">
        <LayoutJapan
          globalConfig={globalConfig}
          tenant={tenant}
        >
          {children}
        </LayoutJapan>
      </div>
    );
  }

  return <UnavailablePage />;
}
