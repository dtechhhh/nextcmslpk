import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanLinePage() {
  return GlobalConfigEditorPage({ definitionKey: "japan.line_business_contact" });
}

