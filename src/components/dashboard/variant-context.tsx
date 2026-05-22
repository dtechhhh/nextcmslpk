"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  DEFAULT_DASHBOARD_VARIANT,
  getDashboardVariantFromPathname,
  type DashboardVariant,
} from "@/lib/dashboard-routes";

type DashboardVariantContextValue = {
  activeVariant: DashboardVariant;
  setActiveVariant: (variant: DashboardVariant) => void;
};

const DashboardVariantContext =
  createContext<DashboardVariantContextValue | null>(null);

type DashboardVariantProviderProps = {
  children: ReactNode;
  initialVariant?: DashboardVariant;
};

export function DashboardVariantProvider({
  children,
  initialVariant = DEFAULT_DASHBOARD_VARIANT,
}: DashboardVariantProviderProps) {
  const pathname = usePathname();
  const pathnameVariant = getDashboardVariantFromPathname(pathname);
  const [selectedVariant, setSelectedVariant] =
    useState<DashboardVariant>(initialVariant);
  const activeVariant = pathnameVariant ?? selectedVariant;

  const value = useMemo(
    () => ({
      activeVariant,
      setActiveVariant: setSelectedVariant,
    }),
    [activeVariant, setSelectedVariant],
  );

  return (
    <DashboardVariantContext.Provider value={value}>
      {children}
    </DashboardVariantContext.Provider>
  );
}

export function useDashboardVariant() {
  const context = useContext(DashboardVariantContext);

  if (!context) {
    throw new Error(
      "useDashboardVariant must be used within DashboardVariantProvider",
    );
  }

  return context;
}
