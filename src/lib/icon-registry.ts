import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const FALLBACK_ICON = LucideIcons.CircleHelpIcon as LucideIcon;

function icon(name: string) {
  return (
    (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[name] ??
    FALLBACK_ICON
  );
}

export const ICON_REGISTRY = {
  graduation_cap: icon("GraduationCapIcon"),
  briefcase: icon("BriefcaseIcon"),
  plane: icon("PlaneIcon"),
  users: icon("UsersIcon"),
  building: icon("BuildingIcon"),
  building_2: icon("Building2Icon"),
  book_open: icon("BookOpenIcon"),
  globe: icon("GlobeIcon"),
  map_pin: icon("MapPinIcon"),
  phone: icon("PhoneIcon"),
  mail: icon("MailIcon"),
  clock: icon("ClockIcon"),
  message_circle: icon("MessageCircleIcon"),
  file_text: icon("FileTextIcon"),
  download: icon("DownloadIcon"),
  shield_check: icon("ShieldCheckIcon"),
  award: icon("AwardIcon"),
  handshake: icon("HandshakeIcon"),
  factory: icon("FactoryIcon"),
  hard_hat: icon("HardHatIcon"),
  sprout: icon("SproutIcon"),
  heart_pulse: icon("HeartPulseIcon"),
  utensils: icon("UtensilsIcon"),
  hotel: icon("HotelIcon"),
  wrench: icon("WrenchIcon"),
  languages: icon("LanguagesIcon"),
  user_check: icon("UserCheckIcon"),
  network: icon("NetworkIcon"),
  newspaper: icon("NewspaperIcon"),
  calendar_days: icon("CalendarDaysIcon"),
  star: icon("StarIcon"),
  circle_check: icon("CircleCheckIcon"),
  check: icon("CheckIcon"),
  heart: icon("HeartIcon"),
  book: icon("BookOpenIcon"),
  home: icon("HomeIcon"),
  map: icon("MapIcon"),
  target: icon("TargetIcon"),
  rocket: icon("RocketIcon"),
  landmark: icon("LandmarkIcon"),
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICON_REGISTRY;

export const ICON_OPTIONS = Object.keys(ICON_REGISTRY).map((key) => ({
  key,
  label: key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" "),
}));

export function getIconComponent(iconKey: string | null | undefined) {
  if (!iconKey) {
    return FALLBACK_ICON;
  }

  return ICON_REGISTRY[iconKey as IconKey] ?? FALLBACK_ICON;
}
