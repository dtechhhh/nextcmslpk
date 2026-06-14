"use client";

import { Clock, FileText, Mail, Menu, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
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
import { HeaderBrand } from "@/themes/starter/components/layout/HeaderBrand";
import { DocumentDownload } from "@/themes/starter/components/sections/DocumentDownload";
import { Button } from "@/themes/starter/components/ui/Button";

const JAPAN_HEADER_DOWNLOAD_LABEL = "\u4f1a\u793e\u8cc7\u6599\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9";

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
  primaryCTA?: {
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
  const pathname = usePathname();
  const visibleNavItems = useMemo(
    () =>
      navItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [navItems],
  );
  const logo = logoSrc || logoLightSrc;
  const lineHref = primaryCTA?.lineAccountId
    ? buildLineUrl(primaryCTA.lineAccountId, primaryCTA.lineMessageTemplate, {
        lpk_name: lpkName,
      })
    : "";
  const hasDrawerContact = Boolean(topbar.businessHoursLabel || topbar.emailLabel);
  const isActiveHref = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) {
      return false;
    }

    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className={cn("z-40 bg-white", sticky && "sticky top-0")}>
      {topbar.isEnabled ? (
        <div className="hidden border-b border-white/10 bg-primary-700 text-white md:flex">
          <div className="mx-auto grid h-10 w-full max-w-7xl grid-cols-3 items-center gap-4 px-4 text-xs font-medium sm:px-6 lg:px-8">
            <p className="truncate text-left">{topbar.locationLabel}</p>
            <p className="truncate text-center">{topbar.emailLabel}</p>
            <p className="truncate text-right">{topbar.businessHoursLabel}</p>
          </div>
        </div>
      ) : null}

      <div className="border-b border-neutral-200 bg-white text-neutral-900">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[72px] lg:px-8">
          <HeaderBrand lpkName={lpkName} tagline={tagline} logoSrc={logo} />

          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="メインナビゲーション"
          >
            {visibleNavItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                aria-current={isActiveHref(item.href) ? "page" : undefined}
                className={cn(
                  "text-sm font-semibold transition hover:text-primary-500",
                  isActiveHref(item.href) && "text-primary-500",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {lineHref && primaryCTA ? (
              <Button render={<a href={lineHref} />} variant="line">
                <MessageCircle aria-hidden="true" className="size-4" />
                {primaryCTA.label}
              </Button>
            ) : null}
            <SecondaryCTA secondaryCTA={secondaryCTA} />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {lineHref && primaryCTA ? (
              <Button render={<a href={lineHref} />} variant="line" size="sm">
                <MessageCircle aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{primaryCTA.label}</span>
              </Button>
            ) : null}
            <Sheet>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg text-neutral-900 lg:hidden"
              aria-label="メニューを開く"
            >
              <Menu aria-hidden="true" className="size-6" />
            </SheetTrigger>
            <SheetContent className="w-[min(84vw,360px)] bg-white text-neutral-900">
              <SheetHeader className="border-b border-neutral-200 p-5 pr-12">
                <SheetTitle className="text-lg font-bold leading-tight">{lpkName}</SheetTitle>
                {tagline ? (
                  <p className="text-xs font-medium text-neutral-500">{tagline}</p>
                ) : null}
              </SheetHeader>
              <div className="flex flex-col gap-1 px-5">
                {visibleNavItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    aria-current={isActiveHref(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-3 text-sm font-semibold hover:bg-neutral-100",
                      isActiveHref(item.href) &&
                        "bg-primary-50 text-primary-700 ring-1 ring-primary-100",
                    )}
                  >
                    {item.label}
                  </a>
                ))}
                {lineHref && primaryCTA ? (
                  <Button
                    render={<a href={lineHref} />}
                    variant="line"
                    size="lg"
                    className="mt-4 h-11 w-full bg-[#06C755] text-white shadow-sm hover:brightness-95"
                  >
                    <MessageCircle aria-hidden="true" className="size-4" />
                    {primaryCTA.label}
                  </Button>
                ) : null}
                <SecondaryCTA secondaryCTA={secondaryCTA} mobile />
                {hasDrawerContact ? (
                  <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-normal text-primary-600">
                      お問い合わせ
                    </p>
                    <div className="mt-3 space-y-3 text-xs leading-5 text-neutral-600">
                      {topbar.businessHoursLabel ? (
                        <p className="flex gap-2">
                          <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-500" />
                          <span>{topbar.businessHoursLabel}</span>
                        </p>
                      ) : null}
                      {topbar.emailLabel ? (
                        <p className="flex gap-2">
                          <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-500" />
                          <span className="break-all">{topbar.emailLabel}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
          </div>
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
        fallbackLabel={JAPAN_HEADER_DOWNLOAD_LABEL}
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
