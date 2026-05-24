"use client"

import { ExternalLink, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FloatingCTAProps {
  variant: "whatsapp" | "line"
  href: string
  iconOnlyLabel?: string
  labelAfterScroll?: string
  position?: "bottom-right" | "bottom-left"
}

function FloatingCTA({
  variant,
  href,
  iconOnlyLabel = variant === "whatsapp" ? "WhatsApp" : "LINE",
  labelAfterScroll = variant === "whatsapp" ? "Chat WhatsApp" : "Chat LINE",
  position = "bottom-right",
}: FloatingCTAProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = variant === "whatsapp" ? MessageCircle : ExternalLink

  useEffect(() => {
    function handleScroll() {
      setIsExpanded(window.scrollY > 200)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={isExpanded ? labelAfterScroll : iconOnlyLabel}
      className={cn(
        "fixed bottom-6 z-50 flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full px-4 text-white shadow-lg transition-all duration-300",
        position === "bottom-right" ? "right-6" : "left-6",
        variant === "whatsapp" ? "bg-brand-whatsapp" : "bg-jp-line",
        isExpanded ? "w-44" : "w-14"
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span
        className={cn(
          "whitespace-nowrap text-sm font-semibold transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      >
        {labelAfterScroll}
      </span>
    </a>
  )
}

export { FloatingCTA }
export type { FloatingCTAProps }
