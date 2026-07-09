import { FALLBACK_ICON, ICON_REGISTRY, type IconKey } from "@/lib/icon-registry"
import { Badge } from "@/themes/starter/components/ui/Badge"
import { Button } from "@/themes/starter/components/ui/Button"
import { Card, CardContent, CardFooter } from "@/themes/starter/components/ui/Card"
import { Container } from "@/themes/starter/components/ui/Container"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import { cn } from "@/lib/utils"

interface CardGridItem {
  id: string
  title: string
  description?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  badge?: string
  badgeVariant?: "default" | "promo" | "new"
  labels?: string[]
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
    <section
      className={cn(
        "bg-white",
        variant === "japan" ? "py-10 md:py-16 lg:py-20" : "py-10 md:py-14 lg:py-16",
      )}
    >
      <Container>
        {title || subtitle ? (
          <div className={cn("mx-auto max-w-3xl text-center", variant === "japan" ? "mb-8" : "mb-7")}>
            {title ? (
              <h2 className={cn("font-bold text-neutral-900", variant === "japan" ? "text-2xl md:text-4xl" : "text-2xl md:text-4xl")}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-3 text-sm leading-6 text-neutral-600 md:mt-4 md:text-lg md:leading-7">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6",
            columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
          )}
        >
          {enabledItems.map((item) => (
            <CardGridCard key={item.id} item={item} variant={variant} />
          ))}
        </div>

        {ctaLabel && ctaHref ? (
        <div className="mt-8 flex justify-center md:mt-10">
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
  const Icon = item.iconKey ? ICON_REGISTRY[item.iconKey as IconKey] ?? FALLBACK_ICON : null
  const badgeVariant = item.badgeVariant === "new" ? "new_badge" : item.badgeVariant

  const card = (
    <Card
      variant={variant}
      className={cn(
        "h-full gap-0 border border-neutral-200 py-0 shadow-sm transition-shadow",
        item.href && variant === "indonesia" && "hover:shadow-lg"
      )}
    >
      {item.imageSrc ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <CmsImage
            src={item.imageSrc}
            alt={item.imageAlt || item.title}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-[1.02]"
            fallbackLabel={item.title}
          />
        </div>
      ) : Icon ? (
        <div className="px-4 pt-4 md:pt-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-section-alt)] text-[var(--color-primary)] md:size-12 md:rounded-xl">
            <Icon aria-hidden="true" className="size-5 md:size-6" />
          </div>
        </div>
      ) : null}

      <CardContent className="flex flex-1 flex-col pt-4 md:pt-5">
        {(item.badge || (item.labels && item.labels.length > 0)) ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {item.badge ? (
              <Badge variant={badgeVariant || "default"}>{item.badge}</Badge>
            ) : null}
            {item.labels
              ?.filter((label) => label.trim() !== "")
              .map((label) => (
                <Badge key={label} variant="outline">
                  {label}
                </Badge>
              ))}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug text-neutral-900">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-2 text-sm leading-6 text-neutral-600 md:mt-3">
            {item.description}
          </p>
        ) : null}
      </CardContent>

      {item.meta ? (
        <CardFooter className="mt-3 text-sm font-semibold text-primary-600 md:mt-5">
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
