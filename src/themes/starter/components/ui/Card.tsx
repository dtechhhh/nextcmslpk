import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  variant = "indonesia",
  ...props
}: React.ComponentProps<"div"> & { variant?: "indonesia" | "japan" }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-white py-4 text-sm",
        variant === "indonesia" && "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]",
        variant === "japan" && "border border-neutral-200",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 rounded-t-xl px-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-semibold leading-snug text-neutral-900", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-neutral-600", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t border-neutral-100 bg-neutral-50 p-4",
        className
      )}
      {...props}
    />
  )
}

function CardImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      data-slot="card-image"
      className={cn("aspect-[4/3] w-full object-cover", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
}
