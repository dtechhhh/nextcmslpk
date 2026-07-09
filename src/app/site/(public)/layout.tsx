import type { ReactNode } from "react";

import { LayoutIndonesia } from "@/themes/starter/components/layout/LayoutIndonesia";
import { LayoutJapan } from "@/themes/starter/components/layout/LayoutJapan";
import { getSiteContext } from "@/app/site/site-context";
import { resolveVariantHomepageUrl } from "@/server/resolvers/domain";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await getSiteContext();
  const result = context.result;

  if (result.type !== "ok") {
    return <>{children}</>;
  }

  const tenant = result.tenant;
  const variant = result.variant;
  const variantKey = variant.variantKey;
  const globalConfig = context.globalConfig ?? {};

  if (variantKey === "indonesia") {
    const brandHeader = getRecord(globalConfig.brand_header);
    const variantSwitch = getRecord(brandHeader.variant_switch);
    const targetVariantKey =
      typeof variantSwitch.target_variant_key === "string"
        ? variantSwitch.target_variant_key
        : "japan";
    const variantSwitchUrl = await resolveVariantHomepageUrl(
      tenant.id,
      targetVariantKey,
    );

    return (
      <LayoutIndonesia
        globalConfig={globalConfig}
        tenant={tenant}
        variantId={variant.id}
        variantSwitchUrl={variantSwitchUrl ?? undefined}
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

  return <>{children}</>;
}

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
