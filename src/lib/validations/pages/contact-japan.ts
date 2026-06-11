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

const inquiryFlowSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const contactCardSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const contactFaqSchema = z
  .object({
    question: optionalString(300),
    answer: optionalString(1200),
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

export const contactJapanSchema = z
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
    contact_channels: z
      .object({
        line_official_account_id: optionalString(120),
        line_cta_label: optionalString(120),
        line_message_template: optionalString(600),
        line_description: optionalString(500),
        business_email: optionalString(254),
        email_subject_template: optionalString(300),
        email_description: optionalString(500),
        form_cta_label: optionalString(120),
      })
      .passthrough()
      .default({
        line_official_account_id: "",
        line_cta_label: "",
        line_message_template: "",
        line_description: "",
        business_email: "",
        email_subject_template: "",
        email_description: "",
        form_cta_label: "",
      }),
    trust_points: z.array(contactCardSchema).default([]),
    consultation_topics: z.array(contactCardSchema).default([]),
    inquiry_form: z
      .object({
        submit_label: optionalString(120),
        consent_label: optionalString(500),
        response_note: optionalString(500),
      })
      .passthrough()
      .default({
        submit_label: "",
        consent_label: "",
        response_note: "",
      }),
    preparation_items: z.array(optionalString(300)).default([]),
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
        description: optionalString(700),
        business_hours: optionalString(300),
        language_support: z.array(optionalString(120)).default([]),
        address: optionalString(500),
        map_url: emptyOrUrl("Map URL"),
        map_embed_url: emptyOrUrl("Map embed URL"),
      })
      .passthrough()
      .default({
        description: "",
        business_hours: "",
        language_support: [],
        address: "",
        map_url: "",
        map_embed_url: "",
      }),
    inquiry_flow: z.array(inquiryFlowSchema).default([]),
    faqs: z.array(contactFaqSchema).default([]),
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

export type ContactJapanInput = z.infer<typeof contactJapanSchema>;
