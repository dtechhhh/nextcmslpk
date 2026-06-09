import { z } from "zod";

import {
  enabledSortFields,
  emptyOrUrl,
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

const iconTitleDescSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
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

const trainingStepSchema = z
  .object({
    icon_key: iconKeySchema,
    step_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const galleryItemSchema = z
  .object({
    media_id: mediaIdSchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
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

export const metodePelatihanSchema = z
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
    curriculum_download: z
      .object({
        headline: optionalString(220),
        description: optionalString(700),
        file_url: emptyOrUrl("File URL"),
        file_id: mediaIdSchema,
        button_label: optionalString(120),
        is_enabled: z.boolean().default(false),
      })
      .passthrough()
      .default({
        headline: "",
        description: "",
        file_url: "",
        file_id: "",
        button_label: "",
        is_enabled: false,
    }),
    training_pillars: z.array(iconTitleDescSchema).min(3).max(6).default([]),
    training_flow: z.array(trainingStepSchema).min(3).max(6).default([]),
    curriculum_stats: z.array(proofStatSchema).default([]),
    curriculum_areas: z.array(iconTitleDescSchema).default([]),
    evaluation_items: z.array(iconTitleDescSchema).min(3).max(6).default([]),
    training_gallery: z.array(galleryItemSchema).default([]),
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

export type MetodePelatihanInput = z.infer<typeof metodePelatihanSchema>;
