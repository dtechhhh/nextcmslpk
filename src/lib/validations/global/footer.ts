import { z } from "zod";

import {
  mediaIdSchema,
  optionalString,
  requiredString,
  sortOrderSchema,
} from "@/lib/validations/global/_shared";

const indonesiaQuickLinkKeySchema = z.enum([
  "home",
  "program",
  "job",
  "about",
  "blog",
  "career",
]);

const japanCompanyLinkKeySchema = z.enum([
  "about",
  "recruitment_network",
  "training_method",
]);

const japanResourceLinkKeySchema = z.enum([
  "candidate_profile",
  "sectors",
  "news",
  "curriculum",
]);

const indonesiaQuickLinkSchema = z
  .object({
    key: indonesiaQuickLinkKeySchema,
    label: requiredString("Label link", 100),
    href: requiredString("Href link", 500),
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

const japanCompanyLinkSchema = z
  .object({
    key: japanCompanyLinkKeySchema,
    label: requiredString("Label link", 100),
    href: requiredString("Href link", 500),
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

const japanResourceLinkSchema = z
  .object({
    key: japanResourceLinkKeySchema,
    label: requiredString("Label link", 100),
    href: optionalString(500),
    document_file_id: mediaIdSchema,
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  })
  .passthrough();

const footerBrandSchema = z
  .object({
    logo_image_id: mediaIdSchema,
    lpk_name: optionalString(160),
    short_description: optionalString(500),
  })
  .passthrough();

const footerContactSchema = z
  .object({
    use_global_contact: z.boolean().default(true),
  })
  .passthrough();

const footerLegalSchema = z
  .object({
    copyright_text: optionalString(300),
    show_powered_by: z.boolean().default(true),
  })
  .passthrough();

export const indonesiaFooterSchema = z
  .object({
    brand: footerBrandSchema,
    quick_links: z.array(indonesiaQuickLinkSchema).default([]),
    program_links: z
      .object({
        source: z.enum(["featured", "manual", "disabled"]).default("featured"),
        max_items: z.coerce.number().int().min(0).max(20).default(3),
        manual_program_ids: z.array(requiredString("Program ID", 128)).default([]),
      })
      .passthrough(),
    contact: footerContactSchema,
    legal: footerLegalSchema,
  })
  .passthrough();

export const japanFooterSchema = z
  .object({
    brand: footerBrandSchema,
    company_links: z.array(japanCompanyLinkSchema).default([]),
    resource_links: z.array(japanResourceLinkSchema).default([]),
    contact: footerContactSchema,
    legal: footerLegalSchema,
  })
  .passthrough();

export type IndonesiaFooterInput = z.infer<typeof indonesiaFooterSchema>;
export type JapanFooterInput = z.infer<typeof japanFooterSchema>;
