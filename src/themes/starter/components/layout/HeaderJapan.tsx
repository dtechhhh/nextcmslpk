"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Menu, MessageCircle } from "lucide-react";
import { useMemo } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildLineUrl } from "@/lib/line";
import { cn } from "@/lib/utils";
import { DocumentDownload } from "@/themes/starter/components/sections/DocumentDownload";
import { Button } from "@/themes/starter/components/ui/Button";

type NavItem = {
  key: string;
  label: string;
  href: string;
  isEnabled: boolean;
  sortOrder: number;
};

type HeaderJapanProps = {
  lpkName: string;
  tagline?: string;
  logoSrc?: string;
  logoLightSrc?: string;
  topbar: {
    locationLabel?: string;
    emailLabel?: string;
    businessHoursLabel?: string;
    isEnabled: boolean;
  };
  navItems: NavItem[];
  primaryCTA: {
    label: string;
    lineAccountId: string;
    lineMessageTemplate: string;
  };
  secondaryCTA: {
    label: string;
    type: "document" | "internal_link";
    documentUrl?: string;
    href?: string;
    isEnabled: boolean;
  };
  sticky: boolean;
};

export function HeaderJapan({
  lpkName,
  tagline,
  logoSrc,
  logoLightSrc,
  topbar,
  navItems,
  primaryCTA,
  secondaryCTA,
  sticky,
}: HeaderJapanProps) {
  const visibleNavItems = useMemo(
    () =>
      navItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [navItems],
  );
  const logo = logoSrc || logoLightSrc;
  const lineHref = primaryCTA.lineAccountId
    ? buildLineUrl(primaryCTA.lineAccountId, primaryCTA.lineMessageTemplate, {
        lpk_name: lpkName,
      })
    : "#";

  return (
    <header className={cn("z-40 bg-white", sticky && "sticky top-0")}>
      {topbar.isEnabled ? (
        <div className="hidden border-b-2 border-secondary-500 bg-primary-700 text-white md:flex">
          <div className="mx-auto grid h-10 w-full max-w-7xl grid-cols-3 items-center gap-4 px-4 text-xs font-medium sm:px-6 lg:px-8">
            <p className="truncate text-left">{topbar.locationLabel}</p>
            <p className="truncate text-center">{topbar.emailLabel}</p>
            <p className="truncate text-right">{topbar.businessHoursLabel}</p>
          </div>
        </div>
      ) : null}

      <div className="border-b border-neutral-200 bg-white text-neutral-900">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                alt={lpkName}
                width={168}
                height={48}
                priority
                className="h-11 w-auto object-contain"
              />
            ) : (
              <span className="truncate text-lg font-bold">{lpkName}</span>
            )}
            {tagline ? (
              <span className="hidden max-w-44 text-xs leading-5 text-neutral-500 xl:block">
                {tagline}
              </span>
            ) : null}
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {visibleNavItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm font-semibold transition hover:text-primary-500"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button render={<a href={lineHref} />} variant="line">
              <MessageCircle aria-hidden="true" className="size-4" />
              {primaryCTA.label}
            </Button>
            <SecondaryCTA secondaryCTA={secondaryCTA} />
          </div>

          <Sheet>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg text-neutral-900 lg:hidden"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" className="size-6" />
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,380px)] bg-white text-neutral-900">
              <SheetHeader>
                <SheetTitle>{lpkName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                {visibleNavItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-neutral-100"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  render={<a href={lineHref} />}
                  variant="line"
                  className="mt-3 w-full"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  {primaryCTA.label}
                </Button>
                <SecondaryCTA secondaryCTA={secondaryCTA} mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function SecondaryCTA({
  secondaryCTA,
  mobile = false,
}: {
  secondaryCTA: HeaderJapanProps["secondaryCTA"];
  mobile?: boolean;
}) {
  if (!secondaryCTA.isEnabled) {
    return null;
  }

  if (secondaryCTA.type === "document" && secondaryCTA.documentUrl) {
    return (
      <DocumentDownload
        label={secondaryCTA.label}
        fileUrl={secondaryCTA.documentUrl}
        size={mobile ? "md" : "sm"}
        variant="outline"
      />
    );
  }

  if (secondaryCTA.type === "internal_link" && secondaryCTA.href) {
    return (
      <Button
        render={<a href={secondaryCTA.href} />}
        variant="outline"
        className={cn(mobile && "w-full")}
      >
        <FileText aria-hidden="true" className="size-4" />
        {secondaryCTA.label}
      </Button>
    );
  }

  return null;
}

export type { HeaderJapanProps, NavItem as HeaderJapanNavItem };
