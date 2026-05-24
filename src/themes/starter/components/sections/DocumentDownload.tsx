import { Download } from "lucide-react"
import { Button } from "@/themes/starter/components/ui/Button"

interface DocumentDownloadProps {
  label: string
  fileUrl: string
  fileName?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

function DocumentDownload({
  label,
  fileUrl,
  fileName,
  size = "md",
  variant = "default",
}: DocumentDownloadProps) {
  const buttonSize = size === "md" ? "default" : size

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
      {label}
    </Button>
  )
}

export { DocumentDownload }
export type { DocumentDownloadProps }
