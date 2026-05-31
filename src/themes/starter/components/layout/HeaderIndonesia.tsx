"use client";

import { Globe2, Menu } from "lucide-react";
import { useMemo } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HeaderBrand } from "@/themes/starter/components/layout/HeaderBrand";
import { Button } from "@/themes/starter/components/ui/Button";

type NavItem = {
  key: string;
  label: string;
  href: string;
  isEnabled: boolean;
  sortOrder?: number;
};

type HeaderIndonesiaProps = {
  lpkName: string;
  tagline?: string;
  logoSrc?: string;
  logoLightSrc?: string;
  navItems: NavItem[];
  variantSwitch: { isEnabled: boolean; targetHref: string; label?: string };
  headerCTA: { label: string; whatsappHref: string };
  sticky: boolean;
  headerStyle: "solid" | "transparent_on_hero";
};

export function HeaderIndonesia({
  lpkName,
  tagline,
  logoSrc,
  logoLightSrc,
  navItems,
  variantSwitch,
  headerCTA,
  sticky,
}: HeaderIndonesiaProps) {
  const visibleNavItems = useMemo(
    () =>
      navItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [navItems],
  );
  const logo = logoSrc || logoLightSrc;

  return (
    <header
      className={cn(
        "z-40 border-b border-neutral-200 bg-white text-neutral-900 shadow-sm",
        sticky && "sticky top-0",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <HeaderBrand lpkName={lpkName} tagline={tagline} logoSrc={logo} />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {visibleNavItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-medium transition hover:text-primary-500"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {variantSwitch.isEnabled ? (
            <Button
              render={<a href={variantSwitch.targetHref} />}
              variant="ghost"
            >
              <Globe2 aria-hidden="true" className="size-4" />
              {variantSwitch.label || "Japan"}
            </Button>
          ) : null}
          <Button render={<a href={headerCTA.whatsappHref} />} variant="whatsapp">
            {headerCTA.label}
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            className="inline-flex size-10 items-center justify-center rounded-lg text-neutral-900 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu aria-hidden="true" className="size-6" />
          </SheetTrigger>
          <SheetContent className="w-[min(88vw,360px)] bg-white text-neutral-900">
            <SheetHeader>
              <SheetTitle>{lpkName}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              {visibleNavItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-neutral-100"
                >
                  {item.label}
                </a>
              ))}
              {variantSwitch.isEnabled ? (
                <a
                  href={variantSwitch.targetHref}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-neutral-100"
                >
                  {variantSwitch.label || "Japan"}
                </a>
              ) : null}
              <Button
                render={<a href={headerCTA.whatsappHref} />}
                variant="whatsapp"
                className="mt-3 w-full"
              >
                {headerCTA.label}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export type { HeaderIndonesiaProps };
