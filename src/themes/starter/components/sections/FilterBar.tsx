"use client"

import { X } from "lucide-react"
import { Button } from "@/themes/starter/components/ui/Button"
import { cn } from "@/lib/utils"

interface FilterBarOption {
  value: string
  label: string
}

interface FilterBarFilter {
  key: string
  label: string
  options: FilterBarOption[]
  isEnabled: boolean
}

interface FilterBarProps {
  filters: FilterBarFilter[]
  currentValues: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  variant?: "indonesia" | "japan"
}

function FilterBar({ filters, currentValues, onFilterChange, variant = "indonesia" }: FilterBarProps) {
  const enabledFilters = filters.filter((filter) => filter.isEnabled)
  const hasActiveFilters = Object.values(currentValues).some(Boolean)
  const allLabel = variant === "japan" ? "Semua" : "Semua"
  const clearLabel = variant === "japan" ? "Bersihkan" : "Clear all"

  function updateFilter(key: string, value: string) {
    if (onFilterChange) {
      onFilterChange(key, value)
      return
    }

    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    const query = params.toString()
    window.location.assign(query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }

  function clearAll() {
    if (onFilterChange) {
      Object.keys(currentValues).forEach((key) => onFilterChange(key, ""))
      return
    }

    const params = new URLSearchParams(window.location.search)
    enabledFilters.forEach((filter) => params.delete(filter.key))
    params.delete("page")
    const query = params.toString()
    window.location.assign(query ? `${window.location.pathname}?${query}` : window.location.pathname)
  }

  if (enabledFilters.length === 0) {
    return null
  }

  return (
    <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
        {enabledFilters.map((filter) => (
          <label key={filter.key} className="min-w-48 shrink-0 lg:min-w-56">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {filter.label}
            </span>
            <select
              value={currentValues[filter.key] || ""}
              onChange={(event) => updateFilter(filter.key, event.target.value)}
              className={cn(
                "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
                currentValues[filter.key] && "bg-primary-500 text-white"
              )}
            >
              <option value="">{allLabel}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className="mt-6 shrink-0"
          >
            <X aria-hidden="true" className="size-4" />
            {clearLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export { FilterBar }
export type { FilterBarFilter, FilterBarOption, FilterBarProps }
