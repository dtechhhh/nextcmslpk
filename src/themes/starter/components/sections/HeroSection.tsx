import Image from "next/image"
import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"

interface HeroCTA {
  label: string
  href: string
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
    <section className="relative flex min-h-[60vh] items-center overflow-hidden md:min-h-[80vh]">
      <div className="absolute inset-0 -z-20">
        {mediaType === "image" ? (
          <Image
            src={mediaSrc}
            alt={mediaAlt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            aria-label={mediaAlt || undefined}
          />
        )}
      </div>

      {overlay ? (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
      ) : null}

      <Container className="py-16 md:py-20 lg:py-24">
        <div className="max-w-3xl">
          {eyebrowLabel ? (
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary-300">
              {eyebrowLabel}
            </p>
          ) : null}

          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">
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
                  variant="outline"
                  className="w-full border-white/70 bg-white/10 text-white hover:bg-white hover:text-neutral-900 sm:w-auto"
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
