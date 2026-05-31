"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type HeaderBrandProps = {
  lpkName: string;
  tagline?: string;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
};

export function HeaderBrand({
  lpkName,
  tagline,
  logoSrc,
  logoWidth = 56,
  logoHeight = 56,
  className,
}: HeaderBrandProps) {
  return (
    <Link
      href="/"
      aria-label={lpkName}
      className={cn(
        "flex min-w-0 items-center gap-3",
        "max-w-[58vw] sm:max-w-80 lg:max-w-60 xl:max-w-72",
        className,
      )}
    >
      {logoSrc ? (
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden">
          <Image
            src={logoSrc}
            alt=""
            width={logoWidth}
            height={logoHeight}
            priority
            className="max-h-11 max-w-14 object-contain"
          />
        </span>
      ) : null}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-bold text-neutral-950 sm:text-base">
          {lpkName}
        </span>
        {tagline ? (
          <span className="mt-0.5 block truncate text-[11px] font-medium leading-4 text-neutral-500 sm:text-xs">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export type { HeaderBrandProps };
