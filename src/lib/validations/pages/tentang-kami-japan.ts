import { z } from "zod";

import {
  emptyOrUrl,
  enabledSortFields,
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

const proofStatSchema = z
  .object({
    value: optionalString(80),
    label: optionalString(160),
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
    document_label: optionalString(140),
    document_url: emptyOrUrl("Document URL"),
    ...enabledSortFields,
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
      headline: "",
      subheadline: "",
      eyebrow_label: "",
      primary_cta_label: "",
      primary_line_message_template: "",
      secondary_cta_label: "",
      secondary_href: "",
    }),
    proof_stats: z.array(proofStatSchema).default([]),
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
