"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import MobileHeader from "@/components/layout/MobileHeader";
import { LocationButton } from "@/features/location";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppSelector } from "@/store/hooks";
import { getDoctors } from "../business.service";
import type { DoctorListItem } from "../business.types";

function labelFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function digits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function DoctorListPage({ specialtySlug }: { city: string; locality: string; specialtySlug: string }) {
  const hydrated = useHydrated();
  const { lat, lng, locality, city } = useAppSelector((state) => state.location);
  const query = useInfiniteQuery({
    queryKey: ["doctors", specialtySlug, lat, lng],
    queryFn: ({ pageParam }) => getDoctors({ lat: lat!, lng: lng!, specialty: specialtySlug, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (page) => page.pagination.has_next ? page.pagination.page + 1 : undefined,
    enabled: hydrated && lat !== null && lng !== null,
  });
  const doctors = useMemo(() => query.data?.pages.flatMap((page) => page.results) ?? [], [query.data]);
  const specialtyLabel = query.data?.pages[0]?.specialty?.label || labelFromSlug(specialtySlug);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    }, { rootMargin: "300px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [query]);

  const error = axios.isAxiosError(query.error) ? query.error.response?.data?.detail ?? query.error.message : "Unable to load doctors.";

  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={specialtyLabel} subtitle={locality && city ? `Near ${locality}, ${city}` : "Doctors near you"} /><main className="mx-auto w-full max-w-3xl px-page pt-5">{!hydrated ? <DoctorSkeleton /> : lat === null || lng === null ? <LocationPrompt /> : query.isPending ? <DoctorSkeleton /> : query.isError ? <div role="alert" className="rounded-2xl bg-red-50 p-5 text-center text-sm text-danger"><p>{String(error)}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 font-extrabold underline">Try again</button></div> : doctors.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><i className="fa-solid fa-user-doctor text-2xl text-brand" /><h2 className="mt-3 text-sm font-extrabold">No doctors found</h2><p className="mt-1 text-xs text-foreground-muted">Try another specialty or location.</p></div> : <div className="space-y-4">{doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}</div>}<div ref={loadMoreRef} className="flex h-20 items-center justify-center" aria-live="polite">{query.isFetchingNextPage && <><LoaderCircle size={20} className="animate-spin text-brand" /><span className="ml-2 text-sm font-semibold text-foreground-muted">Loading more</span></>}{!query.hasNextPage && doctors.length > 0 && <span className="text-xs font-semibold text-foreground-subtle">You&apos;ve reached the end</span>}</div></main></div>;
}

function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const business = doctor.business;
  const doctorHref = `/doctors/${encodeURIComponent(doctor.slug)}`;
  const address = [business.address.address, business.address.landmark, business.address.locality, business.city.name, business.address.postal_code].filter(Boolean).join(", ");
  const directionsHref = business.address.latitude !== null && business.address.longitude !== null ? `https://www.google.com/maps/dir/?api=1&destination=${business.address.latitude},${business.address.longitude}` : undefined;
  const specialtyText = doctor.specialties.map((specialty) => specialty.name || specialty.label).join(" | ");
  return <article className="relative rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_3px_12px_rgba(15,23,42,0.05)]"><Link href={doctorHref} className="absolute inset-0 rounded-2xl" aria-label={`View ${doctor.name}`} /><div className="pointer-events-none relative z-0 flex items-start gap-2.5"><span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand"><i className="fa-solid fa-user-doctor text-xl" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="min-w-0 text-base font-extrabold text-foreground">{doctor.name}</h2>{doctor.consultation_fee && <span className="shrink-0 text-xs font-extrabold text-brand">{formatCurrency(doctor.consultation_fee)}</span>}</div><p className="mt-0.5 truncate text-xs font-semibold text-foreground-muted">{specialtyText}</p><p className="mt-0.5 truncate text-xs text-foreground-muted">{doctor.qualification}</p>{doctor.schedule.next_available && <p className={`mt-1.5 text-xs font-bold ${doctor.schedule.is_available ? "text-emerald-600" : "text-yellow-600"}`}><i className="fa-solid fa-calendar-check mr-1" />{doctor.schedule.next_available}</p>}</div></div><section className="relative z-10 mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5"><Link href={`/${encodeURIComponent(business.slug)}`} className="flex min-w-0 items-center gap-2.5"><span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-100 text-brand">{business.cover_image ? <Image src={business.cover_image} alt="" fill sizes="40px" className="object-cover" /> : <i className="fa-solid fa-store" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{business.name}</span><span className="mt-0.5 block truncate text-xs text-foreground-muted"><i className="fa-solid fa-location-dot mr-1 text-brand" />{address}</span></span><i className="fa-solid fa-chevron-right text-xs text-foreground-subtle" /></Link><div className="mt-2.5 grid grid-cols-3 gap-1.5"><Action href={business.contact.phone ? `tel:${business.contact.phone}` : undefined} icon="fa-phone" label="Call" /><Action href={business.contact.whatsapp ? `https://wa.me/${digits(business.contact.whatsapp)}` : undefined} icon="fa-whatsapp" label="WhatsApp" brand external /><Action href={directionsHref} icon="fa-diamond-turn-right" label="Direction" external /></div></section></article>;
}

function Action({ href, icon, label, brand = false, external = false }: { href?: string; icon: string; label: string; brand?: boolean; external?: boolean }) {
  const className = "flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg border border-brand-200 bg-white px-1 text-[10px] font-extrabold text-brand disabled:border-slate-200 disabled:text-slate-300";
  return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className}><i className={`${brand ? "fa-brands" : "fa-solid"} ${icon}`} /><span className="truncate">{label}</span></a> : <button type="button" disabled className={className}><i className={`${brand ? "fa-brands" : "fa-solid"} ${icon}`} /><span className="truncate">{label}</span></button>;
}

function LocationPrompt() {
  return <div className="rounded-2xl border border-slate-100 bg-white p-7 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand"><i className="fa-solid fa-location-dot" /></span><h2 className="mt-3 text-sm font-extrabold">Choose your location</h2><p className="mt-1 text-xs text-foreground-muted">Select an area to discover doctors near you.</p><LocationButton className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Choose location</LocationButton></div>;
}

function DoctorSkeleton() {
  return <div className="space-y-4">{[0, 1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-white" />)}</div>;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}
