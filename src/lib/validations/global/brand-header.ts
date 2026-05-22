import { z } from "zod";

import {
  mediaIdSchema,
  optionalString,
  requiredString,
  sortOrderSchema,
} from "@/lib/validations/global/_shared";

const indonesiaNavbarKeySchema = z.enum(["home", "program", "job", "about", "blog"]);
const japanNavbarKeySchema = z.enum([
  "about",
  "training_method",
  "candidate_profile",
  "news",
  "recruitment_network",
  "sectors",
  "contact",
]);

const headerStyleSchema = z.enum(["solid", "transparent_on_hero"]);

const indonesiaNavbarItemSchema = z
  .object({
    key: indonesiaNavbarKeySchema,
    label: requiredString("Label menu", 100),
    href: requiredString("Href menu", 500),
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

const japanNavbarItemSchema = z
  .object({
    key: japanNavbarKeySchema,
    label: requiredString("Label menu", 100),
    href: requiredString("Href menu", 500),
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

export const indonesiaBrandHeaderSchema = z
  .object({
    brand: z
      .object({
        lpk_name: requiredString("Nama LPK", 160),
        logo_image_id: mediaIdSchema,
        logo_light_image_id: mediaIdSchema,
      })
      .passthrough(),
    navbar: z.array(indonesiaNavbarItemSchema).default([]),
    variant_switch: z
      .object({
        is_enabled: z.boolean().default(true),
        target_variant_key: z.literal("japan").default("japan"),
        target_behavior: z.literal("homepage").default("homepage"),
      })
      .passthrough(),
    header_cta: z
      .object({
        label: optionalString(100),
        whatsapp_message_template: optionalString(500),
      })
      .passthrough(),
    header_behavior: z
      .object({
        sticky_header: z.boolean().default(true),
        header_style: headerStyleSchema.default("solid"),
      })
      .passthrough(),
  })
  .passthrough();

export const japanBrandHeaderSchema = z
  .object({
    brand: z
      .object({
        lpk_name: requiredString("Nama LPK", 160),
        tagline: optionalString(180),
        logo_image_id: mediaIdSchema,
        logo_light_image_id: mediaIdSchema,
      })
      .passthrough(),
    topbar: z
      .object({
        location_label: optionalString(160),
        email_label: optionalString(160),
        business_hours_label: optionalString(160),
        is_enabled: z.boolean().default(true),
      })
      .passthrough(),
    navbar: z.array(japanNavbarItemSchema).default([]),
    header_primary_cta: z
      .object({
        label: optionalString(100),
        type: z.literal("line").default("line"),
        line_message_template: optionalString(500),
      })
      .passthrough(),
    header_secondary_cta: z
      .object({
        label: optionalString(100),
        type: z.enum(["document", "internal_link"]).default("internal_link"),
        document_file_id: mediaIdSchema,
        href: optionalString(500),
        is_enabled: z.boolean().default(true),
      })
      .passthrough(),
    header_behavior: z
      .object({
        sticky_header: z.boolean().default(true),
        header_style: headerStyleSchema.default("solid"),
      })
      .passthrough(),
  })
  .passthrough();

export type IndonesiaBrandHeaderInput = z.infer<typeof indonesiaBrandHeaderSchema>;
export type JapanBrandHeaderInput = z.infer<typeof japanBrandHeaderSchema>;
