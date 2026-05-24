import type { ZodType } from "zod";

import { blogSchema } from "@/lib/validations/collections/blog";
import { jobSchema } from "@/lib/validations/collections/job";
import { karirSchema } from "@/lib/validations/collections/karir";
import { newsSchema } from "@/lib/validations/collections/news";
import { offerSchema } from "@/lib/validations/collections/offer";
import { programSchema } from "@/lib/validations/collections/program";
import { sectorSchema } from "@/lib/validations/collections/sector";
import type { CollectionKey } from "@/lib/constants";

export const COLLECTION_SCHEMAS: Record<CollectionKey, ZodType> = {
  program: programSchema,
  job: jobSchema,
  offer: offerSchema,
  blog: blogSchema,
  karir: karirSchema,
  news: newsSchema,
  sector: sectorSchema,
};

export function getCollectionSchema(collectionKey: string): ZodType | null {
  if (collectionKey in COLLECTION_SCHEMAS) {
    return COLLECTION_SCHEMAS[collectionKey as CollectionKey];
  }

  return null;
}

export {
  blogSchema,
  jobSchema,
  karirSchema,
  newsSchema,
  offerSchema,
  programSchema,
  sectorSchema,
};
