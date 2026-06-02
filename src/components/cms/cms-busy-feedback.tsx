"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";

type BusyContextValue = {
  start: (message?: string) => () => void;
  startNavigation: (message?: string) => void;
  run: <T>(message: string, task: () => Promise<T>) => Promise<T>;
};

type BusyState = {
  message: string;
  visible: boolean;
};

const DEFAULT_MESSAGE = "Memproses permintaan...";
const NAVIGATION_MESSAGE = "Membuka halaman...";
const MIN_VISIBLE_MS = 450;
const NAVIGATION_TIMEOUT_MS = 10000;

const CmsBusyContext = createContext<BusyContextValue>({
  start: () => () => {},
  startNavigation: () => {},
  run: async (_message, task) => task(),
});

export function CmsBusyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [state, setState] = useState<BusyState>({
    message: DEFAULT_MESSAGE,
    visible: false,
  });
  const pendingTokensRef = useRef(new Set<symbol>());
  const hideTimeoutRef = useRef<number | null>(null);
  const navigationStopRef = useRef<null | (() => void)>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideWhenIdle = useCallback(
    (startedAt: number) => {
      if (pendingTokensRef.current.size > 0) {
        return;
      }

      const elapsed = window.performance.now() - startedAt;
      const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0);

      clearHideTimeout();
      hideTimeoutRef.current = window.setTimeout(() => {
        setState((current) => ({ ...current, visible: false }));
        hideTimeoutRef.current = null;
      }, delay);
    },
    [clearHideTimeout],
  );

  const start = useCallback(
    (message = DEFAULT_MESSAGE) => {
      const token = Symbol("cms-busy");
      const startedAt = window.performance.now();

      pendingTokensRef.current.add(token);
      clearHideTimeout();
      setState({
        message,
        visible: true,
      });

      return () => {
        if (!pendingTokensRef.current.delete(token)) {
          return;
        }

        hideWhenIdle(startedAt);
      };
    },
    [clearHideTimeout, hideWhenIdle],
  );

  const startNavigation = useCallback(
    (message = NAVIGATION_MESSAGE) => {
      navigationStopRef.current?.();

      const stop = start(message);
      navigationStopRef.current = stop;

      window.setTimeout(() => {
        if (navigationStopRef.current === stop) {
          navigationStopRef.current = null;
          stop();
        }
      }, NAVIGATION_TIMEOUT_MS);
    },
    [start],
  );

  const run = useCallback(
    async <T,>(message: string, task: () => Promise<T>) => {
      const stop = start(message);

      try {
        return await task();
      } finally {
        stop();
      }
    },
    [start],
  );

  useEffect(() => {
    if (!navigationStopRef.current) {
      return;
    }

    const stop = navigationStopRef.current;
    navigationStopRef.current = null;
    stop();
  }, [pathname, search]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      if (!isCmsPath(nextUrl.pathname)) {
        return;
      }

      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${nextUrl.pathname}${nextUrl.search}`;

      if (current === next) {
        return;
      }

      startNavigation();
    }

    document.addEventListener("click", handleDocumentClick, { capture: true });

    return () => document.removeEventListener("click", handleDocumentClick, { capture: true });
  }, [startNavigation]);

  useEffect(() => () => clearHideTimeout(), [clearHideTimeout]);

  const value = useMemo(
    () => ({
      start,
      startNavigation,
      run,
    }),
    [run, start, startNavigation],
  );

  return (
    <CmsBusyContext.Provider value={value}>
      {children}
      <CmsBusyIndicator message={state.message} visible={state.visible} />
    </CmsBusyContext.Provider>
  );
}

export function useCmsBusy() {
  return useContext(CmsBusyContext);
}

function CmsBusyIndicator({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className={
          visible
            ? "fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10 opacity-100 transition-opacity"
            : "pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10 opacity-0 transition-opacity"
        }
      >
        <div className="h-full w-1/2 rounded-full bg-primary cms-progress-bar" />
      </div>

      <div
        role="status"
        aria-live="polite"
        className={
          visible
            ? "pointer-events-none fixed right-4 top-16 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border bg-background/95 px-3 py-2 text-sm text-foreground shadow-lg opacity-100 backdrop-blur transition duration-150"
            : "pointer-events-none fixed right-4 top-16 z-[100] flex max-w-[calc(100vw-2rem)] translate-y-1 items-center gap-2 rounded-lg border bg-background/95 px-3 py-2 text-sm text-foreground shadow-lg opacity-0 backdrop-blur transition duration-150"
        }
      >
        <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />
        <span className="truncate">{message}</span>
      </div>
    </>
  );
}

function isCmsPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/super-admin");
}
