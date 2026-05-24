import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface TimelineItem {
  yearLabel: string
  title: string
  description: string
  sortOrder: number
  isEnabled: boolean
}

interface TimelineProps {
  title?: string
  items: TimelineItem[]
}

function Timeline({ title, items }: TimelineProps) {
  const timelineItems = items
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (timelineItems.length === 0) {
    return null
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {title ? (
          <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900 md:text-4xl">
            {title}
          </h2>
        ) : null}
        <div className="relative mx-auto max-w-5xl">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 border-l-2 border-primary-200 lg:block"
          />
          <ol className="border-l-2 border-primary-200 pl-8 lg:border-l-0 lg:pl-0">
            {timelineItems.map((item, index) => {
              const isLeft = index % 2 === 0

              return (
                <li
                  key={`${item.sortOrder}-${item.title}`}
                  className="relative mb-10 last:mb-0 lg:grid lg:grid-cols-2 lg:gap-12"
                >
                  <span className="absolute -left-[2.45rem] top-2 size-3 rounded-full bg-primary-500 lg:left-1/2 lg:-translate-x-1/2" />
                  <div
                    className={cn(
                      "rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
                      isLeft
                        ? "lg:col-start-1 lg:text-right"
                        : "lg:col-start-2"
                    )}
                  >
                    <p className="font-bold text-primary-500">{item.yearLabel}</p>
                    <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </Container>
    </section>
  )
}

export { Timeline }
export type { TimelineItem, TimelineProps }
