"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe2, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
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
  logoSrc,
  logoLightSrc,
  navItems,
  variantSwitch,
  headerCTA,
  sticky,
  headerStyle,
}: HeaderIndonesiaProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const isTransparent = headerStyle === "transparent_on_hero" && !hasScrolled;
  const visibleNavItems = useMemo(
    () =>
      navItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [navItems],
  );
  const activeLogo = isTransparent && logoLightSrc ? logoLightSrc : logoSrc;

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 80);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "top-0 z-40 transition-all duration-300",
        sticky && "sticky",
        isTransparent
          ? "bg-transparent text-white"
          : "bg-white text-neutral-900 shadow-sm",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {activeLogo ? (
            <Image
              src={activeLogo}
              alt={lpkName}
              width={160}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="truncate text-lg font-bold">{lpkName}</span>
          )}
        </Link>

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
              variant={isTransparent ? "outline" : "ghost"}
              className={cn(
                isTransparent &&
                  "border-white/70 bg-white/10 text-white hover:bg-white hover:text-neutral-900",
              )}
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
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-lg lg:hidden",
              isTransparent ? "text-white" : "text-neutral-900",
            )}
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
