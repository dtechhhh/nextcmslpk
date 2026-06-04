import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import {
  Prisma,
  PrismaClient,
} from "../src/generated/prisma/client";
import {
  EXCERPT_MAX_LENGTH,
  SHORT_DESCRIPTION_MAX_LENGTH,
} from "../src/lib/content-summary-limits";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to trim collection summaries.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return { value, changed: false };
  }

  const normalized = value.trim();
  const trimmed =
    normalized.length > maxLength
      ? normalized.slice(0, maxLength).trimEnd()
      : normalized;

  return {
    value: trimmed,
    changed: trimmed !== value,
  };
}

function cleanJson(value: unknown) {
  if (!isRecord(value)) {
    return { value, changed: false, fieldChanges: 0 };
  }

  const next = { ...value };
  let fieldChanges = 0;

  const excerpt = cleanText(next.excerpt, EXCERPT_MAX_LENGTH);
  if (excerpt.changed) {
    next.excerpt = excerpt.value;
    fieldChanges += 1;
  }

  const shortDescription = cleanText(
    next.short_description,
    SHORT_DESCRIPTION_MAX_LENGTH,
  );
  if (shortDescription.changed) {
    next.short_description = shortDescription.value;
    fieldChanges += 1;
  }

  return {
    value: next,
    changed: fieldChanges > 0,
    fieldChanges,
  };
}

function getScalarExcerptLimit(collectionKey: string) {
  return collectionKey === "blog" || collectionKey === "news"
    ? EXCERPT_MAX_LENGTH
    : SHORT_DESCRIPTION_MAX_LENGTH;
}

async function main() {
  const items = await prisma.contentItem.findMany({
    select: {
      id: true,
      collectionKey: true,
      excerpt: true,
      dataJson: true,
      publishedDataJson: true,
    },
  });

  let updatedItems = 0;
  let fieldChanges = 0;

  for (const item of items) {
    const updateData: Prisma.ContentItemUpdateInput = {};

    const dataJson = cleanJson(item.dataJson);
    if (dataJson.changed) {
      updateData.dataJson = dataJson.value as Prisma.InputJsonValue;
      fieldChanges += dataJson.fieldChanges;
    }

    const publishedDataJson = cleanJson(item.publishedDataJson);
    if (publishedDataJson.changed) {
      updateData.publishedDataJson =
        publishedDataJson.value as Prisma.InputJsonValue;
      fieldChanges += publishedDataJson.fieldChanges;
    }

    const excerpt = cleanText(
      item.excerpt,
      getScalarExcerptLimit(item.collectionKey),
    );
    if (excerpt.changed) {
      updateData.excerpt = excerpt.value as string;
      fieldChanges += 1;
    }

    if (Object.keys(updateData).length === 0) {
      continue;
    }

    await prisma.contentItem.update({
      where: { id: item.id },
      data: updateData,
    });
    updatedItems += 1;
  }

  console.log(
    JSON.stringify(
      {
        scannedItems: items.length,
        updatedItems,
        trimmedFields: fieldChanges,
        limits: {
          short_description: SHORT_DESCRIPTION_MAX_LENGTH,
          excerpt: EXCERPT_MAX_LENGTH,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
