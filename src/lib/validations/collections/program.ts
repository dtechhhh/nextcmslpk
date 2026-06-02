import { z } from "zod";

import {
  contentIdSchema,
  ctaFields,
  ctaDefaults,
  faqItemSchema,
  identityFields,
  identityDefaults,
  legacyTitleDescArray,
  mediaIdSchema,
  optionalString,
  sidebarFields,
  sidebarDefaults,
} from "@/lib/validations/collections/_shared";

const sortFields = {
  is_enabled: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
};

const itemWithTitleDesc = z
  .object({
    title: optionalString(300),
    description: optionalString(1200),
    ...sortFields,
  })
  .passthrough();

const textItem = z
  .object({
    text: optionalString(1200),
    ...sortFields,
  })
  .passthrough();

const costItem = z
  .object({
    title: optionalString(200),
    amount_label: optionalString(200),
    ...sortFields,
  })
  .passthrough();

const testimonialItem = z
  .object({
    name: optionalString(200),
    role_or_program: optionalString(200),
    quote: optionalString(1200),
    image_id: mediaIdSchema,
    ...sortFields,
  })
  .passthrough();

export const programSchema = z
  .object({
    ...identityFields,
    ...ctaFields,
    ...sidebarFields,
    excerpt: optionalString(600),
    short_description: optionalString(600),
    overview: optionalString(2000),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    program_type_option_id: contentIdSchema,
    location_option_id: contentIdSchema,
    gender_option_id: contentIdSchema,
    min_age: z.coerce.number().int().min(0).max(100).default(0),
    max_age: z.coerce.number().int().min(0).max(100).default(0),
    education_level_option_id: contentIdSchema,
    language_level_option_id: contentIdSchema,
    duration_label: optionalString(120),
    capacity_label: optionalString(120),
    contract_label: optionalString(120),
    salary_range_label: optionalString(200),
    target_language_label: optionalString(120),
    visa_path_label: optionalString(200),
    highlight_label: optionalString(200),
    why_choose_items: legacyTitleDescArray(itemWithTitleDesc),
    curriculum_items: legacyTitleDescArray(itemWithTitleDesc),
    timeline_items: legacyTitleDescArray(itemWithTitleDesc),
    requirements: z.array(z.union([z.string(), textItem])).default([]),
    benefits: z.array(z.union([z.string(), textItem])).default([]),
    cost_items: legacyTitleDescArray(costItem),
    career_opportunity_items: legacyTitleDescArray(itemWithTitleDesc),
    legality_partner_items: legacyTitleDescArray(itemWithTitleDesc),
    testimonials: z.array(testimonialItem).default([]),
    faqs: z.array(faqItemSchema).default([]),
    brochure_file_id: contentIdSchema,
    brochure_enabled: z.boolean().default(false),
  })
  .passthrough();

export type ProgramData = z.infer<typeof programSchema>;

export const programDefaults: ProgramData = {
  ...identityDefaults,
  ...ctaDefaults,
  ...sidebarDefaults,
  excerpt: "",
  short_description: "",
  overview: "",
  status: "DRAFT",
  program_type_option_id: "",
  location_option_id: "",
  gender_option_id: "",
  min_age: 0,
  max_age: 0,
  education_level_option_id: "",
  language_level_option_id: "",
  duration_label: "",
  capacity_label: "",
  contract_label: "",
  salary_range_label: "",
  target_language_label: "",
  visa_path_label: "",
  highlight_label: "",
  why_choose_items: [],
  curriculum_items: [],
  timeline_items: [],
  requirements: [],
  benefits: [],
  cost_items: [],
  career_opportunity_items: [],
  legality_partner_items: [],
  testimonials: [],
  faqs: [],
  brochure_file_id: "",
  brochure_enabled: false,
};
