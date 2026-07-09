import { z } from "zod";

import {
  contactSectionSchema,
  defaultContactSection,
  defaultMediaHero,
  emptyOrUrl,
  enabledSortFields,
  iconKeySchema,
  mediaHeroSchema,
  mediaIdSchema,
  optionalString,
  statItemSchema,
} from "@/lib/validations/pages/_shared";

const valueSchema = z
  .object({
    icon_key: iconKeySchema,
    headline: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const teamMemberSchema = z
  .object({
    name: optionalString(140),
    role: optionalString(180),
    organization_name: optionalString(180),
    responsibility: optionalString(700),
    credentials: optionalString(700),
    bio: optionalString(1000),
    image_id: mediaIdSchema,
    ...enabledSortFields,
  })
  .passthrough();

const companyFactSchema = z
  .object({
    icon_key: iconKeySchema,
    value: optionalString(100),
    label: optionalString(160),
    description: optionalString(500),
    ...enabledSortFields,
  })
  .passthrough();

const relationshipPersonSchema = z
  .object({
    side_label: optionalString(80),
    name: optionalString(140),
    role: optionalString(180),
    organization: optionalString(180),
    summary: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const readinessItemSchema = z
  .object({
    status: z.enum(["completed", "in_progress", "planned"]).default("planned"),
    status_label: optionalString(80),
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    target_label: optionalString(120),
    ...enabledSortFields,
  })
  .passthrough();

const timelineItemSchema = z
  .object({
    year_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const partnerSchema = z
  .object({
    name: optionalString(160),
    logo_image_id: mediaIdSchema,
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const legalitySchema = z
  .object({
    icon_key: iconKeySchema,
    type_label: optionalString(140),
    title: optionalString(180),
    description: optionalString(700),
    issuing_authority: optionalString(180),
    issued_date_label: optionalString(120),
    status_label: optionalString(100),
    document_label: optionalString(140),
    document_url: emptyOrUrl("URL dokumen"),
    ...enabledSortFields,
  })
  .passthrough();

const finalCtaSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_whatsapp_message: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
  })
  .passthrough();

export const tentangKamiSchema = z
  .object({
    hero: mediaHeroSchema.default(defaultMediaHero),
    proof_stats: z.array(statItemSchema).default([]),
    company_status: z
      .object({
        eyebrow_label: optionalString(120),
        headline: optionalString(220),
        description: optionalString(1200),
        status_label: optionalString(140),
        last_updated_label: optionalString(140),
        facts: z.array(companyFactSchema).default([]),
      })
      .passthrough()
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        status_label: "",
        last_updated_label: "",
        facts: [],
      }),
    story: z
      .object({
        badge_label: optionalString(100),
        headline: optionalString(220),
        body: optionalString(4000),
        image_id: mediaIdSchema,
      })
      .passthrough()
      .default({
        badge_label: "",
        headline: "",
        body: "",
        image_id: "",
      }),
    japan_relationship: z
      .object({
        eyebrow_label: optionalString(120),
        headline: optionalString(220),
        description: optionalString(1200),
        people: z.array(relationshipPersonSchema).default([]),
        cooperation_scope: z.array(optionalString(240)).default([]),
        clarification_note: optionalString(700),
      })
      .passthrough()
      .default({
        eyebrow_label: "",
        headline: "",
        description: "",
        people: [],
        cooperation_scope: [],
        clarification_note: "",
      }),
    education_quality: z
      .object({
        image_id: mediaIdSchema,
        eyebrow_label: optionalString(120),
        qualification_label: optionalString(120),
        headline: optionalString(220),
        description: optionalString(1200),
        leader_name: optionalString(140),
        leader_role: optionalString(180),
        experience_label: optionalString(180),
        focus_items: z.array(optionalString(240)).default([]),
      })
      .passthrough()
      .default({
        image_id: "",
        eyebrow_label: "",
        qualification_label: "",
        headline: "",
        description: "",
        leader_name: "",
        leader_role: "",
        experience_label: "",
        focus_items: [],
      }),
    operational_readiness: z
      .object({
        headline: optionalString(220),
        description: optionalString(1200),
        items: z.array(readinessItemSchema).default([]),
      })
      .passthrough()
      .default({
        headline: "",
        description: "",
        items: [],
      }),
    timeline: z.array(timelineItemSchema).default([]),
    vision_mission: z
      .object({
        vision_headline: optionalString(180),
        vision_description: optionalString(1200),
        mission_headline: optionalString(180),
        mission_description: optionalString(1200),
      })
      .passthrough()
      .default({
        vision_headline: "",
        vision_description: "",
        mission_headline: "",
        mission_description: "",
      }),
    values: z.array(valueSchema).default([]),
    team_members: z.array(teamMemberSchema).default([]),
    gallery: z
      .object({
        media_ids: z.array(mediaIdSchema).default([]),
      })
      .passthrough()
      .default({
        media_ids: [],
      }),
    partners: z.array(partnerSchema).default([]),
    legalities: z.array(legalitySchema).default([]),
    contact_section: contactSectionSchema.default(defaultContactSection),
    final_cta: finalCtaSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_whatsapp_message: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
  })
  .passthrough();

export type TentangKamiInput = z.infer<typeof tentangKamiSchema>;
