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
    bio: optionalString(1000),
    image_id: mediaIdSchema,
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
    title: optionalString(180),
    description: optionalString(700),
    document_label: optionalString(140),
    document_url: emptyOrUrl("URL dokumen"),
    ...enabledSortFields,
  })
  .passthrough();

export const tentangKamiSchema = z
  .object({
    hero: mediaHeroSchema.default(defaultMediaHero),
    proof_stats: z.array(statItemSchema).default([]),
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
  })
  .passthrough();

export type TentangKamiInput = z.infer<typeof tentangKamiSchema>;
