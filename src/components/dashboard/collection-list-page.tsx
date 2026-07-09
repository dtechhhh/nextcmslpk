import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionList } from "@/components/dashboard/collection-list";
import {
  isAllowedCollectionKey,
  type CollectionKey,
  type CollectionOptionSets,
} from "@/lib/collection-definitions";
import { tenantDb } from "@/server/db/tenant-scoped";
import type { VariantKey } from "@/types";

type CollectionListPageProps = {
  variantKey: VariantKey;
  collectionKey: CollectionKey;
};

export async function CollectionListPage({
  variantKey,
  collectionKey,
}: CollectionListPageProps) {
  const session = await auth();

  if (!session?.user?.userId || !session.user.tenantId) {
    redirect("/dashboard/login");
  }

  if (!isAllowedCollectionKey(variantKey, collectionKey)) {
    notFound();
  }

  const db = tenantDb(session);
  const variant = await db.variant.findFirst({
    where: { key: variantKey },
    select: { id: true },
  });

  if (!variant) {
    notFound();
  }

  const optionSets = await loadOptionSets(db, variant.id);

  return (
    <CollectionList
      variantId={variant.id}
      collectionKey={collectionKey}
      optionSets={optionSets}
    />
  );
}

async function loadOptionSets(
  db: ReturnType<typeof tenantDb>,
  variantId: string,
): Promise<CollectionOptionSets> {
  const optionSets = await db.optionSet.findMany({
    where: {
      variantId,
    },
    orderBy: {
      key: "asc",
    },
    select: {
      key: true,
      values: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          value: true,
          label: true,
        },
      },
    },
  });

  return Object.fromEntries(
    optionSets.map((optionSet) => [
      optionSet.key,
      optionSet.values.map((value) => ({
        ...value,
        optionSetKey: optionSet.key,
      })),
    ]),
  );
}
