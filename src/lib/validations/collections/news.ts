import { z } from "zod";

import {
  contentIdSchema,
  mediaIdSchema,
  optionalString,
  sidebarDefaults,
} from "@/lib/validations/collections/_shared";
import {
  headingBlockSchema,
  imageBlockSchema,
  lineCtaBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  sectorCalloutBlockSchema,
  youtubeBlockSchema,
  type ContentBlockType,
} from "@/lib/validations/shared/content-blocks";

const NEWS_BLOCK_TYPES: ContentBlockType[] = [
  "heading",
  "paragraph",
  "quote",
  "image",
  "youtube_embed",
  "line_cta",
  "sector_callout",
];

const contentBlock = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  imageBlockSchema,
  youtubeBlockSchema,
  lineCtaBlockSchema,
  sectorCalloutBlockSchema,
]);

const relatedArticleIdsSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value : []),
  z.array(z.string()).default([]),
);

export {
  headingBlockSchema,
  imageBlockSchema,
  lineCtaBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  sectorCalloutBlockSchema,
  youtubeBlockSchema,
  NEWS_BLOCK_TYPES,
};

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
    related_articles: relatedArticleIdsSchema,
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
