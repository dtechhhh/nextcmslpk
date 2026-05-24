import { z } from "zod";

import {
  contentIdSchema,
  mediaIdSchema,
  optionalString,
  sidebarDefaults,
} from "@/lib/validations/collections/_shared";

const blockBase = {
  type: z.string(),
  sort_order: z.coerce.number().int().min(0).default(0),
};

const headingBlock = z.object({
  ...blockBase,
  type: z.literal("heading"),
  data: z.object({
    level: z.enum(["h2", "h3"]).default("h2"),
    text: optionalString(300),
  }),
});

const paragraphBlock = z.object({
  ...blockBase,
  type: z.literal("paragraph"),
  data: z.object({
    text: optionalString(2000).refine((value) => !/<\/?[a-z][\s\S]*>/i.test(value), {
      message: "Paragraph harus plain text.",
    }),
  }),
});

const quoteBlock = z.object({
  ...blockBase,
  type: z.literal("quote"),
  data: z.object({
    text: optionalString(1000),
    author: optionalString(200),
  }),
});

const imageBlock = z.object({
  ...blockBase,
  type: z.literal("image"),
  data: z.object({
    image_id: mediaIdSchema,
    alt_text: optionalString(200),
    caption: optionalString(300),
  }),
});

const youtubeBlock = z.object({
  ...blockBase,
  type: z.literal("youtube_embed"),
  data: z.object({
    video_id: optionalString(20),
    caption: optionalString(300),
  }),
});

const offerCalloutBlock = z.object({
  ...blockBase,
  type: z.literal("offer_callout"),
  data: z.object({
    offer_id: contentIdSchema,
  }),
});

const whatsappCtaBlock = z.object({
  ...blockBase,
  type: z.literal("whatsapp_cta"),
  data: z.object({
    label: optionalString(120),
    whatsapp_message_template: optionalString(600),
  }),
});

const contentBlock = z.discriminatedUnion("type", [
  headingBlock,
  paragraphBlock,
  quoteBlock,
  imageBlock,
  youtubeBlock,
  offerCalloutBlock,
  whatsappCtaBlock,
]);

export const blogSchema = z
  .object({
    ...sidebarDefaults,
    title: optionalString(200),
    slug: optionalString(120),
    subtitle: optionalString(200),
    excerpt: optionalString(600),
    cover_image_id: mediaIdSchema,
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    is_featured: z.boolean().default(false),
    published_at: z.string().default(""),
    reading_time_label: optionalString(60),
    sort_order: z.coerce.number().int().min(0).default(0),
    category_option_id: contentIdSchema,
    tag_option_ids: z.array(z.string()).default([]),
    author_name: optionalString(200),
    author_title: optionalString(200),
    author_bio: optionalString(1000),
    author_image_id: mediaIdSchema,
    content_blocks: z.array(contentBlock).default([]),
    related_source: z
      .enum(["same_category", "same_tags", "manual"])
      .default("same_category"),
    manual_blog_ids: z.array(z.string()).default([]),
    related_max_items: z.coerce.number().int().min(1).max(10).default(3),
  })
  .passthrough();

export type BlogData = z.infer<typeof blogSchema>;

export const blogDefaults: BlogData = {
  ...sidebarDefaults,
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  cover_image_id: "",
  status: "DRAFT",
  is_featured: false,
  published_at: "",
  reading_time_label: "",
  sort_order: 0,
  category_option_id: "",
  tag_option_ids: [],
  author_name: "",
  author_title: "",
  author_bio: "",
  author_image_id: "",
  content_blocks: [],
  related_source: "same_category",
  manual_blog_ids: [],
  related_max_items: 3,
};
