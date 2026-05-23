import { z } from "zod";

import {
  contactSectionSchema,
  contentIdSchema,
  defaultContactSection,
  defaultMediaHero,
  enabledSortFields,
  faqItemSchema,
  iconKeySchema,
  mediaHeroSchema,
  mediaIdSchema,
  optionalString,
  statItemSchema,
} from "@/lib/validations/pages/_shared";

const trustCardSchema = z
  .object({
    icon_key: iconKeySchema,
    headline: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const stepSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const testimonialSchema = z
  .object({
    name: optionalString(140),
    role_or_program: optionalString(180),
    quote: optionalString(1000),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

export const homepageSchema = z
  .object({
    hero: mediaHeroSchema.default(defaultMediaHero),
    offer_section: z
      .object({
        is_enabled: z.boolean().default(false),
        source: z.enum(["active_featured_offer", "manual"]).default("active_featured_offer"),
        manual_offer_id: contentIdSchema,
        fallback_badge_label: optionalString(100),
        fallback_headline: optionalString(220),
        fallback_description: optionalString(700),
        fallback_image_id: mediaIdSchema,
      })
      .passthrough()
      .default({
        is_enabled: false,
        source: "active_featured_offer",
        manual_offer_id: "",
        fallback_badge_label: "",
        fallback_headline: "",
        fallback_description: "",
        fallback_image_id: "",
      }),
    stats: z.array(statItemSchema).min(3).max(5).default([]),
    trust_cards: z.array(trustCardSchema).min(3).max(5).default([]),
    featured_programs: z
      .object({
        source: z.enum(["featured", "manual"]).default("featured"),
        manual_program_ids: z.array(contentIdSchema).default([]),
        max_items: z.coerce.number().int().min(1).max(3).default(3),
      })
      .passthrough()
      .default({
        source: "featured",
        manual_program_ids: [],
        max_items: 3,
      }),
    latest_jobs: z
      .object({
        source: z.literal("latest_active").default("latest_active"),
        max_items: z.coerce.number().int().min(1).max(20).default(5),
      })
      .passthrough()
      .default({
        source: "latest_active",
        max_items: 5,
      }),
    steps: z.array(stepSchema).min(4).max(6).default([]),
    faqs: z.array(faqItemSchema).min(3).default([]),
    testimonials: z.array(testimonialSchema).default([]),
    latest_blogs: z
      .object({
        source: z.literal("latest_published").default("latest_published"),
        max_items: z.coerce.number().int().min(1).max(20).default(5),
      })
      .passthrough()
      .default({
        source: "latest_published",
        max_items: 5,
      }),
    contact_section: contactSectionSchema.default(defaultContactSection),
  })
  .passthrough();

export type HomepageInput = z.infer<typeof homepageSchema>;
