import { z } from "zod";

import {
  emptyOrUrl,
  enabledSortFields,
  iconKeySchema,
  mediaIdSchema,
  mediaPositionSchema,
  optionalString,
} from "@/lib/validations/pages/_shared";

const japanMediaHeroSchema = z
  .object({
    media_type: z.enum(["image", "video"]).default("image"),
    media_id: mediaIdSchema,
    mobile_media_type: z.enum(["image", "video"]).default("image"),
    mobile_media_id: mediaIdSchema,
    media_position: mediaPositionSchema,
    mobile_media_position: mediaPositionSchema,
    headline: optionalString(220),
    subheadline: optionalString(600),
    eyebrow_label: optionalString(120),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
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

const timelineSchema = z
  .object({
    year_label: optionalString(80),
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const valueSchema = z
  .object({
    icon_key: iconKeySchema,
    title: optionalString(180),
    description: optionalString(700),
    ...enabledSortFields,
  })
  .passthrough();

const facilitySchema = z
  .object({
    title: optionalString(180),
    description: optionalString(700),
    image_id: mediaIdSchema,
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

const legalOverviewSchema = z
  .object({
    type_label: optionalString(140),
    title: optionalString(180),
    description: optionalString(700),
    issuing_authority: optionalString(180),
    issued_date_label: optionalString(120),
    status_label: optionalString(100),
    document_label: optionalString(140),
    document_url: emptyOrUrl("Document URL"),
    ...enabledSortFields,
  })
  .passthrough();

const leadershipQuoteSchema = z
  .object({
    is_enabled: z.boolean().default(true),
    quote: optionalString(900),
    attribution_name: optionalString(140),
    attribution_role: optionalString(160),
    photo_image_id: mediaIdSchema,
  })
  .passthrough();

const japanFinalCtaSchema = z
  .object({
    headline: optionalString(220),
    description: optionalString(700),
    primary_cta_label: optionalString(120),
    primary_line_message_template: optionalString(600),
    secondary_cta_label: optionalString(120),
    secondary_href: optionalString(500),
  })
  .passthrough();

export const tentangKamiJapanSchema = z
  .object({
    hero: japanMediaHeroSchema.default({
      media_type: "image",
      media_id: "",
      mobile_media_type: "image",
      mobile_media_id: "",
      media_position: "center",
      mobile_media_position: "center",
      headline: "",
      subheadline: "",
      eyebrow_label: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
    proof_stats: z.array(proofStatSchema).default([]),
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
        image_id: mediaIdSchema,
        eyebrow_label: optionalString(120),
        headline: optionalString(220),
        body: optionalString(4000),
      })
      .passthrough()
      .default({
        image_id: "",
        eyebrow_label: "",
        headline: "",
        body: "",
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
    leadership_quote: leadershipQuoteSchema.default({
      is_enabled: true,
      quote:
        "「私たちは単なる労働力の送り出し機関ではありません。候補者が日本で成功するまで、責任を持って関わり続ける長期的なパートナーです。」",
      attribution_name: "Aris Supriyadi",
      attribution_role: "代表取締役",
      photo_image_id: "",
    }),
    timeline: z.array(timelineSchema).default([]),
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
    facilities: z.array(facilitySchema).default([]),
    team_members: z.array(teamMemberSchema).default([]),
    legal_overview: z.array(legalOverviewSchema).default([]),
    final_cta: japanFinalCtaSchema.default({
      headline: "",
      description: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
  })
  .passthrough();

export type TentangKamiJapanInput = z.infer<typeof tentangKamiJapanSchema>;
