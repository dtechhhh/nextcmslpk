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

const plainText = optionalString(2000).refine(
  (value) => !/<\/?[a-z][\s\S]*>/i.test(value),
  {
    message: "Paragraph harus plain text.",
  },
);

const contentBlock = z.discriminatedUnion("type", [
  z.object({
    ...blockBase,
    type: z.literal("heading"),
    data: z.object({
      level: z.enum(["h2", "h3"]).default("h2"),
      text: optionalString(300),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("paragraph"),
    data: z.object({
      text: plainText,
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("quote"),
    data: z.object({
      text: optionalString(1000),
      author: optionalString(200),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("image"),
    data: z.object({
      image_id: mediaIdSchema,
      alt_text: optionalString(200),
      caption: optionalString(300),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("youtube_embed"),
    data: z.object({
      video_id: optionalString(20),
      caption: optionalString(300),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("line_cta"),
    data: z.object({
      label: optionalString(120),
      line_message_template: optionalString(600),
    }),
  }),
  z.object({
    ...blockBase,
    type: z.literal("sector_callout"),
    data: z.object({
      sector_id: contentIdSchema,
    }),
  }),
]);

export const newsSchema = z
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
    author_image_id: mediaIdSchema,
    content_blocks: z.array(contentBlock).default([]),
    related_source: z
      .enum(["same_category", "same_tags", "manual"])
      .default("same_category"),
    manual_news_ids: z.array(z.string()).default([]),
    related_articles: z.array(z.string()).default([]),
    related_max_items: z.coerce.number().int().min(1).max(10).default(3),
  })
  .passthrough();

export type NewsData = z.infer<typeof newsSchema>;

export const newsDefaults: NewsData = {
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
  author_image_id: "",
  content_blocks: [],
  related_source: "same_category",
  manual_news_ids: [],
  related_articles: [],
  related_max_items: 3,
};
