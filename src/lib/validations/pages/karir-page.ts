import { z } from "zod";

import {
  basicHeroSchema,
  defaultBasicHero,
  defaultFinalCta,
  faqItemSchema,
  finalCtaSchema,
} from "@/lib/validations/pages/_shared";

export const karirPageSchema = z
  .object({
    hero: basicHeroSchema.default(defaultBasicHero),
    filter_config: z
      .object({
        enable_department_filter: z.boolean().default(true),
        enable_employment_type_filter: z.boolean().default(true),
        enable_work_arrangement_filter: z.boolean().default(true),
      })
      .passthrough()
      .default({
        enable_department_filter: true,
        enable_employment_type_filter: true,
        enable_work_arrangement_filter: true,
      }),
    faq: z.array(faqItemSchema).default([]),
    final_cta: finalCtaSchema.default(defaultFinalCta),
  })
  .passthrough();

export type KarirPageInput = z.infer<typeof karirPageSchema>;
