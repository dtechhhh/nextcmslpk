import Image from "next/image"
import { Card, CardContent } from "@/themes/starter/components/ui/Card"
import { Container } from "@/themes/starter/components/ui/Container"

interface RelatedItem {
  title: string
  excerpt?: string
  slug: string
  thumbnailSrc?: string
  publishedAt?: string
  detailPath: string
}

interface RelatedItemsProps {
  title?: string
  items: RelatedItem[]
}

function RelatedItems({ title = "Artikel Terkait", items }: RelatedItemsProps) {
  const visibleItems = items.slice(0, 3)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <h2 className="mb-8 text-2xl font-bold text-neutral-900 md:text-3xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <a key={item.slug} href={item.detailPath} className="group block h-full">
              <Card className="h-full py-0 transition-shadow hover:shadow-lg">
                {item.thumbnailSrc ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={item.thumbnailSrc}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <CardContent className="flex flex-1 flex-col p-5">
                  {item.publishedAt ? (
                    <time className="text-sm text-neutral-500">{item.publishedAt}</time>
                  ) : null}
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-neutral-900">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {item.excerpt}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}

export { RelatedItems }
export type { RelatedItem, RelatedItemsProps }
