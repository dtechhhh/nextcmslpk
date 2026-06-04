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
    benefit_items: legacyTitleDescArray(itemWithTitleDesc),
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
  benefit_items: [],
  detail_description: "",
  detail_checklist: [],
  bonus_items: [],
  suitable_for_items: [],
  faqs: [],
};
