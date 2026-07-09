import { z } from "zod";

import {
  contentIdSchema,
  ctaDefaults,
  faqItemSchema,
  iconKeySchema,
  identityFields,
  identityDefaults,
  legacyTitleDescArray,
  mediaIdSchema,
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

const stepItemWithIcon = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(300),
    description: optionalString(1200),
    ...sortFields,
  })
  .passthrough();

const capabilityStatSchema = z
  .object({
    icon_key: iconKeySchema,
    value: optionalString(80),
    label: optionalString(160),
    ...sortFields,
  })
  .passthrough();

const positionCompetencySchema = z
  .object({
    title: optionalString(240),
    duties: optionalString(1400),
    practical_skills: optionalString(1400),
    tools_equipment: optionalString(1000),
    safety_focus: optionalString(1000),
    pass_standard: optionalString(1000),
    ...sortFields,
  })
  .passthrough();

const curriculumModuleSchema = z
  .object({
    title: optionalString(240),
    description: optionalString(1400),
    theory_hours_label: optionalString(120),
    practical_hours_label: optionalString(120),
    evaluation_method: optionalString(1000),
    ...sortFields,
  })
  .passthrough();

const mediaEvidenceSchema = z
  .object({
    title: optionalString(240),
    description: optionalString(1000),
    media_id: mediaIdSchema,
    ...sortFields,
  })
  .passthrough();

const candidateSnapshotSchema = z
  .object({
    initials: optionalString(8),
    name: optionalString(140),
    profile_label: optionalString(220),
    language_label: optionalString(160),
    skill_status_label: optionalString(180),
    experience_label: optionalString(180),
    availability_label: optionalString(180),
    image_id: mediaIdSchema,
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
    data_status_label: optionalString(160),
    pathway_label: optionalString(220),
    language_target_label: optionalString(180),
    skill_test_label: optionalString(220),
    readiness_lead_time_label: optionalString(180),
    last_verified_label: optionalString(160),
    reference_url: emptyOrUrl("Official reference URL"),
    capability_stats: z.array(capabilityStatSchema).default([]),
    position_competencies: z.array(positionCompetencySchema).default([]),
    curriculum_modules: z.array(curriculumModuleSchema).default([]),
    facility_items: z.array(mediaEvidenceSchema).default([]),
    candidate_snapshots: z.array(candidateSnapshotSchema).default([]),
    quality_assurance_items: legacyTitleDescArray(itemWithTitleDesc),
    placement_support_items: legacyTitleDescArray(itemWithTitleDesc),
    evidence_gallery: z.array(mediaEvidenceSchema).default([]),
    suitability_items: legacyTitleDescArray(itemWithTitleDesc),
    example_positions: legacyTitleDescArray(itemWithTitleDesc),
    training_alignment_items: legacyTitleDescArray(itemWithTitleDesc),
    candidate_requirements: z.array(z.string()).default([]),
    process_items: legacyTitleDescArray(stepItemWithIcon),
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
  data_status_label: "",
  pathway_label: "",
  language_target_label: "",
  skill_test_label: "",
  readiness_lead_time_label: "",
  last_verified_label: "",
  reference_url: "",
  capability_stats: [],
  position_competencies: [],
  curriculum_modules: [],
  facility_items: [],
  candidate_snapshots: [],
  quality_assurance_items: [],
  placement_support_items: [],
  evidence_gallery: [],
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
