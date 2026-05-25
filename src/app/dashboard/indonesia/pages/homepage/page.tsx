import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaHomepageEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.homepage" });
}

