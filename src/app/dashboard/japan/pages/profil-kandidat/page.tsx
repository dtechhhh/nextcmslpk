import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanProfilKandidatEditorPage() {
  return PageEditorPage({ definitionKey: "japan.profil_kandidat" });
}
