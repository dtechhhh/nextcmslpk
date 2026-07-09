import { CollectionListPage } from "@/components/dashboard/collection-list-page";

export const dynamic = "force-dynamic";

export default async function JapanNewsListPage() {
  return CollectionListPage({ variantKey: "japan", collectionKey: "news" });
}

