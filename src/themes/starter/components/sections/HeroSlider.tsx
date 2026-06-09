"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface HeroSliderCTA {
  label: string
  href: string
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
  autoPlayMs?: number
}

function HeroSlider({
  slides,
  headline,
  subheadline,
  eyebrowLabel,
  primaryCTA,
  secondaryCTA,
  autoPlayMs = 3200,
}: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const hasSlides = slides.length > 0

  useEffect(() => {
    if (isPaused || slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, autoPlayMs)

    return () => window.clearInterval(timer)
  }, [autoPlayMs, isPaused, slides.length])

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
          <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{headline}</h1>
          {subheadline ? <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{subheadline}</p> : null}
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
        </Container>
      </section>
    )
  }

  return (
    <section
      className="relative flex min-h-[60vh] items-center overflow-hidden bg-neutral-900 md:min-h-[80vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
          <Image
            key={`${slide.mediaSrc}-${index}`}
            src={slide.mediaSrc}
            alt={slide.mediaAlt || ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-500 ease-in-out",
              index === activeIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />

      <Container className="relative z-20 py-16 md:py-20 lg:py-24">
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

      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={`${slide.mediaSrc}-dot-${index}`}
              type="button"
              aria-label={`Tampilkan slide ${index + 1}`}
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
