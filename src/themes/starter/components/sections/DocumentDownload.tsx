import { Download } from "lucide-react"
import { normalizeActionLabel } from "@/lib/display-label"
import { Button } from "@/themes/starter/components/ui/Button"

interface DocumentDownloadProps {
  label: string
  fileUrl: string
  fileName?: string
  fallbackLabel?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

function DocumentDownload({
  label,
  fileUrl,
  fileName,
  fallbackLabel = "Unduh dokumen",
  size = "md",
  variant = "default",
}: DocumentDownloadProps) {
  const buttonSize = size === "md" ? "default" : size
  const displayLabel = normalizeActionLabel(label, fallbackLabel, fileUrl)

  return (
    <Button
      render={
        <a
          href={fileUrl}
          download={fileName}
          target="_blank"
          rel="noreferrer"
        />
      }
      size={buttonSize}
      variant={variant}
    >
      <Download aria-hidden="true" className="size-4" />
      {displayLabel}
    </Button>
  )
}

export { DocumentDownload }
export type { DocumentDownloadProps }
