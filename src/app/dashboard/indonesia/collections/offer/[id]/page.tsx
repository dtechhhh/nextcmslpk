import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

type IndonesiaEditOfferPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IndonesiaEditOfferPage({
  params,
}: IndonesiaEditOfferPageProps) {
  const { id } = await params;

  return CollectionEditorPage({ variantKey: "indonesia", collectionKey: "offer", itemId: id });
}

