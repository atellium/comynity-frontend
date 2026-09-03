"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import type { BusinessListItem } from "@/features/businesses";
import { getBusinessCityName } from "@/features/businesses/business.utils";
import { useBusinessList } from "@/features/businesses/use-business-list";
import { LocationButton } from "@/features/location";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppSelector } from "@/store/hooks";

const HOMEPAGE_BUSINESS_LIMIT = 10;

export function NearbyBusinesses() {
  const hydrated = useHydrated();
  const { lat, lng, locality, city } = useAppSelector(
    (state) => state.location,
  );
  const query = useBusinessList({
    lat: hydrated ? lat : null,
    lng: hydrated ? lng : null,
    isVerified: false,
    openNow: false,
    isFeatured: true,
  });
  const businesses =
    query.data?.pages[0]?.results.slice(0, HOMEPAGE_BUSINESS_LIMIT) ?? [];

  const errorMessage = axios.isAxiosError(query.error)
    ? (query.error.response?.data?.detail ?? query.error.message)
    : query.error instanceof Error
      ? query.error.message
      : "Unable to load nearby businesses.";

  return (
    <section
      className="mx-auto w-full max-w-5xl pb-6"
      aria-labelledby="nearby-businesses-title"
    >
      <div className="mb-4 flex items-end justify-between gap-4 px-page">
        <div className="min-w-0">
        <h2
          id="nearby-businesses-title"
          className="text-lg font-extrabold tracking-tight text-foreground "
        >
          Your nearby Comynity stores
        </h2>
        {hydrated && locality && city && (
          <p className="mt-1 truncate text-xs font-medium text-foreground-muted ">
            Popular places around {locality}, {city}
          </p>
        )}
        </div>
      </div>

      {!hydrated || lat === null || lng === null ? (
        <div className="mx-page rounded-2xl border border-border-subtle bg-surface p-6 text-center shadow-xs">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand">
            <i className="fa-solid fa-location-dot text-lg" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-extrabold text-foreground">
            Choose your location
          </p>
          <p className="mt-1 text-xs font-medium text-foreground-muted">
            Select an area to see businesses near you.
          </p>
          <LocationButton className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800">
            Choose location
          </LocationButton>
        </div>
      ) : query.isPending ? (
        <NearbyBusinessesSkeleton />
      ) : query.isError ? (
        <div className="mx-page rounded-2xl border border-border-subtle bg-surface p-6 text-center shadow-xs">
          <p className="text-sm font-extrabold text-foreground">
            Couldn&apos;t load nearby businesses
          </p>
          <p className="mt-1 text-xs font-medium text-foreground-muted">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
          >
            Try again
          </button>
        </div>
      ) : businesses.length === 0 ? (
        <div className="mx-page rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-xs">
          <i
            className="fa-solid fa-store-slash text-2xl text-foreground-subtle"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-extrabold text-foreground">
            No nearby businesses found
          </p>
          <p className="mt-1 text-xs font-medium text-foreground-muted">
            Try changing your location.
          </p>
        </div>
      ) : (
        <div
          className="hide-scrollbar flex gap-3 overflow-x-auto px-page pb-3"
          aria-label="Nearby business list"
        >
          {businesses.map((business) => (
            <NearbyBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

    </section>
  );
}

function NearbyBusinessesSkeleton() {
  return (
    <div className="hide-scrollbar flex gap-3 overflow-hidden px-page pb-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-60 w-[72vw] max-w-64 shrink-0 animate-pulse rounded-3xl border border-border-subtle bg-surface"
        />
      ))}
    </div>
  );
}

function NearbyBusinessCard({ business }: { business: BusinessListItem }) {
  const category = business.categories?.[0]?.display_name ?? "Local business";
  const cityName = getBusinessCityName(business.location.city);
  const addressParts = business.location.display_full_address === false
    ? [business.location.locality, cityName]
    : [
        business.location.address,
        business.location.landmark,
        business.location.locality,
        cityName,
        business.location.postal_code,
      ];
  const address = addressParts
    .filter(Boolean)
    .join(", ");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.location.coordinates.latitude},${business.location.coordinates.longitude}`;

  return (
    <article className="group relative flex w-[72vw] max-w-64 shrink-0 flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_3px_12px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
      <Link href={`/business/${encodeURIComponent(business.slug)}`} aria-label={`View ${business.name}`}>
        <div className="relative h-32 w-full overflow-hidden bg-surface-tertiary">
          <Image
            src={business.media.thumbnail || "/images/default.jpg"}
            alt=""
            fill
            sizes="(min-width: 768px) 288px, 78vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {business.is_verified && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-extrabold text-brand shadow-sm backdrop-blur-sm">
              <i className="fa-solid fa-badge-check" aria-hidden="true" />
              Verified
            </span>
          )}
        </div>

        <div className="p-3.5 pb-2.5">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand">{category}</p>
          <h3 className="truncate text-sm font-extrabold text-foreground transition-colors group-hover:text-brand dark:text-foreground-dark">
            {business.name}
          </h3>
          <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs leading-4 font-medium text-foreground-muted">
            <i
              className="fa-solid fa-location-dot shrink-0 text-[11px]"
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">{address}</span>
          </p>
        </div>
      </Link>

      <div className={`mt-auto grid gap-2 px-3.5 pb-3.5 ${business.location.display_full_address === false ? "grid-cols-1" : "grid-cols-2"}`}>
        {business.contact.phone ? (
          <a
            href={`tel:${business.contact.phone}`}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-2 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-md"
          >
            <i className="fa-solid fa-phone" aria-hidden="true" />
            Call
          </a>
        ) : (
          <span className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-surface-tertiary px-2 text-[11px] font-extrabold text-foreground-subtle opacity-60">
            <i className="fa-solid fa-phone" aria-hidden="true" />
            Call
          </span>
        )}
        {business.location.display_full_address !== false && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2 text-[11px] font-extrabold text-brand shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-100 hover:shadow-sm dark:border-brand-800 dark:bg-brand-950"
          >
            <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" />
            Directions
          </a>
        )}
      </div>
    </article>
  );
}
