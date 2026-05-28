"use client"

import Image from "next/image"
import { Badge } from "@/themes/starter/components/ui/Badge"
import { Button } from "@/themes/starter/components/ui/Button"
import { Card, CardContent, CardFooter } from "@/themes/starter/components/ui/Card"
import { Container } from "@/themes/starter/components/ui/Container"
import { EmptyState } from "@/themes/starter/components/sections/EmptyState"
import { ExpiredBadge } from "@/themes/starter/components/sections/ExpiredBadge"
import { FilterBar, type FilterBarFilter } from "@/themes/starter/components/sections/FilterBar"
import { cn } from "@/lib/utils"

interface CollectionListItem {
  id: string
  title: string
  subtitle?: string
  slug: string
  thumbnailSrc?: string
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "FILLED"
  meta?: string
  expiredAt?: string
  isExpired?: boolean
  isFeatured?: boolean
  badge?: string
  labels?: string[]
}

interface CollectionListProps {
  items: CollectionListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  currentFilters?: Record<string, string>
  filters?: FilterBarFilter[]
  title?: string
  emptyMessage?: string
  detailPathPrefix: string
  ctaLabel?: string
  ctaHref?: string
  onPageChange?: (page: number) => void
}

function buildPageHref(page: number, currentFilters?: Record<string, string>) {
  const params = new URLSearchParams()
  Object.entries(currentFilters || {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })
  params.set("page", String(page))
  return `?${params.toString()}`
}

function CollectionList({
  items,
  total,
  page,
  pageSize,
  totalPages,
  currentFilters = {},
  filters,
  title,
  emptyMessage,
  detailPathPrefix,
  ctaLabel,
  ctaHref,
  onPageChange,
}: CollectionListProps) {
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const startItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, total)

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {title ? (
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              {title}
            </h2>
            {ctaLabel && ctaHref ? (
              <Button render={<a href={ctaHref} />} variant="outline">
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        ) : null}

        {filters && filters.length > 0 ? (
          <FilterBar filters={filters} currentValues={currentFilters} />
        ) : null}

        {items.length === 0 ? (
          <EmptyState
            description={emptyMessage}
            icon="search"
            title="Tidak Ada Data"
          />
        ) : (
          <>
            <div className="mb-6 text-sm text-neutral-500">
              Menampilkan {startItem}-{endItem} dari {total} data
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {items.map((item) => {
                const href = `${detailPathPrefix}/${item.slug}`
                const isExpired = item.isExpired || item.status === "CLOSED"

                return (
                  <Card key={item.id} className="h-full py-0">
                    {item.thumbnailSrc ? (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={item.thumbnailSrc}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {item.isFeatured ? <Badge>Unggulan</Badge> : null}
                        {item.badge ? (
                          <Badge variant="outline">{item.badge}</Badge>
                        ) : null}
                        {item.labels
                          ?.filter((label) => label.trim() !== "")
                          .map((label) => (
                            <Badge key={label} variant="outline">
                              {label}
                            </Badge>
                          ))}
                      </div>
                      <h3 className="text-lg font-semibold leading-snug text-neutral-900">
                        {item.title}
                      </h3>
                      {isExpired ? <ExpiredBadge type="job" /> : null}
                      {item.subtitle ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item.meta || item.expiredAt ? (
                        <p className="mt-4 text-sm text-neutral-500">
                          {[item.meta, item.expiredAt].filter(Boolean).join(" - ")}
                        </p>
                      ) : null}
                    </CardContent>
                    <CardFooter className="p-5">
                      {isExpired ? (
                        <Button
                          disabled
                          className="pointer-events-none w-full cursor-not-allowed opacity-50"
                        >
                          Detail tidak tersedia
                        </Button>
                      ) : (
                        <Button render={<a href={href} />} className="w-full">
                          Lihat Detail
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                <a
                  href={buildPageHref(Math.max(1, safePage - 1), currentFilters)}
                  onClick={(event) => {
                    if (onPageChange) {
                      event.preventDefault()
                      onPageChange(Math.max(1, safePage - 1))
                    }
                  }}
                  className={cn(
                    "rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700",
                    safePage === 1 && "pointer-events-none opacity-50"
                  )}
                >
                  Previous
                </a>
                {pages.map((pageNumber) => (
                  <a
                    key={pageNumber}
                    href={buildPageHref(pageNumber, currentFilters)}
                    onClick={(event) => {
                      if (onPageChange) {
                        event.preventDefault()
                        onPageChange(pageNumber)
                      }
                    }}
                    aria-current={pageNumber === safePage ? "page" : undefined}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700",
                      pageNumber === safePage && "bg-primary-500 text-white"
                    )}
                  >
                    {pageNumber}
                  </a>
                ))}
                <a
                  href={buildPageHref(
                    Math.min(totalPages, safePage + 1),
                    currentFilters
                  )}
                  onClick={(event) => {
                    if (onPageChange) {
                      event.preventDefault()
                      onPageChange(Math.min(totalPages, safePage + 1))
                    }
                  }}
                  className={cn(
                    "rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700",
                    safePage === totalPages && "pointer-events-none opacity-50"
                  )}
                >
                  Next
                </a>
              </nav>
            ) : null}
          </>
        )}
      </Container>
    </section>
  )
}

export { CollectionList }
export type { CollectionListItem, CollectionListProps }
