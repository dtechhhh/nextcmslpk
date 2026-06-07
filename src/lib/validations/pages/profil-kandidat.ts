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
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
  })
  .passthrough();

const proofStatSchema = z
  .object({
    icon_key: iconKeySchema,
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

const pathwaySchema = z
  .object({
    pathway_label: optionalString(120),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const candidateExampleSchema = z
  .object({
    profile_label: optionalString(120),
    title: optionalString(180),
    description: optionalString(1000),
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

export const profilKandidatSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
    proof_stats: z.array(proofStatSchema).default([]),
    why_indonesia: z
      .object({
        image_id: mediaIdSchema,
        headline: optionalString(220),
        description: optionalString(1200),
        bullet_items: z.array(optionalString(300)).default([]),
      })
      .passthrough()
      .default({
        image_id: "",
        headline: "",
        description: "",
        bullet_items: [],
      }),
    candidate_strengths: z.array(iconTitleDescSchema).default([]),
    supported_pathways: z.array(pathwaySchema).default([]),
    candidate_examples: z.array(candidateExampleSchema).default([]),
    readiness_framework: z.array(iconTitleDescSchema).default([]),
    partner_perspective: z
      .object({
        quote: optionalString(1200),
        attribution_label: optionalString(180),
        is_enabled: z.boolean().default(false),
      })
      .passthrough()
      .default({
        quote: "",
        attribution_label: "",
        is_enabled: false,
      }),
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

export type ProfilKandidatInput = z.infer<typeof profilKandidatSchema>;
