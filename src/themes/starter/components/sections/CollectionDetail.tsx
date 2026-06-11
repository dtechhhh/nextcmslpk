import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { Container } from "@/themes/starter/components/ui/Container"

interface CollectionDetailBreadcrumbItem {
  label: string
  href?: string
}

interface CollectionDetailProps {
  mainContent: ReactNode
  sidebar?: ReactNode
  breadcrumb?: CollectionDetailBreadcrumbItem[]
}

function CollectionDetail({
  mainContent,
  sidebar,
  breadcrumb,
}: CollectionDetailProps) {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1

                return (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {item.href && !isLast ? (
                      <a href={item.href} className="hover:text-primary-500">
                        {item.label}
                      </a>
                    ) : (
                      <span className={isLast ? "text-neutral-900" : undefined}>
                        {item.label}
                      </span>
                    )}
                    {!isLast ? (
                      <ChevronRight aria-hidden="true" className="size-4" />
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </nav>
        ) : null}

        <div className={sidebar ? "grid gap-10 lg:grid-cols-3" : "mx-auto max-w-4xl"}>
          <main className={sidebar ? "min-w-0 lg:col-span-2" : "min-w-0"}>{mainContent}</main>
          {sidebar ? (
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">{sidebar}</div>
            </aside>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

export { CollectionDetail }
export type { CollectionDetailBreadcrumbItem, CollectionDetailProps }
