import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaCreateOfferPage() {
  return CollectionEditorPage({ variantKey: "indonesia", collectionKey: "offer" });
}

