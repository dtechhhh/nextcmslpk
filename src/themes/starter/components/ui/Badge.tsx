import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const themeBadgeVariants = cva(
  "group/badge inline-flex h-5 max-w-full w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ellipsis transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
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
          "bg-[var(--color-status-success)] text-white",
        warning:
          "bg-[var(--color-status-warning)] text-white",
        error:
          "bg-[var(--color-status-error)] text-white",
        info:
          "bg-[var(--color-status-info)] text-white",
        neutral:
          "bg-[var(--color-neutral-500)] text-white",
        draft:
          "bg-[var(--color-neutral-500)] text-white",
        published:
          "bg-[var(--color-status-success)] text-white",
        closed:
          "bg-[var(--color-status-warning)] text-white",
        filled:
          "bg-[var(--color-status-info)] text-white",
        expired:
          "border-[color-mix(in_srgb,var(--color-status-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-status-warning)_10%,transparent)] text-[var(--color-status-warning)]",
        promo:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
        new_badge:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
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
