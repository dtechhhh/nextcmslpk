import { z } from "zod";

import {
  enabledSortFields,
  faqItemSchema,
  iconKeySchema,
  mediaIdSchema,
  mediaPositionSchema,
  optionalString,
} from "@/lib/validations/pages/_shared";

const japanMediaHeroSchema = z
  .object({
    model: z.enum(["standard", "candidate_pool"]).default("standard"),
    media_type: z.enum(["image", "video"]).default("image"),
    media_id: mediaIdSchema,
    mobile_media_type: z.enum(["image", "video"]).default("image"),
    mobile_media_id: mediaIdSchema,
    media_position: mediaPositionSchema,
    mobile_media_position: mediaPositionSchema,
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
    initials: optionalString(8),
    name: optionalString(140),
    age_origin_label: optionalString(140),
    background_label: optionalString(80),
    background_text: optionalString(1000),
    target_path_label: optionalString(80),
    target_path_text: optionalString(700),
    language_label: optionalString(80),
    language_text: optionalString(400),
    character_label: optionalString(80),
    character_text: optionalString(700),
    screening_label: optionalString(80),
    screening_text: optionalString(700),
    availability_label: optionalString(80),
    availability_text: optionalString(400),
    readiness_label: optionalString(140),
    readiness_is_enabled: z.boolean().default(true),
    highlight_tags: z.array(optionalString(80)).default([]),
    profile_label: optionalString(120),
    title: optionalString(180),
    description: optionalString(1000),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

const candidatePoolCandidateSchema = z
  .object({
    initials: optionalString(8),
    name: optionalString(140),
    nationality_label: optionalString(120),
    target_sector_label: optionalString(160),
    age_label: optionalString(80),
    japanese_level_label: optionalString(120),
    readiness_label: optionalString(140),
    availability_label: optionalString(140),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

const stepSchema = z
  .object({
    icon_key: iconKeySchema,
    step_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const candidatePoolHeroSchema = z
  .object({
    eyebrow_label: optionalString(120),
    headline: optionalString(220),
    subheadline: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
    trust_note: optionalString(220),
    stats: z.array(proofStatSchema).default([]),
    candidate_cards: z.array(candidatePoolCandidateSchema).default([]),
  })
  .passthrough()
  .default({
    eyebrow_label: "",
    headline: "",
    subheadline: "",
    primary_cta_label: "",
    primary_line_message_template: "",
    secondary_cta_label: "",
    secondary_href: "",
    trust_note: "",
    stats: [],
    candidate_cards: [],
  });

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
      model: "standard",
      media_type: "image",
      media_id: "",
      mobile_media_type: "image",
      mobile_media_id: "",
      media_position: "center",
      mobile_media_position: "center",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
    candidate_pool_hero: candidatePoolHeroSchema,
    proof_stats: z.array(proofStatSchema).default([]),
    why_indonesia: z
      .object({
        media_type: z.enum(["image", "video"]).default("image"),
        image_id: mediaIdSchema,
        headline: optionalString(220),
        description: optionalString(1200),
        bullet_items: z.array(optionalString(300)).default([]),
      })
      .passthrough()
      .default({
        media_type: "image",
        image_id: "",
        headline: "",
        description: "",
        bullet_items: [],
      }),
    candidate_strengths: z.array(iconTitleDescSchema).default([]),
    supported_pathways: z.array(pathwaySchema).default([]),
    candidate_examples: z.array(candidateExampleSchema).default([]),
    selection_assurance: z.array(iconTitleDescSchema).default([]),
    handoff_process: z.array(stepSchema).default([]),
    faqs: z.array(faqItemSchema).default([]),
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
