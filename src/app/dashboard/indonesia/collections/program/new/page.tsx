import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaCreateProgramPage() {
  return CollectionEditorPage({ variantKey: "indonesia", collectionKey: "program" });
}

