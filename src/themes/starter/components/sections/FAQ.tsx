"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Container } from "@/themes/starter/components/ui/Container"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
  sortOrder: number
  isEnabled: boolean
}

interface FAQProps {
  title?: string
  subtitle?: string
  items: FAQItem[]
}

function FAQ({ title, subtitle, items }: FAQProps) {
  const faqItems = useMemo(
    () =>
      items
        .filter((item) => item.isEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  )
  const [openIndex, setOpenIndex] = useState(0)

  if (faqItems.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          {title || subtitle ? (
            <div className="mb-10 text-center">
              {title ? (
                <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="divide-y divide-neutral-200">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index

              return (
                <div key={`${item.sortOrder}-${item.question}`}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="font-semibold text-neutral-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0 text-neutral-500 transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pt-2 leading-7 text-neutral-600">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

export { FAQ }
export type { FAQItem, FAQProps }
