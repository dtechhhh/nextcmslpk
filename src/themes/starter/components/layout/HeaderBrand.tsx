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
        "max-w-[calc(100vw-5.5rem)] sm:max-w-80 lg:max-w-60 xl:max-w-72",
        className,
      )}
    >
      {logoSrc ? (
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden md:size-11">
          <Image
            src={logoSrc}
            alt=""
            width={logoWidth}
            height={logoHeight}
            priority
            className="max-h-10 max-w-12 object-contain md:max-h-11 md:max-w-14"
          />
        </span>
      ) : null}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-bold text-neutral-950 sm:text-base">
          {lpkName}
        </span>
        {tagline ? (
          <span className="mt-0.5 block truncate text-[10px] font-medium leading-4 text-neutral-500 sm:text-xs">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export type { HeaderBrandProps };
