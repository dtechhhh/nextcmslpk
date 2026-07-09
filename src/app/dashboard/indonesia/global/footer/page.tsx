import { GlobalConfigEditorPage } from "@/components/dashboard/global-config-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaFooterPage() {
  return GlobalConfigEditorPage({ definitionKey: "indonesia.footer" });
}

