"use client"

import { useEffect, useState } from "react"
import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import {
  responsiveMediaPositionStyle,
  type MediaPositionPreset,
} from "@/lib/media-position"

interface HeroSliderCTA {
  label: string
  href: string
  variant?: "line" | "whatsapp" | "default" | "outline"
}

interface HeroSliderPrimaryCTA extends HeroSliderCTA {
  variant: "line" | "whatsapp" | "default"
}

interface HeroSliderSlide {
  mediaSrc: string
  mediaAlt?: string
}

interface HeroSliderProps {
  slides: HeroSliderSlide[]
  headline: string
  subheadline?: string
  eyebrowLabel?: string
  primaryCTA?: HeroSliderPrimaryCTA
  secondaryCTA?: HeroSliderCTA
  mediaPosition?: MediaPositionPreset
  mobileMediaType?: "image" | "video"
  mobileMediaSrc?: string
  mobileMediaAlt?: string
  mobileMediaPosition?: MediaPositionPreset
  autoPlayMs?: number
  locale?: "ja" | "id"
}

function HeroSlider({
  slides,
  headline,
  subheadline,
  eyebrowLabel,
  primaryCTA,
  secondaryCTA,
  mediaPosition = "center",
  mobileMediaType = "image",
  mobileMediaSrc,
  mobileMediaAlt,
  mobileMediaPosition = "center",
  autoPlayMs = 5000,
  locale = "ja",
}: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasSlides = slides.length > 0
  const mediaPositionStyle = responsiveMediaPositionStyle(
    mediaPosition,
    mobileMediaPosition,
  )

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, autoPlayMs)

    return () => window.clearInterval(timer)
  }, [autoPlayMs, slides.length])

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  if (!hasSlides) {
    return (
      <section className="bg-neutral-900 py-20 text-white md:py-24">
        <Container>
          {eyebrowLabel ? (
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/70">
              {eyebrowLabel}
            </p>
          ) : null}
          <h1 className="max-w-4xl text-3xl font-bold leading-[1.35] sm:text-4xl md:text-5xl">{headline}</h1>
          {subheadline ? <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 md:text-lg md:leading-8">{subheadline}</p> : null}
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
        </Container>
      </section>
    )
  }

  return (
    <section
      className="relative flex min-h-[460px] items-center overflow-hidden bg-neutral-900 sm:min-h-[540px] md:min-h-[620px] lg:min-h-[650px]"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          goToPrevious()
        }
        if (event.key === "ArrowRight") {
          goToNext()
        }
      }}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={headline}
    >
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <CmsImage
            key={`${slide.mediaSrc}-${index}`}
            src={slide.mediaSrc}
            alt={slide.mediaAlt || ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover [object-position:var(--media-position-mobile)] transition-opacity duration-500 ease-in-out md:[object-position:var(--media-position-desktop)]",
              mobileMediaSrc ? "hidden md:block" : "",
              index === activeIndex ? "opacity-100" : "opacity-0"
            )}
            style={mediaPositionStyle}
            fallbackLabel={slide.mediaAlt || headline}
          />
        ))}
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
              aria-label={mobileMediaAlt || headline}
            />
          ) : (
            <CmsImage
              src={mobileMediaSrc}
              alt={mobileMediaAlt || headline}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[var(--media-position-mobile)] md:hidden"
              style={mediaPositionStyle}
              fallbackLabel={mobileMediaAlt || headline}
            />
          )
        ) : null}
      </div>
      <div className="absolute inset-0 z-10 bg-neutral-950/60 md:bg-gradient-to-r md:from-neutral-950/85 md:via-neutral-950/60 md:to-neutral-950/25" />

      <Container className="relative z-20 py-12 sm:py-14 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          {eyebrowLabel ? (
            <p className="mb-3 text-xs font-semibold tracking-normal text-primary-200 md:text-sm">
              {eyebrowLabel}
            </p>
          ) : null}
          <h1 className="text-balance text-3xl font-bold leading-[1.35] text-white sm:text-4xl md:text-5xl">
            {headline}
          </h1>
          {subheadline ? (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 md:text-lg md:leading-8">
              {subheadline}
            </p>
          ) : null}
          {primaryCTA || secondaryCTA ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

      {slides.length > 1 ? (
        <div className={cn(
          "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6",
          mobileMediaSrc ? "hidden md:flex" : "",
        )}>
          {slides.map((slide, index) => (
            <button
              key={`${slide.mediaSrc}-dot-${index}`}
              type="button"
              aria-label={
                locale === "ja"
                  ? `スライド${index + 1}を表示`
                  : `Tampilkan slide ${index + 1}`
              }
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "size-3 rounded-full border border-white/70 transition-all",
                index === activeIndex ? "w-8 bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export { HeroSlider }
export type { HeroSliderCTA, HeroSliderPrimaryCTA, HeroSliderProps, HeroSliderSlide }
