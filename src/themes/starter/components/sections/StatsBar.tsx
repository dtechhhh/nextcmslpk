import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  Check,
  Clock,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Plane,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

const ICON_REGISTRY: Record<string, LucideIcon> = {
  graduation_cap: GraduationCap,
  briefcase: Briefcase,
  plane: Plane,
  users: Users,
  building: Building,
  clock: Clock,
  star: Star,
  heart: Heart,
  check: Check,
  globe: Globe,
  award: Award,
  book: BookOpen,
}

interface StatsBarItem {
  iconKey: string
  value: string
  label: string
  isEnabled: boolean
}

interface StatsBarProps {
  items: StatsBarItem[]
  variant?: "light" | "dark"
}

function StatsBar({ items, variant = "light" }: StatsBarProps) {
  const enabledItems = items.filter((item) => item.isEnabled)
  const isDark = variant === "dark"
  const desktopGridClass =
    enabledItems.length <= 3
      ? "lg:grid-cols-3"
      : enabledItems.length === 4
        ? "lg:grid-cols-4"
        : enabledItems.length === 5
          ? "lg:grid-cols-5"
          : "lg:grid-cols-6"

  if (enabledItems.length === 0) {
    return null
  }

  return (
    <section
      className={cn(
        "py-16 md:py-20 lg:py-24",
        isDark
          ? "bg-primary-700 text-white"
          : "bg-neutral-50 text-neutral-900"
      )}
    >
      <Container>
        <div className={cn("grid grid-cols-2 gap-y-10", desktopGridClass)}>
          {enabledItems.map((item, index) => {
            const Icon = ICON_REGISTRY[item.iconKey] ?? HelpCircle

            return (
              <div
                key={`${item.iconKey}-${item.label}-${index}`}
                className={cn(
                  "flex flex-col items-center px-4 text-center",
                  index > 0 &&
                    "lg:border-l lg:border-dashed lg:border-neutral-200",
                  isDark && index > 0 && "lg:border-white/25"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mb-4 size-8",
                    isDark ? "text-white" : "text-[var(--color-primary)]"
                  )}
                />
                <p className="text-3xl font-bold leading-none md:text-4xl">
                  {item.value}
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    isDark ? "text-white/80" : "text-neutral-500"
                  )}
                >
                  {item.label}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export { StatsBar }
export type { StatsBarItem, StatsBarProps }
