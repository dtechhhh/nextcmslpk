import Image from "next/image"
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
import { Badge } from "@/themes/starter/components/ui/Badge"
import { Button } from "@/themes/starter/components/ui/Button"
import { Card, CardContent, CardFooter } from "@/themes/starter/components/ui/Card"
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

interface CardGridItem {
  id: string
  title: string
  description?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  badge?: string
  badgeVariant?: "default" | "promo" | "new"
  meta?: string
  iconKey?: string
  isEnabled?: boolean
}

interface CardGridProps {
  title?: string
  subtitle?: string
  items: CardGridItem[]
  columns?: 2 | 3
  ctaLabel?: string
  ctaHref?: string
  variant?: "indonesia" | "japan"
}

function CardGrid({
  title,
  subtitle,
  items,
  columns = 3,
  ctaLabel,
  ctaHref,
  variant = "indonesia",
}: CardGridProps) {
  const enabledItems = items.filter((item) => item.isEnabled !== false)

  if (enabledItems.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        {title || subtitle ? (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {title ? (
              <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2",
            columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
          )}
        >
          {enabledItems.map((item) => (
            <CardGridCard key={item.id} item={item} variant={variant} />
          ))}
        </div>

        {ctaLabel && ctaHref ? (
          <div className="mt-10 flex justify-center">
            <Button render={<a href={ctaHref} />} size="lg">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  )
}

function CardGridCard({
  item,
  variant,
}: {
  item: CardGridItem
  variant: "indonesia" | "japan"
}) {
  const Icon = item.iconKey ? ICON_REGISTRY[item.iconKey] ?? HelpCircle : null
  const badgeVariant = item.badgeVariant === "new" ? "new_badge" : item.badgeVariant

  const card = (
    <Card
      variant={variant}
      className={cn(
        "h-full gap-0 py-0 transition-shadow",
        item.href && variant === "indonesia" && "hover:shadow-lg"
      )}
    >
      {item.imageSrc ? (
        <div className="relative h-[200px] w-full overflow-hidden">
          <Image
            src={item.imageSrc}
            alt={item.imageAlt || item.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        </div>
      ) : Icon ? (
        <div className="px-4 pt-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-section-alt)] text-[var(--color-primary)]">
            <Icon aria-hidden="true" className="size-6" />
          </div>
        </div>
      ) : null}

      <CardContent className="flex flex-1 flex-col pt-5">
        {item.badge ? (
          <div className="mb-3">
            <Badge variant={badgeVariant || "default"}>{item.badge}</Badge>
          </div>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug text-neutral-900">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {item.description}
          </p>
        ) : null}
      </CardContent>

      {item.meta ? (
        <CardFooter className="mt-5 text-sm font-medium text-neutral-600">
          {item.meta}
        </CardFooter>
      ) : null}
    </Card>
  )

  if (item.href) {
    return (
      <a href={item.href} className="group/card block h-full rounded-xl">
        {card}
      </a>
    )
  }

  return card
}

export { CardGrid }
export type { CardGridItem, CardGridProps }
