import { CollectionEditorPage } from "@/components/dashboard/collection-editor-page";

export const dynamic = "force-dynamic";

type JapanEditNewsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JapanEditNewsPage({
  params,
}: JapanEditNewsPageProps) {
  const { id } = await params;

  return CollectionEditorPage({ variantKey: "japan", collectionKey: "news", itemId: id });
}

