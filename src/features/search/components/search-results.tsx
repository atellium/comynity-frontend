"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { getCategoryDisplayName, type CategorySearchItem } from "@/features/categories";
import { useCategoryNavigation } from "../use-category-navigation";

function highlightMatch(label: string, query: string): ReactNode[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [label];

  const normalizedLabel = label.toLocaleLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = normalizedLabel.indexOf(normalizedQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(label.slice(cursor, matchIndex));
    parts.push(
      <span
        key={`${matchIndex}-${normalizedQuery}`}
        className="font-bold text-brand"
      >
        {label.slice(matchIndex, matchIndex + normalizedQuery.length)}
      </span>,
    );
    cursor = matchIndex + normalizedQuery.length;
    matchIndex = normalizedLabel.indexOf(normalizedQuery, cursor);
  }

  if (cursor < label.length) parts.push(label.slice(cursor));
  return parts.length > 0 ? parts : [label];
}

export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: CategorySearchItem[];
}) {
  const openCategory = useCategoryNavigation();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);
  return (
    <section
      className="animate-in overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm fade-in duration-200 dark:border-brand-900/70 dark:bg-surface-dark-secondary"
      aria-label={`Suggestions for ${query}`}
    >
      {/* 3. SEARCH RESULTS (Clean, Borderless Vertical List) */}
      <div>
        {results.map((category) => {
          const label = getCategoryDisplayName(category);
          const isNavigating = navigatingSlug === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              disabled={navigatingSlug !== null}
              onClick={() => {
                if (openCategory(category)) setNavigatingSlug(category.slug);
              }}
              className="group flex min-h-16 w-full items-center gap-3.5 border-b border-border-subtle px-4 text-left text-[16px] text-foreground transition-colors last:border-0 hover:bg-brand-50/60 disabled:cursor-wait disabled:opacity-70 dark:border-border-dark-subtle dark:text-foreground-dark dark:hover:bg-brand/10"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand transition-colors group-hover:bg-brand-100 dark:bg-brand-950 dark:group-hover:bg-brand-900">
                {isNavigating ? (
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <i className="fa-regular fa-magnifying-glass text-sm" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {highlightMatch(label, query)}
              </span>
              <i
                className="fa-regular fa-arrow-up-right shrink-0 text-[14px] text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
