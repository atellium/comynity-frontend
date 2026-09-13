"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSearchResults, selectSearchResult } from "../location.slice";
import { detectCurrentLocation, searchLocations } from "../location.thunks";

const MINIMUM_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 400;

function LocationResultsSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col px-4"
      aria-label="Loading locations"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-3.5 py-4">
          <div className="size-9 shrink-0 rounded-full bg-slate-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-2/5 rounded bg-slate-100" />
            <div className="h-2.5 w-3/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LocationModal() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, searchStatus, currentLocationStatus, error } =
    useAppSelector((state) => state.location);
  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  useEffect(() => {
    if (trimmedQuery.length < MINIMUM_SEARCH_LENGTH) {
      dispatch(clearSearchResults());
      return;
    }

    const timeout = window.setTimeout(() => {
      dispatch(searchLocations(trimmedQuery));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [dispatch, trimmedQuery]);

  return (
    <div className="flex min-h-[80dvh] flex-col bg-slate-50 pt-2 pb-8">
      {/* 1. Header Area */}
      <div className="px-page pt-2 pb-2">
        <h2 className="text-[20px] font-black tracking-tight text-slate-900">
          Find your location
        </h2>
        <p className="mt-1 text-[13px] font-medium text-slate-500">
          Search for your area or use your device&apos;s location.
        </p>
      </div>

      {/* 2. Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-slate-50 px-page pt-2 pb-4">
        <label className="group flex h-14 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all">
          <span className="sr-only">Search locations</span>
          <div className="flex w-12 items-center justify-center">
            <i
              className="fa-solid fa-magnifying-glass text-[15px] text-slate-400 transition-colors group-focus-within:text-brand"
              aria-hidden="true"
            />
          </div>
          <input
            type="search"
            placeholder="Search for area, street name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-full flex-1 bg-transparent pr-4 text-[15px] font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
            autoComplete="off"
          />
        </label>

        {/* {isSearching && trimmedQuery.length < MINIMUM_SEARCH_LENGTH && (
					<p className="mt-2 px-2 text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
						<i className="fa-solid fa-circle-info text-[10px]" />
						Enter at least {MINIMUM_SEARCH_LENGTH} characters to search.
					</p>
				)} */}
      </div>

      {/* 3. Main Content Area */}
      <main className="flex flex-1 flex-col px-page">
        {/* Detect Current Location Button (Only visible when not searching) */}
        {!isSearching && (
          <div className="mb-4">
            <button
              type="button"
              disabled={currentLocationStatus === "loading"}
              onClick={() => dispatch(detectCurrentLocation())}
              className="flex min-h-16 w-full items-center justify-start gap-3 rounded-xl bg-brand px-4 py-3 text-left text-white shadow-xs transition-colors hover:bg-brand-800 disabled:cursor-wait disabled:opacity-70"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                {currentLocationStatus === "loading" ? (
                  <i
                    className="fa-solid fa-circle-notch animate-spin text-[16px]"
                    aria-hidden="true"
                  />
                ) : (
                  <i
                    className="fa-solid fa-location-crosshairs text-[16px]"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className="text-[14px] font-extrabold tracking-wide">
                  {currentLocationStatus === "loading"
                    ? "Detecting location..."
                    : "Use current location"}
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-white/80">
                  Get better nearby results and suggestions.
                </span>
              </span>
              <i
                className="fa-solid fa-chevron-right ml-auto shrink-0 text-xs text-white/80"
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Global Error Banner (Moved below the button) */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 shadow-xs animate-in fade-in zoom-in-95">
            <i
              className="fa-solid fa-circle-exclamation mt-0.5 text-[14px] text-red-500"
              aria-hidden="true"
            />
            <p
              role="alert"
              className="flex-1 wrap-break-word text-[12px] font-bold leading-snug text-red-700"
            >
              {error}
            </p>
          </div>
        )}

        {/* Search Results Area */}
        {isSearching && (
          <div className="flex flex-col">
            {searchStatus === "succeeded" && searchResults.length === 0 && (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-xs">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <i
                    className="fa-solid fa-map-location-dot text-[20px]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-[14px] font-bold text-slate-900">
                  No locations found
                </p>
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  Try adjusting your search terms.
                </p>
              </div>
            )}

            {/* Search Results List Card */}
            {(searchStatus === "loading" ||
              (searchStatus === "succeeded" && searchResults.length > 0)) && (
              <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xs">
                {searchStatus === "loading" && <LocationResultsSkeleton />}

                {searchStatus === "succeeded" &&
                  searchResults.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => dispatch(selectSearchResult(location))}
                      className="group flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:text-slate-400">
                          <i
                            className="fa-solid fa-location-dot text-[13px]"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="flex min-w-0 flex-col items-start">
                          <span className="w-full truncate text-[14px] font-bold text-slate-900">
                            {location.name}
                          </span>
                          <span className="mt-px w-full truncate text-[12px] font-medium text-slate-500">
                            {location.city}
                          </span>
                        </div>
                      </div>

                      <i
                        className="fa-solid fa-chevron-right ml-3 shrink-0 text-[10px] text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default LocationModal;
