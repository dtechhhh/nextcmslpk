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
  offerCalloutBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  whatsappCtaBlockSchema,
  youtubeBlockSchema,
  type ContentBlockType,
} from "@/lib/validations/shared/content-blocks";

const BLOG_BLOCK_TYPES: ContentBlockType[] = [
  "heading",
  "paragraph",
  "quote",
  "image",
  "youtube_embed",
  "offer_callout",
  "whatsapp_cta",
];

const contentBlock = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  imageBlockSchema,
  youtubeBlockSchema,
  offerCalloutBlockSchema,
  whatsappCtaBlockSchema,
]);

const blogSourceSchema = z
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
  offerCalloutBlockSchema,
  paragraphBlockSchema,
  quoteBlockSchema,
  whatsappCtaBlockSchema,
  youtubeBlockSchema,
  BLOG_BLOCK_TYPES,
};

export const blogSchema = z
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
    category_option_id: contentIdSchema,
    tag_option_ids: z.array(z.string()).default([]),
    author_name: optionalString(200),
    author_title: optionalString(200),
    author_bio: optionalString(1000),
    author_image_id: mediaIdSchema,
    key_takeaways: z.array(optionalString(300)).default([]),
    reviewer_name: optionalString(200),
    reviewer_title: optionalString(200),
    reviewed_at: z.string().default(""),
    source_items: z.array(blogSourceSchema).default([]),
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
  key_takeaways: [],
  reviewer_name: "",
  reviewer_title: "",
  reviewed_at: "",
  source_items: [],
  content_blocks: [],
  related_source: "same_category",
  manual_blog_ids: [],
  related_max_items: 3,
};
