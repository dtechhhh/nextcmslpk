import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

type IndonesiaEditProgramPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IndonesiaEditProgramPage({
  params,
}: IndonesiaEditProgramPageProps) {
  const { id } = await params;

  return (
    <CollectionEditorPage
      variantKey="indonesia"
      collectionKey="program"
      itemId={id}
    />
  );
}

