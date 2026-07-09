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
import { SHORT_DESCRIPTION_MAX_LENGTH } from "@/lib/content-summary-limits";

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

export const offerSchema = z
  .object({
    ...identityFields,
    ...ctaFields,
    ...sidebarFields,
    short_description: optionalString(SHORT_DESCRIPTION_MAX_LENGTH),
    overview: optionalString(2000),
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
    start_at: z.string().default(""),
    expired_at: z.string().default(""),
    offer_type_option_id: contentIdSchema,
    target_audience_option_id: contentIdSchema,
    schedule_label: optionalString(200),
    duration_label: optionalString(120),
    format_label: optionalString(120),
    quota_label: optionalString(120),
    price_label: optionalString(120),
    original_price_label: optionalString(120),
    urgency_label: optionalString(200),
    batch_label: optionalString(300),
    hero_eyebrow_label: optionalString(120),
    intro_heading: optionalString(200),
    benefit_items: legacyTitleDescArray(itemWithTitleDesc),
    agenda_items: legacyTitleDescArray(itemWithTitleDesc),
    instructor_name: optionalString(200),
    instructor_role: optionalString(240),
    instructor_qualification: optionalString(240),
    instructor_experience: optionalString(300),
    instructor_description: optionalString(1600),
    instructor_image_id: contentIdSchema,
    detail_checklist_title: optionalString(200),
    detail_description: optionalString(3000),
    detail_checklist: z.array(z.string()).default([]),
    bonus_items: legacyTitleDescArray(itemWithTitleDesc),
    suitable_for_items: legacyTitleDescArray(itemWithTitleDesc),
    faqs: z.array(faqItemSchema).default([]),
  })
  .passthrough();

export type OfferData = z.infer<typeof offerSchema>;

export const offerDefaults: OfferData = {
  ...identityDefaults,
  ...ctaDefaults,
  ...sidebarDefaults,
  short_description: "",
  overview: "",
  status: "DRAFT",
  start_at: "",
  expired_at: "",
  offer_type_option_id: "",
  target_audience_option_id: "",
  schedule_label: "",
  duration_label: "",
  format_label: "",
  quota_label: "",
  price_label: "",
  original_price_label: "",
  urgency_label: "",
  batch_label: "",
  hero_eyebrow_label: "",
  intro_heading: "",
  benefit_items: [],
  agenda_items: [],
  instructor_name: "",
  instructor_role: "",
  instructor_qualification: "",
  instructor_experience: "",
  instructor_description: "",
  instructor_image_id: "",
  detail_checklist_title: "",
  detail_description: "",
  detail_checklist: [],
  bonus_items: [],
  suitable_for_items: [],
  faqs: [],
};
