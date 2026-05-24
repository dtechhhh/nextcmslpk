import type { VariantKey } from "@/types"
import { indonesia, japan } from "./tokens"

export interface VariantOverrides {
  primary: string
  primaryHover: string
  primaryForeground: string
  accent: string
  ctaColor: string
  ctaColorForeground: string
  background: string
  sectionAlt: string
  headingColor: string
  bodyColor: string
  cardBackground: string
  cardBorder: string
  cardShadow: string
  heroOverlay: boolean
  headerStyle: "transparent-solid" | "solid"
  footerBackground: string
  footerForeground: string
}

export const indonesiaOverrides: VariantOverrides = {
  primary: indonesia.primary[500],
  primaryHover: indonesia.primary[600],
  primaryForeground: "#ffffff",
  accent: indonesia.secondary[500],
  ctaColor: indonesia.whatsapp,
  ctaColorForeground: "#ffffff",
  background: "#f8fafc",
  sectionAlt: "#eef7fc",
  headingColor: "#0f172a",
  bodyColor: "#475569",
  cardBackground: "#ffffff",
  cardBorder: "transparent",
  cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  heroOverlay: true,
  headerStyle: "transparent-solid",
  footerBackground: "#0f172a",
  footerForeground: "#ffffff",
}

export const japanOverrides: VariantOverrides = {
  primary: japan.primary[500],
  primaryHover: japan.primary[600],
  primaryForeground: "#ffffff",
  accent: japan.accent,
  ctaColor: japan.line,
  ctaColorForeground: "#ffffff",
  background: "#ffffff",
  sectionAlt: "#f1f5f9",
  headingColor: "#0f172a",
  bodyColor: "#475569",
  cardBackground: "#ffffff",
  cardBorder: "#e2e8f0",
  cardShadow: "none",
  heroOverlay: false,
  headerStyle: "solid",
  footerBackground: "#0f172a",
  footerForeground: "#ffffff",
}

export function getVariantOverrides(variant: VariantKey): VariantOverrides {
  return variant === "indonesia" ? indonesiaOverrides : japanOverrides
}
