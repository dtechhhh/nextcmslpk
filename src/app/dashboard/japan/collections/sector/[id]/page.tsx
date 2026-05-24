import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

type JapanEditSectorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JapanEditSectorPage({
  params,
}: JapanEditSectorPageProps) {
  const { id } = await params;

  return (
    <CollectionEditorPage
      variantKey="japan"
      collectionKey="sector"
      itemId={id}
    />
  );
}

