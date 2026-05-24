import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

type IndonesiaEditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IndonesiaEditBlogPage({
  params,
}: IndonesiaEditBlogPageProps) {
  const { id } = await params;

  return (
    <CollectionEditorPage
      variantKey="indonesia"
      collectionKey="blog"
      itemId={id}
    />
  );
}

