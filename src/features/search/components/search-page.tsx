"use client";

import { useState } from "react";
import { useCategorySearch } from "../use-category-search";
import { SearchHeader } from "./search-header";
import { SearchIdle } from "./search-idle";
import { SearchResults } from "./search-results";
import { SearchEmpty, SearchError, SearchLoading } from "./search-feedback";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const { results, canSearch, status, error, retry } = useCategorySearch(query);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-background   dark:bg-background-dark ">
      <SearchHeader query={query} onQueryChange={setQuery} />
      <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-page pb-5">
        {!trimmedQuery && <SearchIdle />}
        {canSearch && status === "loading" && <SearchLoading />}
        {canSearch && status === "failed" && (
          <SearchError message={error} onRetry={retry} />
        )}
        {canSearch && status === "succeeded" && results.length > 0 && (
          <SearchResults query={trimmedQuery} results={results} />
        )}
        {canSearch && status === "succeeded" && results.length === 0 && (
          <div className="space-y-5">
            <SearchEmpty query={trimmedQuery} />
            <SearchIdle showRecent={false} />
          </div>
        )}
      </main>
    </div>
  );
}
