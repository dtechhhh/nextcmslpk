"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

import { refreshAuthActivityAction } from "@/server/actions/auth";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;
const ACTIVITY_SYNC_INTERVAL_MS = 60 * 1000;
const LAST_ACTIVITY_KEY = "nextcmslpk:lastActivity";

type IdleTrackerProps = {
  callbackUrl?: string;
};

export function IdleTracker({ callbackUrl = "/dashboard/login" }: IdleTrackerProps) {
  useEffect(() => {
    let lastSyncedAt = 0;
    let isSigningOut = false;

    function syncActivity(lastActivity: number) {
      const now = Date.now();

      if (now - lastSyncedAt < ACTIVITY_SYNC_INTERVAL_MS) {
        return;
      }

      lastSyncedAt = now;
      void refreshAuthActivityAction({ lastActivity });
    }

    function markActivity() {
      const now = Date.now();

      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      syncActivity(now);
    }

    function checkIdle() {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      if (!lastActivity) {
        markActivity();
        return;
      }

      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        if (isSigningOut) {
          return;
        }

        isSigningOut = true;
        void signOut({ redirect: false }).finally(() => {
          window.location.replace(callbackUrl);
        });
        return;
      }

      syncActivity(lastActivity);
    }

    markActivity();

    window.addEventListener("click", markActivity);
    window.addEventListener("keypress", markActivity);
    window.addEventListener("keydown", markActivity);
    window.addEventListener("scroll", markActivity, { passive: true });

    const intervalId = window.setInterval(checkIdle, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("click", markActivity);
      window.removeEventListener("keypress", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("scroll", markActivity);
      window.clearInterval(intervalId);
    };
  }, [callbackUrl]);

  return null;
}
