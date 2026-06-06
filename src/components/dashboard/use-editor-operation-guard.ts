"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SLOW_OPERATION_MS = 10000;
const STALLED_OPERATION_MS = 30000;

export function useEditorExitGuard(getBlockMessage: () => string | null) {
  const getBlockMessageRef = useRef(getBlockMessage);

  useEffect(() => {
    getBlockMessageRef.current = getBlockMessage;
  }, [getBlockMessage]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!getBlockMessageRef.current()) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

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

      const blockMessage = getBlockMessageRef.current();

      if (!blockMessage) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin || url.href === window.location.href) {
        return;
      }

      const confirmed = window.confirm(blockMessage);

      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);
}

export function useLongRunningOperationNotice() {
  const [operationNotice, setOperationNotice] = useState<string | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const clearOperationNotice = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }

    timeoutIdsRef.current = [];
    setOperationNotice(null);
  }, []);

  const watchOperation = useCallback(
    (slowMessage: string, stalledMessage: string) => {
      clearOperationNotice();

      const slowTimeoutId = window.setTimeout(() => {
        setOperationNotice(slowMessage);
      }, SLOW_OPERATION_MS);
      const stalledTimeoutId = window.setTimeout(() => {
        setOperationNotice(stalledMessage);
      }, STALLED_OPERATION_MS);

      timeoutIdsRef.current = [slowTimeoutId, stalledTimeoutId];

      return clearOperationNotice;
    },
    [clearOperationNotice],
  );

  useEffect(() => clearOperationNotice, [clearOperationNotice]);

  return {
    operationNotice,
    watchOperation,
  };
}
