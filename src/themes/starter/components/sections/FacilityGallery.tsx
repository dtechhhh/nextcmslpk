"use client"

import { X } from "lucide-react"
import { useMemo, useState } from "react"
import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import { Container } from "@/themes/starter/components/ui/Container"

interface FacilityGalleryItem {
  mediaSrc: string
  title?: string
  description?: string
  sortOrder: number
  isEnabled: boolean
}

interface FacilityGalleryProps {
  title?: string
  items: FacilityGalleryItem[]
}

function FacilityGallery({ title, items }: FacilityGalleryProps) {
  const galleryItems = useMemo(
    () =>
      items
        .filter((item) => item.isEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  )
  const [activeItem, setActiveItem] = useState<FacilityGalleryItem | null>(null)

  if (galleryItems.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-bold text-neutral-900 md:text-4xl">
            {title}
          </h2>
        ) : null}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {galleryItems.map((item) => (
            <button
              key={`${item.sortOrder}-${item.mediaSrc}`}
              type="button"
              className="group relative aspect-video overflow-hidden rounded-xl bg-neutral-100 text-left"
              onClick={() => setActiveItem(item)}
            >
              <CmsImage
                src={item.mediaSrc}
                alt={item.title || "Galeri fasilitas"}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                fallbackLabel={item.title || "Galeri fasilitas"}
              />
              {item.title || item.description ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  {item.title ? (
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/80">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </Container>

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setActiveItem(null)}
            aria-label="Tutup galeri"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <div className="w-full max-w-5xl">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <CmsImage
                src={activeItem.mediaSrc}
                alt={activeItem.title || "Galeri fasilitas"}
                fill
                sizes="100vw"
                className="object-contain"
                fallbackLabel={activeItem.title || "Galeri fasilitas"}
              />
            </div>
            {activeItem.title || activeItem.description ? (
              <div className="mt-4 text-center text-white">
                {activeItem.title ? (
                  <h3 className="text-xl font-semibold">{activeItem.title}</h3>
                ) : null}
                {activeItem.description ? (
                  <p className="mt-2 text-white/80">{activeItem.description}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export { FacilityGallery }
export type { FacilityGalleryItem, FacilityGalleryProps }
