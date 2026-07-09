import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanContactEditorPage() {
  return PageEditorPage({ definitionKey: "japan.contact" });
}
