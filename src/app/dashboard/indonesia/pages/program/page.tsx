import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaProgramPageEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.program_page" });
}

