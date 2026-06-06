import { z } from "zod";

import {
  enabledSortFields,
  iconKeySchema,
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

const proofStatSchema = z
  .object({
    value: optionalString(80),
    label: optionalString(160),
    ...enabledSortFields,
  })
  .passthrough();

const iconTitleDescSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const regionSchema = z
  .object({
    region_name: optionalString(140),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const trainingStepSchema = z
  .object({
    icon_key: iconKeySchema,
    step_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const networkNodeSchema = z
  .object({
    region_label: optionalString(140),
    title: optionalString(180),
    description: optionalString(700),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

const japanFinalCtaSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
  })
  .passthrough();

export const jaringanRekrutmenSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
    }),
    proof_stats: z.array(proofStatSchema).default([]),
    network_overview: z
      .object({
        map_image_id: mediaIdSchema,
        headline: optionalString(220),
        description: optionalString(1200),
      })
      .passthrough()
      .default({
        map_image_id: "",
        headline: "",
        description: "",
      }),
    coverage_regions: z.array(regionSchema).default([]),
    recruitment_sources: z.array(iconTitleDescSchema).default([]),
    screening_flow: z.array(trainingStepSchema).default([]),
    network_nodes: z.array(networkNodeSchema).default([]),
    quality_control_items: z.array(iconTitleDescSchema).default([]),
    final_cta: japanFinalCtaSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
  })
  .passthrough();

export type JaringanRekrutmenInput = z.infer<typeof jaringanRekrutmenSchema>;
