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

const inquiryFlowSchema = z
  .object({
    icon_key: iconKeySchema,
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
    secondary_document_file_id: mediaIdSchema,
  })
  .passthrough();

export const contactJapanSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
    }),
    contact_channels: z
      .object({
        line_official_account_id: optionalString(120),
        line_cta_label: optionalString(120),
        line_message_template: optionalString(600),
        business_email: optionalString(254),
        email_subject_template: optionalString(300),
      })
      .passthrough()
      .default({
        line_official_account_id: "",
        line_cta_label: "",
        line_message_template: "",
        business_email: "",
        email_subject_template: "",
      }),
    partnership_pic: z
      .object({
        name: optionalString(140),
        role: optionalString(180),
        photo_image_id: mediaIdSchema,
        description: optionalString(700),
      })
      .passthrough()
      .default({
        name: "",
        role: "",
        photo_image_id: "",
        description: "",
      }),
    business_info: z
      .object({
        business_hours: optionalString(300),
        language_support: z.array(optionalString(120)).default([]),
        address: optionalString(500),
        map_url: optionalString(500),
        map_embed_url: optionalString(500),
      })
      .passthrough()
      .default({
        business_hours: "",
        language_support: [],
        address: "",
        map_url: "",
        map_embed_url: "",
      }),
    inquiry_flow: z.array(inquiryFlowSchema).default([]),
    final_cta: japanFinalCtaWithDocSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_document_file_id: "",
    }),
  })
  .passthrough();

export type ContactJapanInput = z.infer<typeof contactJapanSchema>;
