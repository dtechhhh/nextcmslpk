export const neutral = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
} as const

export const indonesia = {
  primary: {
    50: "#eef7fc",
    100: "#d4ecf9",
    200: "#a9d9f3",
    300: "#72c2eb",
    400: "#4fb5e5",
    500: "#2e9fd6",
    600: "#2184b8",
    700: "#186a96",
  },
  secondary: {
    400: "#ef5350",
    500: "#e53935",
    600: "#c62828",
  },
  whatsapp: "#25D366",
} as const

export const japan = {
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#1e3a5f",
    600: "#162d4a",
    700: "#0f2035",
  },
  accent: "#e53935",
  line: "#06C755",
} as const

export const status = {
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const

export const typography = {
  scale: {
    xs: { fontSize: "0.75rem", lineHeight: "1rem" },
    sm: { fontSize: "0.875rem", lineHeight: "1.25rem" },
    base: { fontSize: "1rem", lineHeight: "1.5rem" },
    lg: { fontSize: "1.125rem", lineHeight: "1.75rem" },
    xl: { fontSize: "1.25rem", lineHeight: "1.75rem" },
    "2xl": { fontSize: "1.5rem", lineHeight: "2rem" },
    "3xl": { fontSize: "1.875rem", lineHeight: "2.25rem" },
    "4xl": { fontSize: "2.25rem", lineHeight: "2.5rem" },
    "5xl": { fontSize: "3rem", lineHeight: "1.15" },
  },
  weight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  fontFamily: {
    sans: "Inter, ui-sans-serif, system-ui, sans-serif",
    japanese: "Noto Sans JP, ui-sans-serif, system-ui, sans-serif",
  },
} as const

export const spacing = {
  section: {
    base: "py-16",
    md: "md:py-20",
    lg: "lg:py-24",
  },
  container: {
    maxWidth: "80rem",
    padding: {
      base: "px-4",
      sm: "sm:px-6",
      lg: "lg:px-8",
    },
  },
} as const

export const radius = {
  card: "0.75rem",
  button: "0.5rem",
  input: "0.375rem",
  badge: "9999px",
} as const

export const shadow = {
  card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  lg: "0 10px 25px rgba(0,0,0,0.1)",
} as const

export type NeutralScale = typeof neutral
export type IndonesiaPalette = typeof indonesia
export type JapanPalette = typeof japan
export type StatusColors = typeof status
export type TypographyTokens = typeof typography
export type SpacingTokens = typeof spacing
export type RadiusTokens = typeof radius
export type ShadowTokens = typeof shadow
