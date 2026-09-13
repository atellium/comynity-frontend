"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-background px-page pb-3 pt-[calc(env(safe-area-inset-top)+12px)]    dark:bg-background-dark ">
      <div className="mx-auto flex h-15 w-full items-center rounded-xl border border-border-subtle bg-white px-page  dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mr-1 -ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-brand-50 dark:text-foreground-dark dark:hover:bg-brand-950"
        >
          <ChevronLeft size={36} strokeWidth={1.8} className="text-brand" aria-hidden="true" />
        </button>
        <input
          type="search"
          aria-label="Search categories"
          placeholder="Search categories"
          className="h-full min-w-0 flex-1 appearance-none bg-transparent font-medium text-[17px] text-foreground outline-none placeholder:text-foreground-muted dark:text-foreground-dark dark:placeholder:text-foreground-dark-muted [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="mr-1 text-foreground-muted dark:text-foreground-dark-muted"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
