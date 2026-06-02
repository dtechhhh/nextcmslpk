import { z } from "zod";

export const mediaIdSchema = z.preprocess(
  emptyStringFromNullish,
  z.string().trim().max(128).default(""),
);

export const sortOrderSchema = z.coerce.number().int().min(0).default(0);

export function optionalString(max = 500) {
  return z.preprocess(
    emptyStringFromNullish,
    z.string().trim().max(max).default(""),
  );
}

export function requiredString(label: string, max = 200) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(max, `${label} maksimal ${max} karakter.`);
}

export function emptyOrUrl(label: string) {
  return z.preprocess(
    emptyStringFromNullish,
    z
      .string()
      .trim()
      .max(2048, `${label} terlalu panjang.`)
      .refine((value) => value === "" || isHttpUrl(value), {
        message: `${label} harus berupa URL http/https.`,
      })
      .default(""),
  );
}

export function emptyOrEmail(label: string) {
  return z.preprocess(
    emptyStringFromNullish,
    z
      .string()
      .trim()
      .max(254, `${label} terlalu panjang.`)
      .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: `${label} harus berupa email valid.`,
      })
      .default(""),
  );
}

export const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^628[0-9]{6,15}$/, "Nomor WhatsApp harus memakai format 628xxx.");

export function sortableFields() {
  return {
    is_enabled: z.boolean().default(true),
    sort_order: sortOrderSchema,
  };
}

export function zodErrorToFieldErrors(error: z.ZodError) {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";

    errors[key] = [...(errors[key] ?? []), issue.message];
  }

  return errors;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function emptyStringFromNullish(value: unknown) {
  return value === null || value === undefined ? "" : value;
}
