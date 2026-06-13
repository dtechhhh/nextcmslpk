import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"

interface HeroCTA {
  label: string
  href: string
  variant?: "whatsapp" | "line" | "default" | "outline"
}

interface HeroPrimaryCTA extends HeroCTA {
  variant: "whatsapp" | "line" | "default"
}

interface HeroSectionProps {
  mediaType: "image" | "video"
  mediaSrc: string
  mediaAlt?: string
  headline: string
  subheadline?: string
  eyebrowLabel?: string
  overlay?: boolean
  primaryCTA?: HeroPrimaryCTA
  secondaryCTA?: HeroCTA
  priority?: boolean
}

function HeroSection({
  mediaType,
  mediaSrc,
  mediaAlt = "",
  headline,
  subheadline,
  eyebrowLabel,
  overlay = true,
  primaryCTA,
  secondaryCTA,
  priority = false,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[460px] items-center overflow-hidden bg-neutral-900 sm:min-h-[540px] md:min-h-[620px] lg:min-h-[650px]">
      <div className="absolute inset-0 z-0">
        {mediaType === "image" ? (
          <CmsImage
            src={mediaSrc}
            alt={mediaAlt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
            fallbackLabel={headline}
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={mediaAlt || undefined}
          />
        )}
      </div>

      {overlay ? (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-neutral-950/85 via-neutral-950/60 to-neutral-950/25" />
      ) : null}

      <Container className="relative z-20 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrowLabel ? (
            <p className="mb-3 text-sm font-semibold tracking-normal text-primary-200">
              {eyebrowLabel}
            </p>
          ) : null}

          <h1 className="text-3xl font-bold leading-[1.35] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 md:text-lg md:leading-8">
              {subheadline}
            </p>
          ) : null}

          {primaryCTA || secondaryCTA ? (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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
                  variant={secondaryCTA.variant ?? "outline"}
                  className={
                    secondaryCTA.variant && secondaryCTA.variant !== "outline"
                      ? "w-full sm:w-auto"
                      : "w-full border-white/70 bg-white/10 text-white hover:bg-white hover:text-neutral-900 sm:w-auto"
                  }
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

export { HeroSection }
export type { HeroSectionProps, HeroCTA, HeroPrimaryCTA }
