"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  fetchCategories,
  getCategoryDisplayName,
  useFeaturedCategories,
} from "@/features/categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearRecentCategories } from "../search.slice";
import { useCategoryNavigation } from "../use-category-navigation";

export function SearchIdle({ showRecent = true }: { showRecent?: boolean }) {
  const dispatch = useAppDispatch();
  const recentCategories = useAppSelector(
    (state) => state.search.recentCategories,
  );
  const items = useAppSelector((state) => state.categories.items);
  const categoriesRehydrated = useAppSelector(
    (state) => state.categories._persist?.rehydrated ?? false,
  );
  const openCategory = useCategoryNavigation();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);
  const { data: popularCategories = [] } = useFeaturedCategories();

  useEffect(() => {
    if (categoriesRehydrated && items.length === 0) dispatch(fetchCategories());
  }, [categoriesRehydrated, dispatch, items.length]);

  const rows =
    recentCategories.length > 3
      ? [
          recentCategories.filter((_, index) => index % 2 === 0),
          recentCategories.filter((_, index) => index % 2 === 1),
        ]
      : [recentCategories];

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
            <div className="flex w-max min-w-full flex-col gap-2.5">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  {row.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => openCategory(category)}
                      className="flex h-10 max-w-56 shrink-0 items-center gap-2 rounded-full border border-border-subtle bg-white px-3.5 text-left text-[12px] text-foreground transition-colors hover:bg-surface-tertiary  dark:border-border-dark-subtle dark:bg-surface-dark-secondary dark:text-foreground-dark dark:hover:bg-surface-dark-tertiary"
                    >
                      <i
                        className="fa-solid fa-clock-rotate-left shrink-0 text-[11px] text-foreground-muted dark:text-foreground-dark-muted"
                        aria-hidden="true"
                      />
                      <span className="truncate font-semibold">
                        {getCategoryDisplayName(category)}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {popularCategories.length > 0 && (
        <section aria-labelledby="popular-searches-heading">
          <h2
            id="popular-searches-heading"
            className="mb-2 px-1 text-xs font-semibold text-foreground-secondary dark:text-foreground-dark-secondary"
          >
            Popular searches
          </h2>
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-xs dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
            {popularCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={navigatingSlug !== null}
                onClick={() => {
                  const selection = {
                    ...category,
						label: category.label?.trim() || category.name,
                  };
                  if (openCategory(selection)) setNavigatingSlug(category.slug);
                }}
                className="group flex min-h-16 min-w-0 items-center gap-3 border-b border-border-subtle p-2 text-left transition-colors last:border-b-0 hover:bg-brand-50/60 disabled:cursor-wait disabled:opacity-70 dark:border-border-dark-subtle dark:hover:bg-brand/10"
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary">
                  <Image
                    src={category.image || "/images/default_category.png"}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {navigatingSlug === category.slug ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                      <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0 truncate text-[12px] font-semibold text-foreground dark:text-foreground-dark">
                  {category.label || category.name}
                </span>
                <i
                  className="fa-regular fa-chevron-right ml-auto shrink-0 text-xs text-brand transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
