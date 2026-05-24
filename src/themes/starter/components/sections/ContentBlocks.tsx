import Image from "next/image"
import { Button } from "@/themes/starter/components/ui/Button"
import { Card, CardContent } from "@/themes/starter/components/ui/Card"

type ContentBlockType =
  | "heading"
  | "paragraph"
  | "quote"
  | "image"
  | "youtube_embed"
  | "offer_callout"
  | "whatsapp_cta"
  | "line_cta"
  | "sector_callout"

interface ContentBlock {
  type: ContentBlockType
  sortOrder: number
  data: Record<string, unknown>
}

interface ContentBlocksProps {
  blocks: ContentBlock[]
  variant: "indonesia" | "japan"
}

function stringValue(data: Record<string, unknown>, key: string) {
  const value = data[key]
  return typeof value === "string" ? value : undefined
}

function ContentBlocks({ blocks, variant }: ContentBlocksProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-0">
      {sortedBlocks.map((block, index) => {
        const key = `${block.type}-${block.sortOrder}-${index}`

        if (block.type === "heading") {
          const text = stringValue(block.data, "text") || stringValue(block.data, "title")
          const level = stringValue(block.data, "level")

          if (!text) {
            return null
          }

          return level === "h3" ? (
            <h3 key={key} className="mb-4 mt-8 text-2xl font-bold text-neutral-900">
              {text}
            </h3>
          ) : (
            <h2 key={key} className="mb-4 mt-8 text-3xl font-bold text-neutral-900">
              {text}
            </h2>
          )
        }

        if (block.type === "paragraph") {
          const text = stringValue(block.data, "text")
          return text ? (
            <p key={key} className="mb-4 text-base leading-relaxed text-neutral-700">
              {text}
            </p>
          ) : null
        }

        if (block.type === "quote") {
          const quote = stringValue(block.data, "quote")
          const author = stringValue(block.data, "author")
          return quote ? (
            <blockquote
              key={key}
              className="my-8 border-l-4 border-primary-500 pl-6 italic text-neutral-600"
            >
              <p>{quote}</p>
              {author ? (
                <footer className="mt-3 text-sm not-italic text-neutral-500">
                  {author}
                </footer>
              ) : null}
            </blockquote>
          ) : null
        }

        if (block.type === "image") {
          const src = stringValue(block.data, "src") || stringValue(block.data, "imageSrc")
          const alt = stringValue(block.data, "alt") || stringValue(block.data, "title") || ""
          const caption = stringValue(block.data, "caption")

          return src ? (
            <figure key={key} className="my-8">
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              {caption ? (
                <figcaption className="mt-2 text-sm italic text-neutral-500">
                  {caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null
        }

        if (block.type === "youtube_embed") {
          const src = stringValue(block.data, "src") || stringValue(block.data, "embedUrl")

          return src ? (
            <div key={key} className="my-8 aspect-video overflow-hidden rounded-xl">
              <iframe
                src={src}
                title={stringValue(block.data, "title") || "Video YouTube"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
              />
            </div>
          ) : null
        }

        if (
          (block.type === "offer_callout" && variant !== "indonesia") ||
          (block.type === "sector_callout" && variant !== "japan")
        ) {
          return null
        }

        if (block.type === "offer_callout" || block.type === "sector_callout") {
          const title = stringValue(block.data, "title")
          const description = stringValue(block.data, "description")
          const ctaLabel = stringValue(block.data, "ctaLabel")
          const ctaHref = stringValue(block.data, "ctaHref") || stringValue(block.data, "href")

          return title || description ? (
            <Card key={key} className="my-8 border border-primary-200 bg-primary-50">
              <CardContent className="p-6">
                {title ? (
                  <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
                ) : null}
                {description ? (
                  <p className="mt-3 leading-7 text-neutral-700">{description}</p>
                ) : null}
                {ctaLabel && ctaHref ? (
                  <Button render={<a href={ctaHref} />} className="mt-5">
                    {ctaLabel}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null
        }

        if (block.type === "whatsapp_cta") {
          if (variant !== "indonesia") {
            return null
          }
          const label = stringValue(block.data, "label") || "Hubungi via WhatsApp"
          const href = stringValue(block.data, "href")

          return href ? (
            <Button
              key={key}
              render={<a href={href} />}
              variant="whatsapp"
              size="lg"
              className="my-6 w-full"
            >
              {label}
            </Button>
          ) : null
        }

        if (block.type === "line_cta") {
          if (variant !== "japan") {
            return null
          }
          const label = stringValue(block.data, "label") || "Hubungi via LINE"
          const href = stringValue(block.data, "href")

          return href ? (
            <Button
              key={key}
              render={<a href={href} />}
              variant="line"
              size="lg"
              className="my-6 w-full"
            >
              {label}
            </Button>
          ) : null
        }

        return null
      })}
    </div>
  )
}

export { ContentBlocks }
export type { ContentBlock, ContentBlockType, ContentBlocksProps }
