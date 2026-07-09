"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type SyntheticEvent } from "react";

import { cn } from "@/lib/utils";

type CmsImageProps = ImageProps & {
  fallbackClassName?: string;
  fallbackLabel?: string;
};

function CmsImage({
  alt,
  className,
  fallbackClassName,
  fallbackLabel,
  onError,
  unoptimized,
  ...props
}: CmsImageProps) {
  const [hasFailed, setHasFailed] = useState(false);
  const isFill = Boolean(props.fill);
  const shouldBypassOptimizer =
    unoptimized ?? (typeof props.src === "string" && props.src.startsWith("/"));

  function handleError(event: SyntheticEvent<HTMLImageElement, Event>) {
    setHasFailed(true);
    onError?.(event);
  }

  if (hasFailed) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={cn(
          "flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--primary-50),#ffffff_52%,var(--primary-100))] text-center text-xs font-semibold leading-5 text-primary-700",
          isFill ? "absolute inset-0 h-full w-full" : "h-full w-full",
          fallbackClassName,
        )}
      >
        {fallbackLabel ? (
          <span className="line-clamp-2 max-w-[80%] rounded-full bg-white/75 px-3 py-1 shadow-sm">
            {fallbackLabel}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      unoptimized={shouldBypassOptimizer}
      onError={handleError}
      {...props}
    />
  );
}

export { CmsImage };
export type { CmsImageProps };
