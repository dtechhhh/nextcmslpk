import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanNewsPageEditorPage() {
  return PageEditorPage({ definitionKey: "japan.news_page" });
}
