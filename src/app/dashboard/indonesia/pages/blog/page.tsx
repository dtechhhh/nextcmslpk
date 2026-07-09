import { PageEditorPage } from "@/components/dashboard/page-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaBlogPageEditorPage() {
  return PageEditorPage({ definitionKey: "indonesia.blog_page" });
}

