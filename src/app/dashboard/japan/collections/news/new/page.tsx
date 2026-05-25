import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanCreateNewsPage() {
  return CollectionEditorPage({ variantKey: "japan", collectionKey: "news" });
}

