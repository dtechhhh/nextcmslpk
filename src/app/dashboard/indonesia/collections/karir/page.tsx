import { CollectionListPage } from "@/components/dashboard/collection-list-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaKarirListPage() {
  return CollectionListPage({ variantKey: "indonesia", collectionKey: "karir" });
}

