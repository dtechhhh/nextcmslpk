import type { CSSProperties } from "react"

export const MEDIA_POSITION_PRESETS = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
] as const

export type MediaPositionPreset = (typeof MEDIA_POSITION_PRESETS)[number]

const MEDIA_POSITION_VALUES: Record<MediaPositionPreset, string> = {
  center: "50% 50%",
  top: "50% 20%",
  bottom: "50% 80%",
  left: "25% 50%",
  right: "75% 50%",
  "top-left": "25% 20%",
  "top-right": "75% 20%",
}

export function isMediaPositionPreset(value: unknown): value is MediaPositionPreset {
  return typeof value === "string" && MEDIA_POSITION_PRESETS.includes(value as MediaPositionPreset)
}

export function mediaPositionValue(
  value: unknown,
  fallback: MediaPositionPreset = "center",
) {
  return MEDIA_POSITION_VALUES[isMediaPositionPreset(value) ? value : fallback]
}

export function responsiveMediaPositionStyle(
  desktop: unknown,
  mobile: unknown,
  defaults: { desktop?: MediaPositionPreset; mobile?: MediaPositionPreset } = {},
) {
  return {
    "--media-position-desktop": mediaPositionValue(desktop, defaults.desktop ?? "center"),
    "--media-position-mobile": mediaPositionValue(mobile, defaults.mobile ?? "center"),
  } as CSSProperties
}
