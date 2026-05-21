"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  LayoutDashboardIcon,
  MenuIcon,
  ScrollTextIcon,
  UserCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    href: "/super-admin",
    label: "Overview",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    href: "/super-admin/tenants",
    label: "Tenants",
    icon: Building2Icon,
    exact: false,
  },
  {
    href: "/super-admin/audit-log",
    label: "Audit Log",
    icon: ScrollTextIcon,
    exact: false,
  },
  {
    href: "/super-admin/account",
    label: "Account",
    icon: UserCircleIcon,
    exact: false,
  },
] as const;

type SuperAdminShellProps = {
  children: React.ReactNode;
  username: string;
};

export function SuperAdminShell({ children, username }: SuperAdminShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r bg-card md:flex md:min-h-screen md:flex-col">
        <SidebarContent username={username} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open navigation" />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0" showCloseButton>
              <SheetHeader className="border-b">
                <SheetTitle>Super Admin</SheetTitle>
              </SheetHeader>
              <SidebarContent username={username} compact />
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Super Admin</p>
            <p className="truncate text-xs text-muted-foreground">{username}</p>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function SidebarContent({
  username,
  compact = false,
}: {
  username: string;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col gap-4 p-4">
      {!compact ? (
        <div className="px-2 py-1">
          <p className="text-sm font-semibold">Super Admin</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{username}</p>
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
