import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanJaringanRekrutmenEditorPage() {
  return PageEditorPage({ definitionKey: "japan.jaringan_rekrutmen" });
}
