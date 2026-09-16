"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearRecentCategories } from "../search.slice";
import { useSearchItemNavigation } from "../use-category-navigation";

export function SearchIdle({ showRecent = true }: { showRecent?: boolean }) {
  const dispatch = useAppDispatch();
  const recentCategories = useAppSelector(
    (state) => state.search.recentCategories,
  ).filter((item) => item.type === "business" || item.type === "doctor" || item.type === "product");
  const openSearchItem = useSearchItemNavigation();

  return (
    <div className="animate-in space-y-5 py-1 fade-in">
      {showRecent && recentCategories.length > 0 && (
        <section aria-labelledby="recent-searches-heading">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2
              id="recent-searches-heading"
              className="text-xs font-semibold text-foreground-secondary dark:text-foreground-dark-secondary"
            >
              Recent searches
            </h2>
            <button
              type="button"
              onClick={() => dispatch(clearRecentCategories())}
              className="rounded-lg px-2 py-1 text-[11px] font-bold text-brand transition-colors hover:bg-brand-50 dark:hover:bg-brand-950"
            >
              Clear
            </button>
          </div>
          <div className="overflow-x-auto pb-1 scrollbar-hide overscroll-x-contain [touch-action:pan-x]">
            <div className="flex w-max min-w-full gap-2">
              {recentCategories.map((category) => (
                <button
                  key={`${category.type}-${category.slug}`}
                  type="button"
                  onClick={() => openSearchItem(category)}
                  className="flex h-10 max-w-56 shrink-0 items-center gap-2 rounded-full border border-border-subtle bg-white px-3.5 text-left text-[12px] text-foreground transition-colors hover:bg-surface-tertiary  dark:border-border-dark-subtle dark:bg-surface-dark-secondary dark:text-foreground-dark dark:hover:bg-surface-dark-tertiary"
                >
                  <i
                    className="fa-solid fa-clock-rotate-left shrink-0 text-[11px] text-foreground-muted dark:text-foreground-dark-muted"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {category.display_name || category.label || category.name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
