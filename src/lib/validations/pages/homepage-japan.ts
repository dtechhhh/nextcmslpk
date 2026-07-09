import { z } from "zod";

import {
  emptyOrUrl,
  enabledSortFields,
  iconKeySchema,
  mediaIdSchema,
  mediaPositionSchema,
  optionalString,
} from "@/lib/validations/pages/_shared";

const japanMediaHeroSchema = z
  .object({
    media_type: z.enum(["image", "video", "slider"]).default("image"),
    media_id: mediaIdSchema,
    slider_media_ids: z.array(mediaIdSchema).default([]),
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

const statItemSchema = z
  .object({
    icon_key: iconKeySchema,
    value: optionalString(80),
    label: optionalString(160),
    ...enabledSortFields,
  })
  .passthrough();

const achievementSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    document_label: optionalString(140),
    document_url: emptyOrUrl("Document URL"),
    ...enabledSortFields,
  })
  .passthrough();

const whyUsCardSchema = z
  .object({
    key: z.enum(["about", "recruitment_network", "sectors", "training_method"]),
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    href: optionalString(500),
    ...enabledSortFields,
  })
  .passthrough();

const partnershipStepSchema = z
  .object({
    step_label: optionalString(80),
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const legalitySchema = z
  .object({
    type_label: optionalString(140),
    title: optionalString(180),
    description: optionalString(700),
    document_label: optionalString(140),
    document_url: emptyOrUrl("Document URL"),
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

export const homepageJapanSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      slider_media_ids: [],
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
    stats: z.array(statItemSchema).min(3).max(6).default([]),
    achievements: z.array(achievementSchema).max(6).default([]),
    latest_news: z
      .object({
        source: z.literal("latest_published").default("latest_published"),
        max_items: z.coerce.number().int().min(1).max(4).default(4),
      })
      .passthrough()
      .default({
        source: "latest_published",
        max_items: 4,
      }),
    why_indonesia_section: z
      .object({
        media_type: z.enum(["image", "video"]).default("image"),
        image_id: mediaIdSchema,
        eyebrow_label: optionalString(120),
        headline: optionalString(220),
        description: optionalString(1200),
        bullet_items: z.array(optionalString(300)).default([]),
        cta_label: optionalString(120),
        target_page: z.literal("candidate_profile").default("candidate_profile"),
      })
      .passthrough()
      .default({
        media_type: "image",
        image_id: "",
        eyebrow_label: "",
        headline: "",
        description: "",
        bullet_items: [],
        cta_label: "",
        target_page: "candidate_profile",
      }),
    why_us_cards: z.array(whyUsCardSchema).min(4).max(4).default([]),
    partnership_flow: z
      .object({
        headline: optionalString(220),
        description: optionalString(700),
        items: z.array(partnershipStepSchema).min(3).max(6).default([]),
      })
      .passthrough()
      .default({
        headline: "",
        description: "",
        items: [],
      }),
    legalities: z.array(legalitySchema).max(8).default([]),
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

export type HomepageJapanInput = z.infer<typeof homepageJapanSchema>;
