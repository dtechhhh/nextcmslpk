import { z } from "zod";

import {
  contentIdSchema,
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
import { emptyOrUrl } from "@/lib/validations/global/_shared";

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

export const sectorSchema = z
  .object({
    ...identityFields,
    ...sidebarFields,
    title: optionalString(200),
    slug: optionalString(120),
    subtitle: optionalString(200),
    short_description: optionalString(SHORT_DESCRIPTION_MAX_LENGTH),
    overview: optionalString(3000),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    sector_category_option_id: contentIdSchema,
    suitability_items: legacyTitleDescArray(itemWithTitleDesc),
    example_positions: legacyTitleDescArray(itemWithTitleDesc),
    training_alignment_items: legacyTitleDescArray(itemWithTitleDesc),
    candidate_requirements: z.array(z.string()).default([]),
    process_items: legacyTitleDescArray(itemWithTitleDesc),
    faqs: z.array(faqItemSchema).default([]),
    primary_cta_label: optionalString(120),
    line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_document_url: emptyOrUrl("Secondary document URL"),
    secondary_document_file_id: contentIdSchema,
  })
  .passthrough();

export type SectorData = z.infer<typeof sectorSchema>;

export const sectorDefaults: SectorData = {
  ...identityDefaults,
  ...sidebarDefaults,
  ...ctaDefaults,
  title: "",
  slug: "",
  subtitle: "",
  short_description: "",
  overview: "",
  status: "DRAFT",
  sector_category_option_id: "",
  suitability_items: [],
  example_positions: [],
  training_alignment_items: [],
  candidate_requirements: [],
  process_items: [],
  faqs: [],
  primary_cta_label: "",
  line_message_template: "",
  secondary_cta_label: "",
  secondary_document_url: "",
  secondary_document_file_id: "",
};
