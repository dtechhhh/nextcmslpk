import { z } from "zod";

import {
  emptyStringFromNullish,
  mediaIdSchema,
  optionalString,
  sortOrderSchema,
} from "@/lib/validations/global/_shared";

export { mediaIdSchema, optionalString, sortOrderSchema };

export const statusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED", "FILLED"]);

export const identityFields = {
  title: optionalString(200),
  slug: optionalString(120),
  subtitle: optionalString(200),
  thumbnail_image_id: mediaIdSchema,
  hero_image_id: mediaIdSchema,
} as const;

export const identityDefaults = {
  title: "",
  slug: "",
  subtitle: "",
  thumbnail_image_id: "",
  hero_image_id: "",
} as const;

export const sidebarFields = {
  is_featured: z.boolean().default(false),
  sort_order: sortOrderSchema,
} as const;

export const sidebarDefaults = {
  is_featured: false,
  sort_order: 0,
} as const;

export const ctaFields = {
  primary_cta_label: optionalString(120),
  whatsapp_message_template: optionalString(600),
} as const;

export const ctaDefaults = {
  primary_cta_label: "",
  whatsapp_message_template: "",
} as const;

export const faqItemSchema = z
  .object({
    question: optionalString(300),
    answer: optionalString(1200),
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

export const contentIdSchema = z.preprocess(
  emptyStringFromNullish,
  z.string().trim().max(128).default(""),
);

export function legacyTitleDescArray(itemSchema: z.ZodType) {
  return z.preprocess(
    (value) => {
      if (!Array.isArray(value)) {
        return value;
      }

      return value.map((item, index) =>
        typeof item === "string"
          ? {
              title: item,
              description: "",
              is_enabled: true,
              sort_order: index,
            }
          : item,
      );
    },
    z.array(itemSchema).default([]),
  );
}
