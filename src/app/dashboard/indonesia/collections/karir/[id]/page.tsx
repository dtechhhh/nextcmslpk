import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

type IndonesiaEditKarirPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IndonesiaEditKarirPage({
  params,
}: IndonesiaEditKarirPageProps) {
  const { id } = await params;

  return CollectionEditorPage({ variantKey: "indonesia", collectionKey: "karir", itemId: id });
}

