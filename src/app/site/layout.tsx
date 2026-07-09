import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getSiteContext } from "@/app/site/site-context";
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

  const variantKey = result.variant.variantKey;

  if (variantKey !== "indonesia" && variantKey !== "japan") {
    notFound();
  }

  return <>{children}</>;
}
