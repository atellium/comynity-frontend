"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Share2 } from "lucide-react";
import { BottomSheetModal } from "@/components/modals";
import { SaveButton } from "@/features/saved-items";
import { getDoctorBySlug } from "../business.service";
import type { DoctorListItem } from "../business.types";

function digits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function formatCurrency(value: string | null) {
  if (!value) return "";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}

function formatTime(value: string) {
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  if (!Number.isFinite(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}${minute === "00" ? "" : `:${minute}`} ${period}`;
}

export function DoctorDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const query = useQuery({ queryKey: ["doctor", "detail", slug], queryFn: () => getDoctorBySlug(slug) });
  const error = axios.isAxiosError(query.error) ? String(query.error.response?.data?.detail ?? query.error.message) : query.error instanceof Error ? query.error.message : "Unable to load this doctor.";

  async function shareDoctor(doctor: DoctorListItem) {
    const url = window.location.href;
    const text = `Check out ${doctor.name} on Comynity:\n${url}`;
    if (window.matchMedia("(max-width: 767px)").matches && navigator.share) {
      try {
        await navigator.share({ title: doctor.name, text });
        return;
      } catch (shareError) {
        if (!(shareError instanceof DOMException && shareError.name === "AbortError")) throw shareError;
      }
    }
    setShareUrl(url);
    setCopied(false);
    setShareOpen(true);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (query.isPending) return <DoctorDetailSkeleton />;
  if (query.isError) return <div className="min-h-dvh bg-white"><button type="button" onClick={() => router.back()} className="m-3 flex size-10 items-center justify-center text-brand" aria-label="Go back"><ArrowLeft size={24} /></button><section className="px-page py-20 text-center"><i className="fa-solid fa-user-doctor text-4xl text-foreground-subtle" /><h1 className="mt-4 text-lg font-extrabold">Couldn&apos;t load doctor</h1><p className="mt-2 text-sm text-foreground-muted">{error}</p><button type="button" onClick={() => void query.refetch()} className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Try again</button></section></div>;

  const doctor = query.data;
  const business = doctor.business;
  const address = [business.address.address, business.address.landmark, business.address.locality, business.city.name, business.address.postal_code].filter(Boolean).join(", ");
  const phone = business.contact.phone;
  const whatsapp = business.contact.whatsapp;
  const directionsHref = business.address.latitude !== null && business.address.longitude !== null ? `https://www.google.com/maps/dir/?api=1&destination=${business.address.latitude},${business.address.longitude}` : undefined;

  return <div className="min-h-dvh bg-white pb-28"><main className="mx-auto max-w-3xl"><header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 px-page pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur"><div className="flex items-center justify-between"><button type="button" onClick={() => router.back()} className="flex size-10 items-center justify-center rounded-full text-foreground" aria-label="Go back"><ArrowLeft size={22} /></button><div className="flex gap-1"><button type="button" onClick={() => void shareDoctor(doctor)} className="flex size-10 items-center justify-center rounded-full text-foreground" aria-label="Share doctor"><Share2 size={19} /></button><SaveButton itemType="doctor" objectId={doctor.id} className="flex size-10 items-center justify-center rounded-full text-brand" /></div></div></header><section className="px-page py-6"><div className="flex items-start gap-4"><span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand"><i className="fa-solid fa-user-doctor text-2xl" /></span><div className="min-w-0 flex-1"><h1 className="text-2xl font-black leading-tight text-foreground">{doctor.name}</h1><p className="mt-1 text-sm font-semibold text-foreground-muted">{doctor.specialties.map((specialty) => specialty.name || specialty.label).join(" | ")}</p><p className="mt-1 text-sm text-foreground-muted">{doctor.qualification}</p>{doctor.consultation_fee && <p className="mt-3 text-sm font-extrabold text-brand">{formatCurrency(doctor.consultation_fee)}</p>}</div></div>{doctor.bio && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-foreground-muted">{doctor.bio}</p>}{doctor.schedule.next_available && <p className={`mt-5 text-sm font-bold ${doctor.schedule.is_available ? "text-emerald-600" : "text-yellow-600"}`}><i className="fa-solid fa-calendar-check mr-2" />{doctor.schedule.next_available}</p>}</section><ScheduleSection doctor={doctor} /><section className="border-t border-slate-100 px-page py-5"><h2 className="mb-3 text-base font-extrabold">Clinic information</h2><Link href={`/${encodeURIComponent(business.slug)}`} className="flex items-center gap-3 py-1"><span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-100 text-brand">{business.cover_image ? <Image src={business.cover_image} alt="" fill sizes="48px" className="object-cover" /> : <i className="fa-solid fa-store" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{business.name}</span><span className="mt-1 block text-xs leading-5 text-foreground-muted"><i className="fa-solid fa-location-dot mr-1 text-brand" />{address}</span></span><i className="fa-solid fa-chevron-right text-xs text-foreground-subtle" /></Link></section><InfoGrid doctor={doctor} /></main><div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white/95 px-page pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur"><div className="mx-auto grid max-w-3xl grid-cols-3 gap-2"><FixedAction href={phone ? `tel:${phone}` : undefined} label="Call" icon="fa-phone" /><FixedAction href={whatsapp ? `https://wa.me/${digits(whatsapp)}` : undefined} label="WhatsApp" icon="fa-whatsapp" brand external /><FixedAction href={directionsHref} label="Direction" icon="fa-diamond-turn-right" external /></div></div><BottomSheetModal open={shareOpen} onClose={() => setShareOpen(false)} title={`Share ${doctor.name}`} closeLabel="Close share options"><div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6"><h2 className="text-xl font-extrabold">Share this doctor</h2><div className="mt-6 flex items-start justify-center gap-10"><a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${doctor.name} on Comynity:\n${shareUrl}`)}`} target="_blank" rel="noreferrer" className="group flex w-16 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600"><i className="fa-brands fa-whatsapp" /></span><span className="text-[11px] font-semibold">WhatsApp</span></a><button type="button" onClick={copyShareLink} className="group flex w-16 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-lg text-brand"><i className={`fa-solid ${copied ? "fa-check" : "fa-link"}`} /></span><span className="text-[11px] font-semibold">{copied ? "Copied" : "Copy link"}</span></button></div></div></BottomSheetModal></div>;
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-slate-100 px-page py-5"><h2 className="mb-3 text-base font-extrabold">{title}</h2>{children}</section>;
}

function InfoGrid({ doctor }: { doctor: DoctorListItem }) {
  const items = [
    ["Registration", [doctor.registration_number, doctor.registration_council, doctor.registration_year].filter(Boolean).join(", ")],
    ["Languages", doctor.languages.join(", ")],
    ["Treatments", doctor.treatments.join(", ")],
  ].filter(([, value]) => value);
  if (items.length === 0) return null;
  return <InfoSection title="Other details"><dl className="divide-y divide-slate-100">{items.map(([label, value]) => <div key={label} className="py-3 first:pt-0 last:pb-0"><dt className="text-xs font-semibold text-foreground-muted">{label}</dt><dd className="mt-1 text-sm font-bold capitalize text-foreground">{value}</dd></div>)}</dl></InfoSection>;
}

function ScheduleSection({ doctor }: { doctor: DoctorListItem }) {
  if (doctor.schedule.full_schedule.length === 0) return null;
  return <InfoSection title="Schedule"><div className="divide-y divide-slate-100">{doctor.schedule.full_schedule.map((item, index) => <div key={`${item.schedule_type}-${index}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 text-sm"><span className="font-bold">{item.schedule_label || item.schedule_type.replace(/_/g, " ")}</span><span className="shrink-0 font-semibold text-foreground-muted">{formatTime(item.start_time)} - {formatTime(item.end_time)}</span></div>)}</div></InfoSection>;
}

function FixedAction({ href, icon, label, brand = false, external = false }: { href?: string; icon: string; label: string; brand?: boolean; external?: boolean }) {
  const className = "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-brand text-xs font-extrabold text-white disabled:bg-slate-200";
  return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className}><i className={`${brand ? "fa-brands" : "fa-solid"} ${icon}`} />{label}</a> : <button type="button" disabled className={className}><i className={`${brand ? "fa-brands" : "fa-solid"} ${icon}`} />{label}</button>;
}

function DoctorDetailSkeleton() {
  return <div className="min-h-dvh animate-pulse bg-white"><div className="h-52 bg-slate-50" /><div className="space-y-4 px-page py-5"><div className="h-5 w-2/3 rounded bg-slate-100" /><div className="h-20 rounded-xl bg-slate-100" /><div className="h-36 rounded-xl bg-slate-100" /></div></div>;
}
