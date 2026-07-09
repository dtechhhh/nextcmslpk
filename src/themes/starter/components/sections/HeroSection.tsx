import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import {
  responsiveMediaPositionStyle,
  type MediaPositionPreset,
} from "@/lib/media-position"

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
  mediaPosition?: MediaPositionPreset
  mobileMediaType?: "image" | "video"
  mobileMediaSrc?: string
  mobileMediaAlt?: string
  mobileMediaPosition?: MediaPositionPreset
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
  mediaPosition = "center",
  mobileMediaType,
  mobileMediaSrc,
  mobileMediaAlt,
  mobileMediaPosition = "center",
  headline,
  subheadline,
  eyebrowLabel,
  overlay = true,
  primaryCTA,
  secondaryCTA,
  priority = false,
}: HeroSectionProps) {
  const mediaPositionStyle = responsiveMediaPositionStyle(
    mediaPosition,
    mobileMediaPosition,
  )
  const hasMobileMedia = Boolean(mobileMediaSrc)

  return (
    <section className="relative flex min-h-[400px] items-center overflow-hidden bg-neutral-900 sm:min-h-[500px] md:min-h-[600px] lg:min-h-[640px]">
      <div className="absolute inset-0 z-0">
        {mediaType === "image" ? (
          <CmsImage
            src={mediaSrc}
            alt={mediaAlt}
            fill
            priority={priority}
            sizes="100vw"
            className={`${hasMobileMedia ? "hidden md:block" : ""} object-cover [object-position:var(--media-position-mobile)] md:[object-position:var(--media-position-desktop)]`}
            style={mediaPositionStyle}
            fallbackLabel={headline}
          />
        ) : (
          <video
            className={`${hasMobileMedia ? "hidden md:block" : ""} h-full w-full object-cover [object-position:var(--media-position-mobile)] md:[object-position:var(--media-position-desktop)]`}
            style={mediaPositionStyle}
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={mediaAlt || undefined}
          />
        )}
        {mobileMediaSrc ? (
          mobileMediaType === "video" ? (
            <video
              className="h-full w-full object-cover object-[var(--media-position-mobile)] md:hidden"
              style={mediaPositionStyle}
              src={mobileMediaSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={mobileMediaAlt || mediaAlt || undefined}
            />
          ) : (
            <CmsImage
              src={mobileMediaSrc}
              alt={mobileMediaAlt || mediaAlt}
              fill
              priority={priority}
              sizes="100vw"
              className="object-cover object-[var(--media-position-mobile)] md:hidden"
              style={mediaPositionStyle}
              fallbackLabel={headline}
            />
          )
        ) : null}
      </div>

      {overlay ? (
        <div className="absolute inset-0 z-10 bg-neutral-950/60 md:bg-gradient-to-r md:from-neutral-950/85 md:via-neutral-950/60 md:to-neutral-950/25" />
      ) : null}

      <Container className="relative z-20 py-10 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrowLabel ? (
            <p className="mb-3 text-sm font-semibold tracking-normal text-primary-200">
              {eyebrowLabel}
            </p>
          ) : null}

          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {headline}
          </h1>

          {subheadline ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:mt-5 md:text-lg md:leading-8">
              {subheadline}
            </p>
          ) : null}

          {primaryCTA || secondaryCTA ? (
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
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
