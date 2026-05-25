import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanSectorPageEditorPage() {
  return PageEditorPage({ definitionKey: "japan.sector_page" });
}
