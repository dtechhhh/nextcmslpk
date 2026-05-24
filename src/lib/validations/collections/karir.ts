import { z } from "zod";

import {
  contentIdSchema,
  ctaDefaults,
  faqItemSchema,
  identityDefaults,
  optionalString,
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

export const karirSchema = z
  .object({
    ...identityDefaults,
    ...ctaDefaults,
    ...sidebarDefaults,
    excerpt: optionalString(600),
    short_description: optionalString(600),
    overview: optionalString(2000),
    status: z
      .enum(["DRAFT", "PUBLISHED", "CLOSED", "FILLED"])
      .default("DRAFT"),
    published_at: z.string().default(""),
    expired_at: z.string().default(""),
    karir_type_option_id: contentIdSchema,
    location_option_id: contentIdSchema,
    department_option_id: contentIdSchema,
    employment_type_option_id: contentIdSchema,
    work_arrangement_option_id: contentIdSchema,
    location_label: optionalString(200),
    salary_label: optionalString(200),
    experience_label: optionalString(200),
    education_label: optionalString(200),
    deadline_label: optionalString(120),
    overview_items: z.array(itemWithTitleDesc).default([]),
    role_description: optionalString(3000),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    benefits: z.array(itemWithTitleDesc).default([]),
    recruitment_steps: z.array(itemWithTitleDesc).default([]),
    faqs: z.array(faqItemSchema).default([]),
  })
  .passthrough();

export type KarirData = z.infer<typeof karirSchema>;

export const karirDefaults: KarirData = {
  ...identityDefaults,
  ...ctaDefaults,
  ...sidebarDefaults,
  excerpt: "",
  short_description: "",
  overview: "",
  status: "DRAFT",
  published_at: "",
  expired_at: "",
  karir_type_option_id: "",
  location_option_id: "",
  department_option_id: "",
  employment_type_option_id: "",
  work_arrangement_option_id: "",
  location_label: "",
  salary_label: "",
  experience_label: "",
  education_label: "",
  deadline_label: "",
  overview_items: [],
  role_description: "",
  responsibilities: [],
  requirements: [],
  benefits: [],
  recruitment_steps: [],
  faqs: [],
};
