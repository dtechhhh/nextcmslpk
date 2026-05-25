import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaBrandPage() {
  return GlobalConfigEditorPage({ definitionKey: "indonesia.brand_header" });
}

