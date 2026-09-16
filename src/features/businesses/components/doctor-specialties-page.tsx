"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MobileHeader from "@/components/layout/MobileHeader";
import { useAppSelector } from "@/store/hooks";
import { getFeaturedDoctorSpecialties } from "../business.service";
import type { DoctorSpecialty } from "../business.types";

function labelFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function DoctorSpecialtiesPage({ city, locality }: { city: string; locality: string }) {
  const location = useAppSelector((state) => state.location);
  const displayCity = location.city || labelFromSlug(city);
  const displayLocality = location.locality || labelFromSlug(locality);
  const query = useQuery({
    queryKey: ["doctor-specialties", "featured"],
    queryFn: getFeaturedDoctorSpecialties,
  });
  const specialties = query.data?.results ?? [];
  const errorMessage = axios.isAxiosError(query.error)
    ? (query.error.response?.data?.detail ?? query.error.message)
    : query.error instanceof Error
      ? query.error.message
      : "Unable to load doctor specialties.";

  return (
    <div className="min-h-dvh bg-slate-50 pb-10 dark:bg-background-dark">
      <MobileHeader title="Doctors" subtitle={`Near ${displayLocality}, ${displayCity}`} />
      <main className="mx-auto w-full max-w-3xl px-page pt-5">
        {query.isPending && <SpecialtiesSkeleton />}
        {query.isError && (
          <StateMessage
            title="Couldn't load specialties"
            message={errorMessage}
            onRetry={() => void query.refetch()}
          />
        )}
        {query.isSuccess && specialties.length === 0 && (
          <StateMessage
            title="No specialties found"
            message="Doctor specialties will appear here as soon as they are available."
          />
        )}
        {specialties.length > 0 && (
          <div className="space-y-3">
            {specialties.map((specialty) => (
              <SpecialtyCard
                key={specialty.id}
                specialty={specialty}
                city={city}
                locality={locality}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SpecialtyCard({ specialty, city, locality }: { specialty: DoctorSpecialty; city: string; locality: string }) {
  const label = specialty.label || specialty.name;
  const href = `/${encodeURIComponent(city)}/${encodeURIComponent(locality)}/doctors/${encodeURIComponent(specialty.slug)}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-colors active:bg-brand-50 dark:border-border-dark-subtle dark:bg-surface-dark dark:active:bg-brand-950"
    >
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand dark:bg-brand-950 dark:text-brand-300">
        {specialty.image ? (
          <Image src={specialty.image} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <i className="fa-solid fa-user-doctor text-xl" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-extrabold text-foreground dark:text-foreground-dark">
          {label}
        </span>
        {specialty.body_part && (
          <span className="mt-0.5 block truncate text-xs font-semibold text-foreground-muted dark:text-foreground-dark-muted">
            {specialty.body_part}
          </span>
        )}
      </span>
      <i className="fa-solid fa-chevron-right shrink-0 text-xs text-foreground-subtle dark:text-foreground-dark-subtle" aria-hidden="true" />
    </Link>
  );
}

function SpecialtiesSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 rounded-2xl bg-white p-3 dark:bg-surface-dark">
          <span className="size-14 rounded-xl bg-slate-100 dark:bg-surface-dark-tertiary" />
          <span className="min-w-0 flex-1">
            <span className="block h-4 w-2/3 rounded bg-slate-100 dark:bg-surface-dark-tertiary" />
            <span className="mt-2 block h-3 w-1/3 rounded bg-slate-100 dark:bg-surface-dark-tertiary" />
          </span>
        </div>
      ))}
    </div>
  );
}

function StateMessage({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-8 text-center dark:border-border-dark-subtle dark:bg-surface-dark">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-950 dark:text-brand-300">
        <i className="fa-solid fa-user-doctor" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-sm font-extrabold text-foreground dark:text-foreground-dark">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-foreground-muted dark:text-foreground-dark-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
      )}
    </section>
  );
}
