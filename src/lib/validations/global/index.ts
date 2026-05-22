import type { ZodType } from "zod";

import {
  indonesiaBrandHeaderSchema,
  japanBrandHeaderSchema,
} from "@/lib/validations/global/brand-header";
import {
  indonesiaFooterSchema,
  japanFooterSchema,
} from "@/lib/validations/global/footer";
import { lineBusinessContactSchema } from "@/lib/validations/global/line-business-contact";
import { whatsappContactSchema } from "@/lib/validations/global/whatsapp-contact";
import type { ConfigKey } from "@/lib/constants";
import type { VariantKey } from "@/types";

export type GlobalConfigSchemaKey =
  | "indonesia.brand_header"
  | "indonesia.whatsapp_contact"
  | "indonesia.footer"
  | "japan.brand_header"
  | "japan.line_business_contact"
  | "japan.footer";

export const GLOBAL_CONFIG_SCHEMAS = {
  "indonesia.brand_header": indonesiaBrandHeaderSchema,
  "indonesia.whatsapp_contact": whatsappContactSchema,
  "indonesia.footer": indonesiaFooterSchema,
  "japan.brand_header": japanBrandHeaderSchema,
  "japan.line_business_contact": lineBusinessContactSchema,
  "japan.footer": japanFooterSchema,
} satisfies Record<GlobalConfigSchemaKey, ZodType>;

export function getGlobalConfigSchema(
  variantKey: VariantKey,
  configKey: ConfigKey,
) {
  const schemaKey = `${variantKey}.${configKey}` as GlobalConfigSchemaKey;

  return GLOBAL_CONFIG_SCHEMAS[schemaKey] ?? null;
}

export function isAllowedGlobalConfigKey(
  variantKey: VariantKey,
  configKey: ConfigKey,
) {
  return Boolean(getGlobalConfigSchema(variantKey, configKey));
}
