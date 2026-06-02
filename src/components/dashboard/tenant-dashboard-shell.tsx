"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDownIcon,
  DatabaseIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SettingsIcon,
  UserCircleIcon,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";

import {
  DashboardVariantProvider,
  useDashboardVariant,
} from "@/components/dashboard/variant-context";
import { useCmsBusy } from "@/components/cms/cms-busy-feedback";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DASHBOARD_VARIANTS,
  DASHBOARD_VARIANT_KEYS,
  type DashboardRouteItem,
  type DashboardVariant,
} from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";

type TenantDashboardShellProps = {
  children: ReactNode;
  tenantName: string;
  username: string;
  initialVariant: DashboardVariant;
};

type SidebarSection = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: DashboardRouteItem[];
};

export function TenantDashboardShell({
  children,
  tenantName,
  username,
  initialVariant,
}: TenantDashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardVariantProvider initialVariant={initialVariant}>
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader
          tenantName={tenantName}
          username={username}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <div className="md:grid md:grid-cols-[272px_minmax(0,1fr)]">
          <aside className="hidden border-r bg-card md:block">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-80 p-0" showCloseButton>
              <SheetHeader className="border-b">
                <SheetTitle>{tenantName}</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </DashboardVariantProvider>
  );
}

function DashboardHeader({
  tenantName,
  username,
  onOpenMobileNav,
}: {
  tenantName: string;
  username: string;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <MenuIcon />
        </Button>

        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2 rounded-lg text-sm font-semibold"
        >
          <LayoutDashboardIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{tenantName}</span>
        </Link>

        <div className="order-3 w-full sm:order-none sm:w-auto">
          <VariantTabs className="w-full sm:w-auto" />
        </div>

        <div className="ml-auto">
          <UserMenu username={username} />
        </div>
      </div>
    </header>
  );
}

export function VariantTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeVariant, setActiveVariant } = useDashboardVariant();
  const busy = useCmsBusy();

  function handleValueChange(value: string | null) {
    if (value !== "indonesia" && value !== "japan") {
      return;
    }

    setActiveVariant(value);

    if (
      pathname.startsWith("/dashboard/indonesia") ||
      pathname.startsWith("/dashboard/japan")
    ) {
      busy.startNavigation("Membuka workspace...");
      router.push(DASHBOARD_VARIANTS[value].workspaceHref);
    }
  }

  return (
    <Tabs
      value={activeVariant}
      onValueChange={handleValueChange}
      className={cn("gap-0", className)}
    >
      <TabsList className="w-full sm:w-auto">
        {DASHBOARD_VARIANT_KEYS.map((variant) => (
          <TabsTrigger key={variant} value={variant}>
            {DASHBOARD_VARIANTS[variant].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function UserMenu({ username }: { username: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  const busy = useCmsBusy();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 px-2"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-36 truncate sm:inline">{username}</span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{username}</DropdownMenuLabel>
          <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            busy.startNavigation("Membuka akun...");
            window.location.href = "/dashboard/account";
          }}
          >
            <UserCircleIcon />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => {
            busy.start("Keluar dari dashboard...");
            void signOut({ callbackUrl: "/dashboard/login" });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { activeVariant } = useDashboardVariant();
  const config = DASHBOARD_VARIANTS[activeVariant];
  const sections: SidebarSection[] = [
    {
      title: "Global",
      icon: GlobeIcon,
      items: config.global,
    },
    {
      title: "Pages",
      icon: FileTextIcon,
      items: config.pages,
    },
    {
      title: "Collections",
      icon: DatabaseIcon,
      items: config.collections,
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-5 p-4">
      <nav className="flex flex-col gap-1">
        <SidebarLink
          href={config.workspaceHref}
          label="Dashboard Ringkas"
          icon={LayoutDashboardIcon}
          active={pathname === "/dashboard" || pathname === config.workspaceHref}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="flex flex-1 flex-col gap-5">
        {sections.map((section) => (
          <SidebarSectionBlock
            key={section.title}
            section={section}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}

        <nav className="flex flex-col gap-1">
          <SidebarLink
            href={config.optionsHref}
            label={config.optionsLabel}
            icon={SettingsIcon}
            active={isActivePath(pathname, config.optionsHref)}
            onNavigate={onNavigate}
          />
          <SidebarLink
            href="/dashboard/media"
            label={config.mediaLabel}
            icon={ImageIcon}
            active={isActivePath(pathname, "/dashboard/media")}
            onNavigate={onNavigate}
          />
        </nav>
      </div>
    </div>
  );
}

function SidebarSectionBlock({
  section,
  pathname,
  onNavigate,
}: {
  section: SidebarSection;
  pathname: string;
  onNavigate?: () => void;
}) {
  const SectionIcon = section.icon;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        <SectionIcon className="size-3.5" aria-hidden="true" />
        <span>{section.title}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {section.items.map((item) => (
          <SidebarTextLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={isActivePath(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarTextLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-8 items-center rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted font-medium text-foreground",
      )}
    >
      <span className="truncate">{label}</span>
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
