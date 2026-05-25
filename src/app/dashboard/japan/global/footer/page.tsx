import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanFooterPage() {
  return GlobalConfigEditorPage({ definitionKey: "japan.footer" });
}

