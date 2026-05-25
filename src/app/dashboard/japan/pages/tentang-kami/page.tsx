import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanTentangKamiEditorPage() {
  return PageEditorPage({ definitionKey: "japan.tentang_kami" });
}
