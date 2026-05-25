import { CollectionListPage } from "@/components/dashboard/collection-list-page";

export const dynamic = "force-dynamic";

export default async function JapanSectorListPage() {
  return CollectionListPage({ variantKey: "japan", collectionKey: "sector" });
}

