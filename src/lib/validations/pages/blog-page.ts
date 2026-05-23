import { z } from "zod";

import {
  basicHeroSchema,
  contentIdSchema,
  defaultBasicHero,
  offerSourceSchema,
} from "@/lib/validations/pages/_shared";

export const blogPageSchema = z
  .object({
    hero: basicHeroSchema.default(defaultBasicHero),
    filter_config: z
      .object({
        enable_category_filter: z.boolean().default(true),
        enable_tag_filter: z.boolean().default(true),
      })
      .passthrough()
      .default({
        enable_category_filter: true,
        enable_tag_filter: true,
      }),
    offer_section: z
      .object({
        source: offerSourceSchema.default("active_featured_offer"),
        manual_offer_id: contentIdSchema,
      })
      .passthrough()
      .default({
        source: "active_featured_offer",
        manual_offer_id: "",
      }),
  })
  .passthrough();

export type BlogPageInput = z.infer<typeof blogPageSchema>;
