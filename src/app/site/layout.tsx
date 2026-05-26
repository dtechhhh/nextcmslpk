import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { LayoutIndonesia } from "@/themes/starter/components/layout/LayoutIndonesia";
import { LayoutJapan } from "@/themes/starter/components/layout/LayoutJapan";
import { getSiteContext } from "@/app/site/site-context";
import NotFoundPage from "@/themes/starter/pages/shared/NotFoundPage";
import SuspendedPage from "@/themes/starter/pages/shared/SuspendedPage";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const context = await getSiteContext();
  const result = context.result;

  if (result.type === "not_found") {
    notFound();
  }

  if (result.type === "suspended") {
    return <SuspendedPage />;
  }

  if (result.type === "unavailable") {
    notFound();
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

  return <NotFoundPage />;
}
