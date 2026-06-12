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

const workFieldSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

const audiencePathSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    cta_label: optionalString(120),
    href: optionalString(500),
    ...enabledSortFields,
  })
  .passthrough();

const displayTextSchema = z
  .object({
    trust_title: optionalString(180),
    trust_description: optionalString(500),
    audience_paths_title: optionalString(180),
    audience_paths_description: optionalString(500),
    programs_title: optionalString(180),
    programs_description: optionalString(500),
    programs_cta_label: optionalString(120),
    work_fields_title: optionalString(180),
    work_fields_description: optionalString(500),
    jobs_title: optionalString(180),
    jobs_description: optionalString(500),
    jobs_cta_label: optionalString(120),
    steps_title: optionalString(180),
    steps_description: optionalString(500),
    applicant_steps_title: optionalString(180),
    applicant_steps_description: optionalString(500),
    testimonials_title: optionalString(180),
    faq_title: optionalString(180),
    faq_description: optionalString(500),
    blogs_title: optionalString(180),
    blogs_description: optionalString(500),
    blogs_cta_label: optionalString(120),
  })
  .passthrough()
  .default({
    trust_title: "",
    trust_description: "",
    audience_paths_title: "",
    audience_paths_description: "",
    programs_title: "",
    programs_description: "",
    programs_cta_label: "",
    work_fields_title: "",
    work_fields_description: "",
    jobs_title: "",
    jobs_description: "",
    jobs_cta_label: "",
    steps_title: "",
    steps_description: "",
    applicant_steps_title: "",
    applicant_steps_description: "",
    testimonials_title: "",
    faq_title: "",
    faq_description: "",
    blogs_title: "",
    blogs_description: "",
    blogs_cta_label: "",
  });

const foundationSectionSchema = z
  .object({
    is_enabled: z.boolean().default(true),
    eyebrow_label: optionalString(120),
    headline: optionalString(220),
    description: optionalString(1000),
    bullet_items: z.array(optionalString(300)).default([]),
    cta_label: optionalString(120),
    cta_href: optionalString(500),
  })
  .passthrough()
  .default({
    is_enabled: true,
    eyebrow_label: "",
    headline: "",
    description: "",
    bullet_items: [],
    cta_label: "",
    cta_href: "",
  });

export const homepageSchema = z
  .object({
    hero: mediaHeroSchema.default(defaultMediaHero),
    display_text: displayTextSchema,
    offer_section: z
      .object({
        is_enabled: z.boolean().default(false),
        source: z.enum(["active_featured_offer", "manual"]).default("active_featured_offer"),
        manual_offer_id: contentIdSchema,
        fallback_badge_label: optionalString(100),
        fallback_headline: optionalString(220),
        fallback_description: optionalString(700),
        fallback_image_id: mediaIdSchema,
        fallback_cta_label: optionalString(120),
        fallback_cta_href: optionalString(500),
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
        fallback_cta_label: "",
        fallback_cta_href: "",
      }),
    stats: z.array(statItemSchema).min(3).max(5).default([]),
    trust_cards: z.array(trustCardSchema).min(3).max(5).default([]),
    audience_paths: z.array(audiencePathSchema).min(2).max(4).default([]),
    foundation_section: foundationSectionSchema,
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
        is_enabled: z.boolean().default(true),
        source: z.literal("latest_active").default("latest_active"),
        max_items: z.coerce.number().int().min(1).max(20).default(5),
      })
      .passthrough()
      .default({
        is_enabled: true,
        source: "latest_active",
        max_items: 5,
      }),
    work_fields: z.array(workFieldSchema).max(8).default([]),
    steps: z.array(stepSchema).min(4).max(6).default([]),
    applicant_steps: z.array(stepSchema).min(3).max(6).default([]),
    faqs: z.array(faqItemSchema).min(3).default([]),
    testimonials: z.array(testimonialSchema).default([]),
    latest_blogs: z
      .object({
        is_enabled: z.boolean().default(true),
        source: z.literal("latest_published").default("latest_published"),
        max_items: z.coerce.number().int().min(1).max(20).default(5),
      })
      .passthrough()
      .default({
        is_enabled: true,
        source: "latest_published",
        max_items: 5,
      }),
    contact_section: contactSectionSchema.default(defaultContactSection),
  })
  .passthrough();

export type HomepageInput = z.infer<typeof homepageSchema>;
