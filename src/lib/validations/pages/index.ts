import type { ZodType } from "zod";

import { blogPageSchema } from "@/lib/validations/pages/blog-page";
import { contactJapanSchema } from "@/lib/validations/pages/contact-japan";
import { homepageSchema } from "@/lib/validations/pages/homepage";
import { homepageJapanSchema } from "@/lib/validations/pages/homepage-japan";
import { jaringanRekrutmenSchema } from "@/lib/validations/pages/jaringan-rekrutmen";
import { jobPageSchema } from "@/lib/validations/pages/job-page";
import { karirPageSchema } from "@/lib/validations/pages/karir-page";
import { metodePelatihanSchema } from "@/lib/validations/pages/metode-pelatihan";
import { newsPageSchema } from "@/lib/validations/pages/news-page";
import { profilKandidatSchema } from "@/lib/validations/pages/profil-kandidat";
import { programPageSchema } from "@/lib/validations/pages/program-page";
import { sectorPageSchema } from "@/lib/validations/pages/sector-page";
import { tentangKamiSchema } from "@/lib/validations/pages/tentang-kami";
import { tentangKamiJapanSchema } from "@/lib/validations/pages/tentang-kami-japan";
import type { PageKey } from "@/lib/constants";
import type { VariantKey } from "@/types";

export type PageSchemaKey =
  | "indonesia.homepage"
  | "indonesia.program_page"
  | "indonesia.job_page"
  | "indonesia.blog_page"
  | "indonesia.tentang_kami"
  | "indonesia.karir_page"
  | "japan.homepage"
  | "japan.tentang_kami"
  | "japan.metode_pelatihan"
  | "japan.profil_kandidat"
  | "japan.jaringan_rekrutmen"
  | "japan.sector_page"
  | "japan.news_page"
  | "japan.contact";

export const PAGE_SCHEMAS = {
  "indonesia.homepage": homepageSchema,
  "indonesia.program_page": programPageSchema,
  "indonesia.job_page": jobPageSchema,
  "indonesia.blog_page": blogPageSchema,
  "indonesia.tentang_kami": tentangKamiSchema,
  "indonesia.karir_page": karirPageSchema,
  "japan.homepage": homepageJapanSchema,
  "japan.tentang_kami": tentangKamiJapanSchema,
  "japan.metode_pelatihan": metodePelatihanSchema,
  "japan.profil_kandidat": profilKandidatSchema,
  "japan.jaringan_rekrutmen": jaringanRekrutmenSchema,
  "japan.sector_page": sectorPageSchema,
  "japan.news_page": newsPageSchema,
  "japan.contact": contactJapanSchema,
} satisfies Record<PageSchemaKey, ZodType>;

export function getContentPageSchema(variantKey: VariantKey, pageKey: PageKey) {
  const schemaKey = `${variantKey}.${pageKey}` as PageSchemaKey;

  return PAGE_SCHEMAS[schemaKey] ?? null;
}

export function isAllowedPageKey(variantKey: VariantKey, pageKey: PageKey) {
  return Boolean(getContentPageSchema(variantKey, pageKey));
}
