import { z } from "zod";

import {
  enabledSortFields,
  emptyOrUrl,
  iconKeySchema,
  mediaIdSchema,
  optionalString,
} from "@/lib/validations/pages/_shared";

const japanMediaHeroSchema = z
  .object({
    media_type: z.enum(["image", "video"]).default("image"),
    media_id: mediaIdSchema,
    headline: optionalString(220),
    subheadline: optionalString(600),
    eyebrow_label: optionalString(120),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
  })
  .passthrough();

const iconTitleDescSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const proofStatSchema = z
  .object({
    icon_key: iconKeySchema,
    value: optionalString(80),
    label: optionalString(160),
    ...enabledSortFields,
  })
  .passthrough();

const trainingStepSchema = z
  .object({
    icon_key: iconKeySchema,
    step_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const sectionHeaderSchema = z
  .object({
    eyebrow_label: optionalString(120),
    headline: optionalString(220),
    description: optionalString(1000),
  })
  .passthrough();

const readinessCriterionSchema = z
  .object({
    competency_label: optionalString(180),
    assessment_method: optionalString(500),
    pass_standard: optionalString(500),
    evidence_label: optionalString(500),
    failure_action: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const sectorModuleSchema = z
  .object({
    icon_key: iconKeySchema,
    sector_label: optionalString(140),
    title: optionalString(180),
    description: optionalString(700),
    focus_items: z.array(optionalString(220)).default([]),
    ...enabledSortFields,
  })
  .passthrough();

const qualityGateSchema = z
  .object({
    stage_label: optionalString(100),
    title: optionalString(180),
    assessment_method: optionalString(500),
    pass_standard: optionalString(500),
    evidence_label: optionalString(500),
    failure_action: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const faqItemSchema = z
  .object({
    question: optionalString(300),
    answer: optionalString(1400),
    ...enabledSortFields,
  })
  .passthrough();

const galleryItemSchema = z
  .object({
    media_id: mediaIdSchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const japanFinalCtaWithDocSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_document_url: emptyOrUrl("Secondary document URL"),
    secondary_document_file_id: mediaIdSchema,
  })
  .passthrough();

export const metodePelatihanSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
    curriculum_download: z
      .object({
        headline: optionalString(220),
        description: optionalString(700),
        file_url: emptyOrUrl("File URL"),
        file_id: mediaIdSchema,
        button_label: optionalString(120),
        version_label: optionalString(120),
        updated_label: optionalString(120),
        language_label: optionalString(120),
        scope_label: optionalString(180),
        is_enabled: z.boolean().default(false),
      })
      .passthrough()
      .default({
        headline: "",
        description: "",
        file_url: "",
        file_id: "",
        button_label: "",
        version_label: "",
        updated_label: "",
        language_label: "",
        scope_label: "",
        is_enabled: false,
    }),
    partner_risks: sectionHeaderSchema
      .extend({ items: z.array(iconTitleDescSchema).default([]) })
      .default({ eyebrow_label: "", headline: "", description: "", items: [] }),
    training_pillars: z.array(iconTitleDescSchema).min(3).max(6).default([]),
    training_flow: z.array(trainingStepSchema).min(3).max(6).default([]),
    program_overview: sectionHeaderSchema
      .extend({
        stats: z.array(proofStatSchema).default([]),
        stages: z.array(trainingStepSchema).default([]),
      })
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        stats: [],
        stages: [],
      }),
    curriculum_stats: z.array(proofStatSchema).default([]),
    curriculum_areas: z.array(iconTitleDescSchema).default([]),
    sector_modules: sectionHeaderSchema
      .extend({ items: z.array(sectorModuleSchema).default([]) })
      .default({ eyebrow_label: "", headline: "", description: "", items: [] }),
    evaluation_items: z.array(iconTitleDescSchema).min(3).max(6).default([]),
    readiness_standards: sectionHeaderSchema
      .extend({ criteria: z.array(readinessCriterionSchema).default([]) })
      .default({ eyebrow_label: "", headline: "", description: "", criteria: [] }),
    quality_gates: sectionHeaderSchema
      .extend({
        governance_note: optionalString(1000),
        items: z.array(qualityGateSchema).default([]),
      })
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        governance_note: "",
        items: [],
      }),
    partner_report: sectionHeaderSchema
      .extend({
        image_id: mediaIdSchema,
        deliverables: z.array(optionalString(300)).default([]),
        sample_document_url: emptyOrUrl("Sample report URL"),
        sample_document_file_id: mediaIdSchema,
        sample_document_label: optionalString(140),
      })
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        image_id: "",
        deliverables: [],
        sample_document_url: "",
        sample_document_file_id: "",
        sample_document_label: "",
      }),
    outcome_evidence: sectionHeaderSchema
      .extend({
        stats: z.array(proofStatSchema).default([]),
        source_label: optionalString(220),
        period_label: optionalString(180),
        methodology_note: optionalString(1200),
      })
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        stats: [],
        source_label: "",
        period_label: "",
        methodology_note: "",
      }),
    training_gallery: z.array(galleryItemSchema).default([]),
    faq_intro: z
      .object({
        headline: optionalString(220),
        description: optionalString(700),
      })
      .passthrough()
      .default({ headline: "", description: "" }),
    faqs: z.array(faqItemSchema).default([]),
    final_cta: japanFinalCtaWithDocSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_document_url: "",
      secondary_document_file_id: "",
    }),
  })
  .passthrough();

export type MetodePelatihanInput = z.infer<typeof metodePelatihanSchema>;
