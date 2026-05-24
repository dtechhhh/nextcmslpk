import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionEditor } from "@/components/dashboard/collection-editor";
import {
  getCollectionDefinition,
  isAllowedCollectionKey,
  type CollectionKey,
  type CollectionOptionSets,
  type PublishStatus,
} from "@/lib/collection-definitions";
import { getItem } from "@/server/actions/tenant/collection";
import { tenantDb } from "@/server/db/tenant-scoped";
import type { VariantKey } from "@/types";

type CollectionEditorPageProps = {
  variantKey: VariantKey;
  collectionKey: CollectionKey;
  itemId?: string;
};

export async function CollectionEditorPage({
  variantKey,
  collectionKey,
  itemId,
}: CollectionEditorPageProps) {
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

  const definition = getCollectionDefinition(collectionKey);
  const optionSets = await loadOptionSets(db, variant.id);

  if (itemId) {
    const response = await getItem(itemId);

    if (
      !isItemLoadSuccess(response) ||
      response.item.collectionKey !== collectionKey ||
      response.item.variantId !== variant.id
    ) {
      notFound();
    }

    return (
      <CollectionEditor
        tenantId={session.user.tenantId}
        variantId={variant.id}
        collectionKey={collectionKey}
        itemId={response.item.id}
        initialData={response.item.dataJson}
        initialStatus={response.item.status as PublishStatus}
        updatedAt={response.item.updatedAt}
        optionSets={optionSets}
      />
    );
  }

  return (
    <CollectionEditor
      tenantId={session.user.tenantId}
      variantId={variant.id}
      collectionKey={collectionKey}
      itemId={null}
      initialData={definition.defaultData}
      initialStatus="DRAFT"
      updatedAt={null}
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

function isItemLoadSuccess(value: unknown): value is {
  ok: true;
  item: {
    id: string;
    variantId: string;
    collectionKey: CollectionKey;
    status: string;
    dataJson: Record<string, unknown>;
    updatedAt: string;
  };
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.item) &&
    typeof value.item.id === "string" &&
    typeof value.item.variantId === "string" &&
    typeof value.item.collectionKey === "string" &&
    isRecord(value.item.dataJson) &&
    typeof value.item.updatedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
