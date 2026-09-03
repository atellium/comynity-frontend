export function SearchLoading() {
  return (
    <div
      className="mt-2 overflow-hidden rounded-xl border border-border-subtle bg-white  dark:border-border-dark-subtle dark:bg-surface-dark-secondary"
      aria-label="Loading categories"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex h-16 items-center gap-4 border-b border-border-subtle px-5 last:border-0 dark:border-border-dark-subtle"
        >
          <span className="size-5 animate-pulse rounded-full bg-background-muted dark:bg-background-dark-muted" />
          <span className="h-4 w-2/3 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
        </div>
      ))}
    </div>
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <div className="animate-in flex items-center gap-3 rounded-xl border border-border-subtle bg-white px-4 py-3 fade-in  dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-muted dark:bg-background-dark-muted">
        <i
          className="fa-solid fa-magnifying-glass-minus text-sm text-foreground-muted dark:text-foreground-dark-muted"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-foreground dark:text-foreground-dark">
          No results found
        </h3>
        <p className="truncate text-xs font-medium text-foreground-secondary dark:text-foreground-dark-secondary">
          Nothing matched &quot;{query}&quot;.
        </p>
      </div>
    </div>
  );
}

export function SearchError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="animate-in flex flex-col items-center justify-center px-6 pt-24 pb-10 text-center duration-300 fade-in">
      <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/15">
        <i
          className="fa-solid fa-triangle-exclamation text-[32px] text-danger dark:text-danger-500"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-2 text-lg font-extrabold text-foreground dark:text-foreground-dark">
        Something went wrong
      </h3>
      <p className="mb-6 text-[14px] leading-relaxed font-medium text-foreground-secondary dark:text-foreground-dark-secondary">
        {message ?? "Unable to load search suggestions."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-brand px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500"
      >
        Try Again
      </button>
    </div>
  );
}
