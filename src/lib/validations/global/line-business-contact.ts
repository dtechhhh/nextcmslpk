import { z } from "zod";

import {
  emptyOrEmail,
  emptyOrUrl,
  mediaIdSchema,
  optionalString,
  requiredString,
} from "@/lib/validations/global/_shared";

export const lineBusinessContactSchema = z
  .object({
    line_contact: z
      .object({
        line_official_account_id: optionalString(120),
        line_display_label: optionalString(120),
        default_message_template: optionalString(500),
        is_enabled: z.boolean().default(true),
      })
      .passthrough(),
    business_email: z
      .object({
        email: emptyOrEmail("Business email"),
        default_subject_template: optionalString(200),
        is_enabled: z.boolean().default(true),
      })
      .passthrough(),
    business_contact_note: z
      .object({
        short_note: optionalString(500),
      })
      .passthrough(),
    business_info: z
      .object({
        phone_label: optionalString(120),
        address: optionalString(1000),
        map_url: emptyOrUrl("Map URL"),
        operational_hours: optionalString(300),
        language_support: z.array(requiredString("Language support", 100)).default([]),
      })
      .passthrough(),
    documents: z
      .object({
        company_profile_file_id: mediaIdSchema,
        curriculum_file_id: mediaIdSchema,
      })
      .passthrough(),
    social_links: z
      .object({
        line: emptyOrUrl("LINE"),
        linkedin: emptyOrUrl("LinkedIn"),
        youtube: emptyOrUrl("YouTube"),
        instagram: emptyOrUrl("Instagram"),
      })
      .passthrough(),
  })
  .passthrough();

export type LineBusinessContactInput = z.infer<typeof lineBusinessContactSchema>;
