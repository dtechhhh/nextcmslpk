import type { CSSProperties } from "react";

import type { VariantKey } from "@/types";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export function getVariantAppearanceStyle(
  variant: VariantKey,
  value: unknown,
): ThemeStyle | undefined {
  const appearance = record(value);
  const primary = hexColor(appearance.primary_color);
  const primaryHover = hexColor(appearance.primary_hover_color);
  const accent = hexColor(appearance.accent_color);
  const cta = hexColor(appearance.cta_color);
  const style: ThemeStyle = {};

  if (primary) {
    setPrimaryTokens(style, variant, primary, primaryHover);
  } else if (primaryHover) {
    style["--color-primary-hover"] = primaryHover;
  }

  if (accent) {
    setAccentTokens(style, accent);
  }

  if (cta) {
    style["--color-cta"] = cta;

    if (variant === "indonesia") {
      style["--color-brand-whatsapp"] = cta;
    } else {
      style["--color-jp-line"] = cta;
    }
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

function setPrimaryTokens(
  style: ThemeStyle,
  variant: VariantKey,
  primary: string,
  explicitHover: string | undefined,
) {
  const hover = explicitHover ?? mix(primary, 78, "black");

  style["--color-primary"] = primary;
  style["--color-primary-hover"] = hover;
  style["--primary"] = primary;
  style["--primary-50"] = mix(primary, 8, "white");
  style["--primary-100"] = mix(primary, 16, "white");
  style["--primary-200"] = mix(primary, 28, "white");
  style["--primary-300"] = mix(primary, 46, "white");
  style["--primary-500"] = primary;
  style["--primary-700"] = hover;
  style["--color-section-alt"] = mix(primary, variant === "indonesia" ? 10 : 6, "white");

  if (variant === "indonesia") {
    style["--color-brand-primary"] = primary;
    style["--color-brand-primary-hover"] = hover;
    style["--color-brand-primary-50"] = style["--primary-50"];
    style["--color-brand-primary-100"] = style["--primary-100"];
    style["--color-brand-primary-200"] = style["--primary-200"];
    style["--color-brand-primary-300"] = style["--primary-300"];
    style["--color-brand-primary-500"] = primary;
    style["--color-brand-primary-600"] = hover;
    style["--color-brand-primary-700"] = hover;
  } else {
    style["--color-jp-primary"] = primary;
    style["--color-jp-primary-hover"] = hover;
    style["--color-jp-primary-50"] = style["--primary-50"];
    style["--color-jp-primary-100"] = style["--primary-100"];
    style["--color-jp-primary-200"] = style["--primary-200"];
    style["--color-jp-primary-300"] = style["--primary-300"];
    style["--color-jp-primary-500"] = primary;
    style["--color-jp-primary-600"] = hover;
    style["--color-jp-primary-700"] = hover;
  }
}

function setAccentTokens(style: ThemeStyle, accent: string) {
  const accentDark = mix(accent, 82, "black");

  style["--color-secondary"] = accent;
  style["--secondary-500"] = accent;
  style["--secondary-600"] = accentDark;
  style["--color-brand-secondary"] = accent;
  style["--color-brand-secondary-500"] = accent;
  style["--color-brand-secondary-600"] = accentDark;
  style["--color-jp-accent"] = accent;
}

function mix(color: string, amount: number, target: "white" | "black") {
  return `color-mix(in srgb, ${color} ${amount}%, ${target})`;
}

function hexColor(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
