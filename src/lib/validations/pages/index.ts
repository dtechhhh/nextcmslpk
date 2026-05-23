import type { ZodType } from "zod";

import { blogPageSchema } from "@/lib/validations/pages/blog-page";
import { homepageSchema } from "@/lib/validations/pages/homepage";
import { jobPageSchema } from "@/lib/validations/pages/job-page";
import { karirPageSchema } from "@/lib/validations/pages/karir-page";
import { programPageSchema } from "@/lib/validations/pages/program-page";
import { tentangKamiSchema } from "@/lib/validations/pages/tentang-kami";
import type { PageKey } from "@/lib/constants";
import type { VariantKey } from "@/types";

export type PageSchemaKey =
  | "indonesia.homepage"
  | "indonesia.program_page"
  | "indonesia.job_page"
  | "indonesia.blog_page"
  | "indonesia.tentang_kami"
  | "indonesia.karir_page";

export const PAGE_SCHEMAS = {
  "indonesia.homepage": homepageSchema,
  "indonesia.program_page": programPageSchema,
  "indonesia.job_page": jobPageSchema,
  "indonesia.blog_page": blogPageSchema,
  "indonesia.tentang_kami": tentangKamiSchema,
  "indonesia.karir_page": karirPageSchema,
} satisfies Record<PageSchemaKey, ZodType>;

export function getContentPageSchema(variantKey: VariantKey, pageKey: PageKey) {
  const schemaKey = `${variantKey}.${pageKey}` as PageSchemaKey;

  return PAGE_SCHEMAS[schemaKey] ?? null;
}

export function isAllowedPageKey(variantKey: VariantKey, pageKey: PageKey) {
  return Boolean(getContentPageSchema(variantKey, pageKey));
}
