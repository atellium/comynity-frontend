"use client";

import { useEffect } from "react";
import { cacheEnabled } from "@/lib/cache-config";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production" || !cacheEnabled) {
      // A previously installed production worker can otherwise serve stale
      // Next.js development chunks and create false hydration failures.
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      );
      if ("caches" in window) {
        void window.caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("comynity-"))
              .map((key) => window.caches.delete(key)),
          ),
        );
      }
      return;
    }

    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }, []);

  return null;
}
