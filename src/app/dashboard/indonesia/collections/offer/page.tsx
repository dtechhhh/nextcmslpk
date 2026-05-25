import { CollectionListPage } from "@/components/dashboard/collection-list-page";

export const dynamic = "force-dynamic";

export default async function IndonesiaOfferListPage() {
  return CollectionListPage({ variantKey: "indonesia", collectionKey: "offer" });
}

