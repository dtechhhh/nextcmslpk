import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaJobPageEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.job_page" });
}

