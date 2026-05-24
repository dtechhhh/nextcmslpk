import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const themeBadgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
        outline:
          "border-[var(--color-border)] text-[var(--color-foreground)]",
        ghost:
          "hover:bg-[var(--color-muted)] hover:text-[var(--color-muted-foreground)]",
        success:
          "bg-[#22c55e] text-white",
        warning:
          "bg-[#f59e0b] text-white",
        error:
          "bg-[#ef4444] text-white",
        info:
          "bg-[#3b82f6] text-white",
        neutral:
          "bg-[#64748b] text-white",
        draft:
          "bg-[#64748b] text-white",
        published:
          "bg-[#22c55e] text-white",
        closed:
          "bg-[#f59e0b] text-white",
        filled:
          "bg-[#3b82f6] text-white",
        expired:
          "border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#f59e0b]",
        promo:
          "bg-[#e53935] text-white",
        new_badge:
          "bg-[#e53935] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ThemeBadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof themeBadgeVariants> {}

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: ThemeBadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(themeBadgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, themeBadgeVariants }
export type { ThemeBadgeProps }
