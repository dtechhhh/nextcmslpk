import { z } from "zod";

import {
  emptyStringFromNullish,
  emptyOrUrl,
  mediaIdSchema,
  optionalString,
  sortOrderSchema,
} from "@/lib/validations/global/_shared";

export const iconKeySchema = z.string().trim().max(120).default("");
export const mediaPositionSchema = z
  .enum(["center", "top", "bottom", "left", "right", "top-left", "top-right"])
  .default("center");
export const contentIdSchema = z.preprocess(
  emptyStringFromNullish,
  z.string().trim().max(128).default(""),
);

export const enabledSortFields = {
  is_enabled: z.boolean().default(true),
  sort_order: sortOrderSchema,
};

export const faqItemSchema = z
  .object({
    question: optionalString(300),
    answer: optionalString(1200),
    ...enabledSortFields,
  })
  .passthrough();

export const statItemSchema = z
  .object({
    icon_key: iconKeySchema,
    value: optionalString(80),
    label: optionalString(160),
    ...enabledSortFields,
  })
  .passthrough();

export const basicHeroSchema = z
  .object({
    headline: optionalString(220),
    subheadline: optionalString(600),
    image_id: mediaIdSchema,
    mobile_media_id: mediaIdSchema,
    media_position: mediaPositionSchema,
    mobile_media_position: mediaPositionSchema,
    primary_cta_label: optionalString(120),
    primary_cta_whatsapp_message: optionalString(600),
  })
  .passthrough();

export const defaultBasicHero = {
  headline: "",
  subheadline: "",
  image_id: "",
  mobile_media_id: "",
  media_position: "center" as const,
  mobile_media_position: "center" as const,
  primary_cta_label: "",
  primary_cta_whatsapp_message: "",
};

export const mediaHeroSchema = z
  .object({
    media_type: z.enum(["image", "video"]).default("image"),
    media_id: mediaIdSchema,
    mobile_media_type: z.enum(["image", "video"]).default("image"),
    mobile_media_id: mediaIdSchema,
    media_position: mediaPositionSchema,
    mobile_media_position: mediaPositionSchema,
    eyebrow_label: optionalString(120),
    headline: optionalString(220),
    subheadline: optionalString(600),
    primary_cta_label: optionalString(120),
    primary_cta_whatsapp_message: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_cta_href: optionalString(500),
  })
  .passthrough();

export const defaultMediaHero = {
  media_type: "image" as const,
  media_id: "",
  mobile_media_type: "image" as const,
  mobile_media_id: "",
  media_position: "center" as const,
  mobile_media_position: "center" as const,
  eyebrow_label: "",
  headline: "",
  subheadline: "",
  primary_cta_label: "",
  primary_cta_whatsapp_message: "",
  secondary_cta_label: "",
  secondary_cta_href: "",
};

export const finalCtaSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    cta_label: optionalString(120),
    whatsapp_message_template: optionalString(600),
  })
  .passthrough();

export const defaultFinalCta = {
  headline: "",
  description: "",
  cta_label: "",
  whatsapp_message_template: "",
};

export const contactSectionSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    use_global_contact: z.boolean().default(true),
  })
  .passthrough();

export const defaultContactSection = {
  headline: "",
  description: "",
  use_global_contact: true,
};

export const offerSourceSchema = z.enum([
  "active_featured_offer",
  "manual",
  "disabled",
]);

export { emptyOrUrl, mediaIdSchema, optionalString, sortOrderSchema };
