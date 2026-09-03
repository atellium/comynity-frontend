"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center px-page text-center">
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 text-sm text-foreground-muted">We could not load this page. Please try again.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">
        Try again
      </button>
    </main>
  );
}
