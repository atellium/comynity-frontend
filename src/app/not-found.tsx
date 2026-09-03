import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[75dvh] max-w-xl flex-col items-center justify-center px-page py-16 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-brand-50 text-brand ring-8 ring-brand-50/50 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-950/50">
        <SearchX size={44} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="mt-8 rounded-full bg-surface-tertiary px-3 py-1 text-xs font-extrabold tracking-widest text-brand dark:bg-surface-dark-tertiary dark:text-brand-300">
        ERROR 404
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground dark:text-foreground-dark ">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-foreground-muted dark:text-foreground-dark-muted ">
        This page or business listing may have moved, been removed, or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        Return home
      </Link>
    </main>
  );
}
