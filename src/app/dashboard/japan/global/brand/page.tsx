import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanBrandPage() {
  return GlobalConfigEditorPage({ definitionKey: "japan.brand_header" });
}

