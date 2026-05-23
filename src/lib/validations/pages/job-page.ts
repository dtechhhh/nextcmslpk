import { z } from "zod";

import {
  basicHeroSchema,
  defaultBasicHero,
  defaultFinalCta,
  faqItemSchema,
  finalCtaSchema,
} from "@/lib/validations/pages/_shared";

export const jobPageSchema = z
  .object({
    hero: basicHeroSchema.default(defaultBasicHero),
    filter_config: z
      .object({
        enable_job_type_filter: z.boolean().default(true),
        enable_job_field_filter: z.boolean().default(true),
        enable_gender_filter: z.boolean().default(true),
        enable_language_filter: z.boolean().default(true),
      })
      .passthrough()
      .default({
        enable_job_type_filter: true,
        enable_job_field_filter: true,
        enable_gender_filter: true,
        enable_language_filter: true,
      }),
    faq: z.array(faqItemSchema).default([]),
    final_cta: finalCtaSchema.default(defaultFinalCta),
  })
  .passthrough();

export type JobPageInput = z.infer<typeof jobPageSchema>;
