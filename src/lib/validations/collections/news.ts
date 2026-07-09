import { z } from "zod";

import {
  contentIdSchema,
  mediaIdSchema,
  optionalString,
  sidebarDefaults,
} from "@/lib/validations/collections/_shared";
import { EXCERPT_MAX_LENGTH } from "@/lib/content-summary-limits";
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

const newsFactSchema = z
  .object({
    label: optionalString(120),
    value: optionalString(240),
    is_enabled: z.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).default(0),
  })
  .passthrough();

const newsEvidenceSchema = z
  .object({
    title: optionalString(200),
    description: optionalString(800),
    source_label: optionalString(160),
    source_url: optionalString(500),
    is_enabled: z.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).default(0),
  })
  .passthrough();

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
    excerpt: optionalString(EXCERPT_MAX_LENGTH),
    cover_image_id: mediaIdSchema,
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    is_featured: z.boolean().default(false),
    published_at: z.string().default(""),
    reading_time_label: optionalString(60),
    sort_order: z.coerce.number().int().min(0).default(0),
    content_type_option_id: contentIdSchema,
    category_option_id: contentIdSchema,
    tag_option_ids: z.array(z.string()).default([]),
    author_name: optionalString(200),
    author_title: optionalString(200),
    author_image_id: mediaIdSchema,
    partner_relevance: optionalString(1600),
    key_takeaways: z.array(optionalString(300)).default([]),
    key_facts: z.array(newsFactSchema).default([]),
    evidence_items: z.array(newsEvidenceSchema).default([]),
    reviewer_name: optionalString(200),
    reviewer_title: optionalString(200),
    reviewed_at: z.string().default(""),
    article_cta_label: optionalString(120),
    article_line_message_template: optionalString(600),
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
  content_type_option_id: "",
  category_option_id: "",
  tag_option_ids: [],
  author_name: "",
  author_title: "",
  author_image_id: "",
  partner_relevance: "",
  key_takeaways: [],
  key_facts: [],
  evidence_items: [],
  reviewer_name: "",
  reviewer_title: "",
  reviewed_at: "",
  article_cta_label: "",
  article_line_message_template: "",
  content_blocks: [],
  related_source: "same_category",
  manual_news_ids: [],
  related_articles: [],
  related_max_items: 3,
};
