"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { makeStore, startPersistence } from "@/store";
import { AuthSessionInitializer } from "@/features/auth";
import { LocationSessionInitializer } from "@/features/location";
import { ServiceWorkerRegistrar } from "@/features/pwa";
import { CategoryCacheRefresher } from "@/features/categories";
import { SiteStartupLoader } from "@/components/loaders";
import { cacheEnabled } from "@/lib/cache-config";

export default function Providers({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: cacheEnabled ? 5 * 60 * 1000 : 0,
            gcTime: cacheEnabled ? 30 * 60 * 1000 : 0,
            refetchOnMount: cacheEnabled ? true : "always",
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const queryPersister = useMemo(
    () =>
      createSyncStoragePersister({
        storage:
          typeof window === "undefined" ? undefined : window.sessionStorage,
        key: "comynity-query-cache",
      }),
    [],
  );
  const persistenceStarted = useRef(false);

  useEffect(() => {
    if (persistenceStarted.current) return;

    persistenceStarted.current = true;
    startPersistence(store);
  }, [store]);

  useEffect(() => {
    if (!cacheEnabled) window.sessionStorage.removeItem("comynity-query-cache");
  }, []);

  const content = <Provider store={store}>
    <CategoryCacheRefresher />
    <ServiceWorkerRegistrar />
    <SiteStartupLoader />
    <AuthSessionInitializer />
    <LocationSessionInitializer />
    {children}
  </Provider>;

  if (!cacheEnabled) {
    return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: 30 * 60 * 1000 }}
    >
      {content}
    </PersistQueryClientProvider>
  );
}
