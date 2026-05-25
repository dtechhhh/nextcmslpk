import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaTentangKamiEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.tentang_kami" });
}

