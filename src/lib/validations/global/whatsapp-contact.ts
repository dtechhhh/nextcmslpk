import { z } from "zod";

import {
  emptyOrEmail,
  emptyOrUrl,
  optionalString,
  whatsappNumberSchema,
} from "@/lib/validations/global/_shared";

export const whatsappContactSchema = z
  .object({
    whatsapp: z
      .object({
        number: whatsappNumberSchema,
        default_message_template: optionalString(500),
        floating_is_enabled: z.boolean().default(true),
        floating_icon_only_label: optionalString(80),
        floating_label_after_scroll: optionalString(120),
        floating_position: z.enum(["bottom_right", "bottom_left"]).default("bottom_right"),
      })
      .passthrough(),
    contact: z
      .object({
        phone_label: optionalString(100),
        email: emptyOrEmail("Email"),
        address: optionalString(1000),
        map_url: emptyOrUrl("Google Maps embed URL"),
        operational_hours: optionalString(300),
      })
      .passthrough(),
    social_links: z
      .object({
        instagram: emptyOrUrl("Instagram"),
        youtube: emptyOrUrl("YouTube"),
        tiktok: emptyOrUrl("TikTok"),
        facebook: emptyOrUrl("Facebook"),
        line: emptyOrUrl("LINE"),
      })
      .passthrough(),
  })
  .passthrough();

export type WhatsappContactInput = z.infer<typeof whatsappContactSchema>;
