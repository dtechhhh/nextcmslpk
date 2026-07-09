import { z } from "zod";

import {
  basicHeroSchema,
  defaultBasicHero,
  defaultFinalCta,
  enabledSortFields,
  faqItemSchema,
  finalCtaSchema,
  iconKeySchema,
  optionalString,
  statItemSchema,
} from "@/lib/validations/pages/_shared";

const programHeroSchema = basicHeroSchema.extend({
  secondary_cta_label: optionalString(120),
});

export const programPageSchema = z
  .object({
    hero: programHeroSchema.default({
      ...defaultBasicHero,
      secondary_cta_label: "",
    }),
    stats: z.array(statItemSchema.extend({
      icon_key: iconKeySchema,
      ...enabledSortFields,
    })).default([]),
    filter_config: z
      .object({
        enable_program_type_filter: z.boolean().default(true),
        enable_gender_filter: z.boolean().default(true),
        enable_education_filter: z.boolean().default(true),
        enable_language_filter: z.boolean().default(true),
      })
      .passthrough()
      .default({
        enable_program_type_filter: true,
        enable_gender_filter: true,
        enable_education_filter: true,
        enable_language_filter: true,
      }),
    faq: z.array(faqItemSchema).default([]),
    final_cta: finalCtaSchema.default(defaultFinalCta),
  })
  .passthrough();

export type ProgramPageInput = z.infer<typeof programPageSchema>;
