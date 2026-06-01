import { z } from "zod";

import {
  emptyOrUrl,
  mediaIdSchema,
  optionalString,
} from "@/lib/validations/pages/_shared";

const japanMediaHeroSchema = z
  .object({
    media_type: z.enum(["image", "video"]).default("image"),
    media_id: mediaIdSchema,
    headline: optionalString(220),
    subheadline: optionalString(600),
    eyebrow_label: optionalString(120),
  })
  .passthrough();

const japanFinalCtaWithDocSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_document_url: emptyOrUrl("Secondary document URL"),
    secondary_document_file_id: mediaIdSchema,
  })
  .passthrough();

export const sectorPageSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
    }),
    filter_config: z
      .object({
        enable_sector_category_filter: z.boolean().default(true),
      })
      .passthrough()
      .default({
        enable_sector_category_filter: true,
      }),
    final_cta: japanFinalCtaWithDocSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_document_url: "",
      secondary_document_file_id: "",
    }),
  })
  .passthrough();

export type SectorPageInput = z.infer<typeof sectorPageSchema>;
