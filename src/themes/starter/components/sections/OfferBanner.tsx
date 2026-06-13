import { Button } from "@/themes/starter/components/ui/Button"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import { Container } from "@/themes/starter/components/ui/Container"

interface OfferBannerProps {
  isEnabled: boolean
  badgeLabel?: string
  headline: string
  description?: string
  imageSrc?: string
  ctaLabel?: string
  ctaHref?: string
  urgencyLabel?: string
}

function OfferBanner({
  isEnabled,
  badgeLabel,
  headline,
  description,
  imageSrc,
  ctaLabel,
  ctaHref,
  urgencyLabel,
}: OfferBannerProps) {
  if (!isEnabled) {
    return null
  }

  return (
    <section className="py-10 md:py-14 lg:py-16">
      <Container>
        <div className="overflow-hidden rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            {imageSrc ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-white/10 lg:order-2">
                <CmsImage
                  src={imageSrc}
                  alt={headline}
                  fill
                  sizes="(min-width: 1024px) 360px, 100vw"
                  className="object-cover"
                  fallbackLabel={headline}
                />
              </div>
            ) : null}
            <div>
              {badgeLabel ? (
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary-600">
                  {badgeLabel}
                </span>
              ) : null}
              <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
                {headline}
              </h2>
              {description ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">
                  {description}
                </p>
              ) : null}
              {urgencyLabel ? (
                <p className="mt-3 text-sm font-medium text-white/80">
                  {urgencyLabel}
                </p>
              ) : null}
              {ctaLabel && ctaHref ? (
                <Button
                  render={<a href={ctaHref} />}
                  size="lg"
                  className="mt-6 bg-white text-secondary-600 hover:bg-white/90"
                >
                  {ctaLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export { OfferBanner }
export type { OfferBannerProps }
