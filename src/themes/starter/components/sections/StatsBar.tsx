import { FALLBACK_ICON, ICON_REGISTRY, type IconKey } from "@/lib/icon-registry"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface StatsBarItem {
  iconKey: string
  value: string
  label: string
  isEnabled: boolean
}

interface StatsBarProps {
  items: StatsBarItem[]
  variant?: "light" | "dark"
  compact?: boolean
}

function StatsBar({ items, variant = "light", compact = false }: StatsBarProps) {
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
        compact ? "py-6 md:py-10 lg:py-12" : "py-8 md:py-12 lg:py-14",
        isDark
          ? "bg-primary-700 text-white"
          : "bg-neutral-50 text-neutral-900"
      )}
    >
      <Container>
        <div
          className={cn(
            "grid grid-cols-2",
            compact ? "gap-y-6" : "gap-y-7 md:gap-y-10",
            desktopGridClass,
          )}
        >
          {enabledItems.map((item, index) => {
            const Icon = ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON

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
                    compact ? "mb-2 size-6 md:mb-3 md:size-7" : "mb-3 size-6 md:mb-4 md:size-8",
                    isDark ? "text-white" : "text-[var(--color-primary)]"
                  )}
                />
                <p
                  className={cn(
                    "font-bold leading-none",
                    compact ? "text-2xl md:text-3xl" : "text-2xl md:text-4xl",
                  )}
                >
                  {item.value}
                </p>
                <p
                  className={cn(
                    "mt-2 text-xs leading-5 md:text-sm",
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
