"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** Returns false during SSR and the hydration pass, then true in the browser. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
