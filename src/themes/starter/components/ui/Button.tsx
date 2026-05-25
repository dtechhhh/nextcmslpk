import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const themeButtonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]",
        outline:
          "border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/80",
        ghost:
          "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
        whatsapp:
          "bg-[var(--color-cta)] text-[var(--color-cta-foreground)] hover:brightness-95",
        line:
          "bg-[var(--color-cta)] text-[var(--color-cta-foreground)] hover:brightness-95",
      },
      size: {
        default: "h-9 gap-2 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-11 gap-2 rounded-lg px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ThemeButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof themeButtonVariants> {}

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  ...props
}: ThemeButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      render={render}
      nativeButton={nativeButton ?? !render}
      className={cn(themeButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, themeButtonVariants }
export type { ThemeButtonProps }
