import { AlertTriangle } from "lucide-react"
import { Button } from "@/themes/starter/components/ui/Button"

interface ExpiredBadgeProps {
  type: "job" | "offer" | "karir"
  ctaLabel?: string
}

const expiredText: Record<ExpiredBadgeProps["type"], string> = {
  job: "Lowongan Sudah Ditutup",
  offer: "Penawaran Sudah Berakhir",
  karir: "Posisi Sudah Ditutup",
}

function ExpiredBadge({ type, ctaLabel }: ExpiredBadgeProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-warning-200 bg-warning-50 px-3 py-1 text-sm font-medium text-warning-700">
        <AlertTriangle aria-hidden="true" className="size-4" />
        {expiredText[type]}
      </span>
      {ctaLabel ? (
        <Button
          disabled
          title="Lowongan ini sudah tidak tersedia"
          className="pointer-events-none cursor-not-allowed opacity-50"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  )
}

export { ExpiredBadge }
export type { ExpiredBadgeProps }
