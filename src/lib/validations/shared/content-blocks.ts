import { z } from "zod";

import {
  contentIdSchema,
  mediaIdSchema,
  optionalString,
} from "@/lib/validations/collections/_shared";

const blockBase = {
  type: z.string(),
  sort_order: z.coerce.number().int().min(0).default(0),
};

export const youtubeVideoIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9_-]{11}$/,
    "YouTube video ID harus 11 karakter (alfanumerik, dash, underscore).",
  );

const plainTextValidator = (max = 2000) =>
  optionalString(max).refine((value) => !/<\/?[a-z][\s\S]*>/i.test(value), {
    message: "Teks harus plain text tanpa HTML.",
  });

export const headingBlockSchema = z.object({
  ...blockBase,
  type: z.literal("heading"),
  data: z.object({
    level: z.enum(["h2", "h3"]).default("h2"),
    text: optionalString(300),
  }),
});

export const paragraphBlockSchema = z.object({
  ...blockBase,
  type: z.literal("paragraph"),
  data: z.object({
    text: plainTextValidator(2000),
  }),
});

export const quoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal("quote"),
  data: z.object({
    text: optionalString(1000),
    author: optionalString(200),
  }),
});

export const imageBlockSchema = z.object({
  ...blockBase,
  type: z.literal("image"),
  data: z.object({
    image_id: mediaIdSchema,
    alt_text: optionalString(200),
    caption: optionalString(300),
  }),
});

export const youtubeBlockSchema = z.object({
  ...blockBase,
  type: z.literal("youtube_embed"),
  data: z.object({
    video_id: youtubeVideoIdSchema.refine(
      (value) => value === "" || /^[a-zA-Z0-9_-]{11}$/.test(value),
      {
        message:
          "YouTube video ID harus 11 karakter (alfanumerik, dash, underscore).",
      },
    ),
    caption: optionalString(300),
  }),
});

export const offerCalloutBlockSchema = z.object({
  ...blockBase,
  type: z.literal("offer_callout"),
  data: z.object({
    offer_id: contentIdSchema,
  }),
});

export const whatsappCtaBlockSchema = z.object({
  ...blockBase,
  type: z.literal("whatsapp_cta"),
  data: z.object({
    label: optionalString(120),
    whatsapp_message_template: optionalString(600),
  }),
});

export const lineCtaBlockSchema = z.object({
  ...blockBase,
  type: z.literal("line_cta"),
  data: z.object({
    label: optionalString(120),
    line_message_template: optionalString(600),
  }),
});

export const sectorCalloutBlockSchema = z.object({
  ...blockBase,
  type: z.literal("sector_callout"),
  data: z.object({
    sector_id: contentIdSchema,
    cta_label: optionalString(120),
  }),
});

export const ALL_BLOCK_SCHEMAS = {
  heading: headingBlockSchema,
  paragraph: paragraphBlockSchema,
  quote: quoteBlockSchema,
  image: imageBlockSchema,
  youtube_embed: youtubeBlockSchema,
  offer_callout: offerCalloutBlockSchema,
  whatsapp_cta: whatsappCtaBlockSchema,
  line_cta: lineCtaBlockSchema,
  sector_callout: sectorCalloutBlockSchema,
} as const;

export type ContentBlockType = keyof typeof ALL_BLOCK_SCHEMAS;

export function getDefaultBlockData(
  type: ContentBlockType,
): Record<string, unknown> {
  switch (type) {
    case "heading":
      return { level: "h2", text: "" };
    case "paragraph":
      return { text: "" };
    case "quote":
      return { text: "", author: "" };
    case "image":
      return { image_id: "", alt_text: "", caption: "" };
    case "youtube_embed":
      return { video_id: "", caption: "" };
    case "offer_callout":
      return { offer_id: "" };
    case "whatsapp_cta":
      return { label: "", whatsapp_message_template: "" };
    case "line_cta":
      return { label: "", line_message_template: "" };
    case "sector_callout":
      return { sector_id: "", cta_label: "" };
  }
}
