import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

export default async function JapanCreateSectorPage() {
  return CollectionEditorPage({ variantKey: "japan", collectionKey: "sector" });
}

