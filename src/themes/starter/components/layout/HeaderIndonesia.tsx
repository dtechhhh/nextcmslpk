"use client";

import {
  ArrowRight,
  Briefcase,
  Globe2,
  GraduationCap,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
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
  const pathname = usePathname() || "/";
  const visibleNavItems = useMemo(
    () =>
      navItems
        .filter((item) => item.isEnabled)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [navItems],
  );
  const logo = logoSrc || logoLightSrc;
  const isActiveHref = (href: string) => {
    const normalizedHref = href.split("#")[0]?.split("?")[0] || "/";

    if (normalizedHref === "/") {
      return pathname === "/";
    }

    return (
      pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`)
    );
  };
  const quickActions = [
    {
      label: "Cek Program",
      description: "Bandingkan jalur yang sesuai profilmu.",
      href: "/program",
      icon: GraduationCap,
    },
    {
      label: "Lihat Lowongan",
      description: "Buka peluang Jepang yang sedang aktif.",
      href: "/job",
      icon: Briefcase,
    },
    {
      label: "Legalitas & Biaya",
      description: "Cek identitas lembaga dan info awal.",
      href: "/tentang-kami#profil-lembaga",
      icon: ShieldCheck,
    },
  ];

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
              aria-current={isActiveHref(item.href) ? "page" : undefined}
              className={cn(
                "relative text-sm font-medium transition hover:text-primary-500",
                isActiveHref(item.href) &&
                  "text-primary-700 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary-500",
              )}
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

        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg text-neutral-900 transition hover:bg-neutral-100 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu aria-hidden="true" className="size-6" />
            </SheetTrigger>
            <SheetContent
              showCloseButton={false}
              className="!w-[min(92vw,420px)] gap-0 overflow-hidden bg-white p-0 text-neutral-900"
            >
              <SheetHeader className="border-b border-neutral-200 p-5 pr-16">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary-600">
                  Menu
                </p>
                <SheetTitle className="text-base font-bold leading-tight">
                  {lpkName}
                </SheetTitle>
                {tagline ? (
                  <p className="text-xs font-medium leading-5 text-neutral-500">
                    {tagline}
                  </p>
                ) : null}
                <SheetClose
                  aria-label="Tutup menu"
                  className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                >
                  <X aria-hidden="true" className="size-5" />
                </SheetClose>
              </SheetHeader>

              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
                <section aria-labelledby="quick-menu-heading">
                  <h2
                    id="quick-menu-heading"
                    className="text-xs font-bold uppercase tracking-normal text-neutral-500"
                  >
                    Mulai dari sini
                  </h2>
                  <div className="mt-3 grid gap-2">
                    {quickActions.map((item) => {
                      const Icon = item.icon;

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-left transition hover:border-primary-200 hover:bg-primary-50",
                            isActiveHref(item.href) &&
                              "border-primary-200 bg-primary-50 text-primary-800",
                          )}
                        >
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition group-hover:bg-white">
                            <Icon aria-hidden="true" className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
                              {item.description}
                            </span>
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600"
                          />
                        </a>
                      );
                    })}
                  </div>
                </section>

                <section aria-labelledby="navigation-menu-heading">
                  <h2
                    id="navigation-menu-heading"
                    className="text-xs font-bold uppercase tracking-normal text-neutral-500"
                  >
                    Navigasi
                  </h2>
                  <nav className="mt-3 grid gap-1" aria-label="Menu mobile">
                    {visibleNavItems.map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        aria-current={isActiveHref(item.href) ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-3 text-sm font-semibold transition hover:bg-neutral-100",
                          isActiveHref(item.href) &&
                            "bg-primary-50 text-primary-700 ring-1 ring-primary-100",
                        )}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </section>

                {variantSwitch.isEnabled ? (
                  <a
                    href={variantSwitch.targetHref}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Globe2 aria-hidden="true" className="size-4 text-primary-600" />
                      Versi perusahaan Jepang
                    </span>
                    <span className="text-xs font-bold text-primary-600">
                      {variantSwitch.label || "Japan"}
                    </span>
                  </a>
                ) : null}
              </div>

              <SheetFooter className="mt-0 border-t border-neutral-200 bg-white p-5">
                <Button
                  render={<a href={headerCTA.whatsappHref} />}
                  variant="whatsapp"
                  size="lg"
                  className="w-full shadow-sm"
                >
                  <MessageCircle aria-hidden="true" className="size-5" />
                  {headerCTA.label}
                </Button>
                <p className="text-center text-xs leading-5 text-neutral-500">
                  Kirim profil untuk dicek dulu, belum wajib daftar.
                </p>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export type { HeaderIndonesiaProps };
