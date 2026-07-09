import { CheckCircle2, Gift } from "lucide-react"

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
  benefitItems?: string[]
  microcopy?: string
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
  benefitItems,
  microcopy,
}: OfferBannerProps) {
  if (!isEnabled) {
    return null
  }

  const normalizedBenefitItems =
    benefitItems?.map((item) => item.trim()).filter((item) => item.length > 0) ?? []

  return (
    <section className="bg-white py-5 md:py-8 lg:py-10">
      <Container>
        <div className="overflow-hidden rounded-lg border border-secondary-500/30 border-t-4 border-t-secondary-500 bg-secondary-50/50 shadow-sm ring-1 ring-secondary-500/10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            {imageSrc ? (
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary-500/10 lg:order-2 lg:aspect-auto lg:min-h-[280px]">
                <CmsImage
                  src={imageSrc}
                  alt={headline}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 360px, 100vw"
                  className="object-cover"
                  fallbackLabel={headline}
                />
              </div>
            ) : null}
            <div className="p-5 md:p-7 lg:p-8">
              <div className="flex flex-wrap items-center gap-2">
                {badgeLabel ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary-500 px-3 py-1.5 text-xs font-bold uppercase tracking-normal text-white shadow-sm">
                    <Gift aria-hidden="true" className="size-4" />
                    {badgeLabel}
                  </span>
                ) : null}
                {urgencyLabel ? (
                  <span className="rounded-full border border-secondary-500/25 bg-white px-3 py-1.5 text-xs font-semibold text-secondary-700">
                    {urgencyLabel}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-tight text-neutral-950 md:text-3xl lg:text-4xl">
                {headline}
              </h2>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700 md:text-base md:leading-7">
                  {description}
                </p>
              ) : null}

              {normalizedBenefitItems.length > 0 ? (
                <ul className="mt-5 grid gap-2 sm:grid-cols-3 lg:max-w-2xl">
                  {normalizedBenefitItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-secondary-500/15 bg-white px-3 py-2 text-sm font-semibold text-neutral-800"
                    >
                      <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-secondary-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {ctaLabel && ctaHref ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    render={<a href={ctaHref} />}
                    size="lg"
                    variant="secondary"
                    className="w-full bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 sm:w-auto"
                  >
                    {ctaLabel}
                  </Button>
                  {microcopy ? (
                    <span className="text-xs font-semibold uppercase tracking-normal text-secondary-700">
                      {microcopy}
                    </span>
                  ) : null}
                </div>
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
