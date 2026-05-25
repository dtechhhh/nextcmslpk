import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

type IndonesiaEditJobPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IndonesiaEditJobPage({
  params,
}: IndonesiaEditJobPageProps) {
  const { id } = await params;

  return CollectionEditorPage({ variantKey: "indonesia", collectionKey: "job", itemId: id });
}

