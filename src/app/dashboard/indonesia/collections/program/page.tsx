import { CollectionListPage } from "@/components/dashboard/collection-list-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaProgramListPage() {
  return CollectionListPage({ variantKey: "indonesia", collectionKey: "program" });
}

