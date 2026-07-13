"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ImageFeatureSlide = {
  mediaSrc: string;
  mediaAlt?: string;
};

type ImageFeatureSliderProps = {
  slides: ImageFeatureSlide[];
  title?: string;
  autoPlayMs?: number;
};

function ImageFeatureSlider({
  slides,
  title,
  autoPlayMs = 4500,
}: ImageFeatureSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoPlayMs, hasMultipleSlides, slides.length]);

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) {
      return;
    }

    const deltaX = clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 40) {
      return;
    }

    if (deltaX > 0) {
      goToPrevious();
    } else {
      goToNext();
    }
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          goToPrevious();
        }
        if (event.key === "ArrowRight") {
          goToNext();
        }
      }}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={title || "Galeri ringkasan jaringan"}
    >
      {slides.map((slide, index) => (
        <Image
          key={`${slide.mediaSrc}-${index}`}
          src={slide.mediaSrc}
          alt={slide.mediaAlt || ""}
          fill
          sizes="100vw"
          priority={index === 0}
          className={cn(
            "object-contain transition-opacity duration-500 ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            aria-label="Slide sebelumnya"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-neutral-950/50 text-white shadow-sm transition hover:bg-neutral-950/75 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Slide berikutnya"
            onClick={goToNext}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-neutral-950/50 text-white shadow-sm transition hover:bg-neutral-950/75 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-neutral-950/45 px-3 py-2">
            {slides.map((slide, index) => (
              <button
                key={`${slide.mediaSrc}-dot-${index}`}
                type="button"
                aria-label={`Tampilkan slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "size-2.5 rounded-full border border-white/70 transition-all",
                  index === activeIndex ? "w-7 bg-white" : "bg-white/35",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export { ImageFeatureSlider };
export type { ImageFeatureSlide, ImageFeatureSliderProps };
