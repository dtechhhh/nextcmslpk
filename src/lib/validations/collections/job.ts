import { z } from "zod";

import {
  contentIdSchema,
  ctaFields,
  ctaDefaults,
  faqItemSchema,
  identityFields,
  identityDefaults,
  legacyTitleDescArray,
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

export const jobSchema = z
  .object({
    ...identityFields,
    ...ctaFields,
    ...sidebarFields,
    excerpt: optionalString(600),
    short_description: optionalString(600),
    overview: optionalString(2000),
    status: z
      .enum(["DRAFT", "PUBLISHED", "CLOSED", "FILLED"])
      .default("DRAFT"),
    published_at: z.string().default(""),
    expired_at: z.string().default(""),
    job_type_option_id: contentIdSchema,
    location_option_id: contentIdSchema,
    job_field_option_id: contentIdSchema,
    gender_option_id: contentIdSchema,
    language_level_option_id: contentIdSchema,
    education_level_option_id: contentIdSchema,
    related_program_id: contentIdSchema,
    min_age: z.coerce.number().int().min(0).max(100).default(0),
    max_age: z.coerce.number().int().min(0).max(100).default(0),
    certificate_required_label: optionalString(200),
    experience_required_label: optionalString(200),
    ex_japan_required: z.boolean().default(false),
    required_documents: z.array(z.string()).default([]),
    location_label: optionalString(200),
    salary_range_label: optionalString(200),
    contract_label: optionalString(120),
    deadline_label: optionalString(120),
    quota_label: optionalString(120),
    overview_items: legacyTitleDescArray(itemWithTitleDesc),
    job_description: optionalString(3000),
    responsibilities: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    benefit_items: legacyTitleDescArray(itemWithTitleDesc),
    qualification_items: legacyTitleDescArray(itemWithTitleDesc),
    recruitment_steps: legacyTitleDescArray(itemWithTitleDesc),
    gallery_media_ids: z.array(z.string()).default([]),
    faqs: z.array(faqItemSchema).default([]),
  })
  .passthrough();

export type JobData = z.infer<typeof jobSchema>;

export const jobDefaults: JobData = {
  ...identityDefaults,
  ...ctaDefaults,
  ...sidebarDefaults,
  excerpt: "",
  short_description: "",
  overview: "",
  status: "DRAFT",
  published_at: "",
  expired_at: "",
  job_type_option_id: "",
  location_option_id: "",
  job_field_option_id: "",
  gender_option_id: "",
  language_level_option_id: "",
  education_level_option_id: "",
  related_program_id: "",
  min_age: 0,
  max_age: 0,
  certificate_required_label: "",
  experience_required_label: "",
  ex_japan_required: false,
  required_documents: [],
  location_label: "",
  salary_range_label: "",
  contract_label: "",
  deadline_label: "",
  quota_label: "",
  overview_items: [],
  job_description: "",
  responsibilities: [],
  benefits: [],
  requirements: [],
  benefit_items: [],
  qualification_items: [],
  recruitment_steps: [],
  gallery_media_ids: [],
  faqs: [],
};
