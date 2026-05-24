"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/themes/starter/components/ui/Card"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface TestimonialCarouselItem {
  name: string
  roleOrProgram: string
  quote: string
  imageSrc?: string
  isEnabled: boolean
}

interface TestimonialCarouselProps {
  items: TestimonialCarouselItem[]
  title?: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function TestimonialCarousel({ items, title }: TestimonialCarouselProps) {
  const testimonials = useMemo(
    () => items.filter((item) => item.isEnabled),
    [items]
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) {
      return
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  const visibleCount = Math.min(3, testimonials.length)
  const visibleItems = Array.from({ length: visibleCount }, (_, offset) =>
    testimonials[(activeIndex + offset) % testimonials.length]
  )

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {title ? (
          <h2 className="mx-auto mb-10 max-w-3xl text-center text-3xl font-bold text-neutral-900 md:text-4xl">
            {title}
          </h2>
        ) : null}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {visibleItems.map((item, index) => (
            <Card
              key={`${item.name}-${index}`}
              className={cn(index > 0 && "hidden lg:flex")}
            >
              <CardContent className="relative flex flex-1 flex-col p-6">
                <span
                  aria-hidden="true"
                  className="absolute right-6 top-2 text-7xl font-bold leading-none text-primary-200"
                >
                  &ldquo;
                </span>
                <p className="relative text-base leading-7 text-neutral-700">
                  {item.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {getInitials(item.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.roleOrProgram}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {testimonials.length > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={`${item.name}-dot-${index}`}
                type="button"
                aria-label={`Tampilkan testimoni ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "size-3 rounded-full bg-neutral-300 transition-all",
                  index === activeIndex && "w-8 bg-primary-500"
                )}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  )
}

export { TestimonialCarousel }
export type { TestimonialCarouselItem, TestimonialCarouselProps }
