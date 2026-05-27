import type { ReactNode } from "react";

import { LayoutIndonesia } from "@/themes/starter/components/layout/LayoutIndonesia";
import { LayoutJapan } from "@/themes/starter/components/layout/LayoutJapan";
import { getSiteContext } from "@/app/site/site-context";

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

  return <>{children}</>;
}
