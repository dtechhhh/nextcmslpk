import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.ComponentProps<"div"> {
  as?: "div" | "section" | "main" | "header" | "footer"
}

function Container({
  className,
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
}

export { Container }
export type { ContainerProps }
