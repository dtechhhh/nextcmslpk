import { Folder, Inbox, Search } from "lucide-react"
import { Button } from "@/themes/starter/components/ui/Button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  ctaVariant?: "whatsapp" | "line" | "default"
  icon?: "search" | "inbox" | "folder"
}

const icons = {
  search: Search,
  inbox: Inbox,
  folder: Folder,
}

function EmptyState({
  title = "Tidak Ada Data",
  description,
  ctaLabel,
  ctaHref,
  ctaVariant = "default",
  icon = "inbox",
}: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon aria-hidden="true" className="size-16 text-neutral-300" />
      <h3 className="mt-6 text-xl font-semibold text-neutral-900">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-neutral-500">{description}</p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <Button
          render={<a href={ctaHref} />}
          variant={ctaVariant}
          className={cn("mt-6")}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
