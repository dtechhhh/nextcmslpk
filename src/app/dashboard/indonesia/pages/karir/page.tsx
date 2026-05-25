import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaKarirPageEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.karir_page" });
}

