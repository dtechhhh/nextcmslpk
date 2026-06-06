import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface CTABannerCTA {
  label: string
  href: string
}

interface CTABannerPrimaryCTA extends CTABannerCTA {
  variant: "whatsapp" | "line" | "default"
}

interface CTABannerProps {
  headline: string
  description?: string
  primaryCTA?: CTABannerPrimaryCTA
  secondaryCTA?: CTABannerCTA
  darkVariant?: boolean
}

function CTABanner({
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  darkVariant = false,
}: CTABannerProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-20 lg:py-24",
        darkVariant
          ? "bg-primary-700 text-white"
          : "bg-primary-50 text-neutral-900"
      )}
    >
      <Container>
        <div
          className={cn(
            "flex flex-col gap-8 rounded-2xl p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between",
            darkVariant
              ? "bg-white/10"
              : "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          )}
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">{headline}</h2>
            {description ? (
              <p
                className={cn(
                  "mt-3 text-base leading-7",
                  darkVariant ? "text-white/85" : "text-neutral-600"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {primaryCTA || secondaryCTA ? (
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              {primaryCTA ? (
                <Button
                  render={<a href={primaryCTA.href} />}
                  size="lg"
                  variant={primaryCTA.variant}
                  className="w-full sm:w-auto"
                >
                  {primaryCTA.label}
                </Button>
              ) : null}
              {secondaryCTA ? (
                <Button
                  render={<a href={secondaryCTA.href} />}
                  size="lg"
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto",
                    darkVariant &&
                      "border-white/70 bg-transparent text-white hover:bg-white hover:text-neutral-900"
                  )}
                >
                  {secondaryCTA.label}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

export { CTABanner }
export type { CTABannerCTA, CTABannerPrimaryCTA, CTABannerProps }
