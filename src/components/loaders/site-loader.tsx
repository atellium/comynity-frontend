export function SiteLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-surface dark:bg-surface-dark"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <div className="size-11 animate-spin rounded-full border-4 border-surface-tertiary border-t-foreground-muted dark:border-surface-dark-tertiary dark:border-t-foreground-dark-muted" />
    </div>
  );
}

export default SiteLoader;
