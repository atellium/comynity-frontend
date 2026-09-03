"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { getOwnedBusinessInfo, updateOwnedBusiness } from "../profile.service";
import type { OwnedBusinessInfo } from "../profile.types";
import { BusinessInfoEditor, type BusinessInfoSection } from "./business-info-editor";
import { BusinessGalleryEditor } from "./business-gallery-editor";
import { BusinessThumbnailCard } from "./business-thumbnail-card";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function BusinessInfoScreen({ slug }: { slug: string }) {
  const [editing, setEditing] = useState<BusinessInfoSection | "gallery" | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["businesses", "mine", slug], queryFn: () => getOwnedBusinessInfo(slug) });
  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title="Business Information" subtitle={query.data?.name ?? "Loading business…"} /><main className="mx-auto w-full max-w-3xl px-page pt-5">{query.isPending && <InfoSkeleton />}{query.isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-danger"><p className="font-semibold">Couldn&apos;t load business information.</p><button type="button" onClick={() => void query.refetch()} className="mt-2 font-extrabold underline">Try again</button></div>}{query.data && <BusinessInfoCards business={query.data} onEdit={setEditing} onBusinessSaved={(updated) => queryClient.setQueryData(["businesses", "mine", slug], updated)} />}</main>{query.data && editing === "gallery" && <BusinessGalleryEditor businessSlug={slug} businessName={query.data.name} onClose={() => setEditing(null)} onSaved={() => void query.refetch()} />}{query.data && editing && editing !== "gallery" && <BusinessInfoEditor key={editing} section={editing} business={query.data} onClose={() => setEditing(null)} onSaved={(updated) => queryClient.setQueryData(["businesses", "mine", slug], updated)} />}</div>;
}

function BusinessInfoCards({ business, onEdit, onBusinessSaved }: { business: OwnedBusinessInfo; onEdit: (section: BusinessInfoSection | "gallery") => void; onBusinessSaved: (business: OwnedBusinessInfo) => void }) {
  const city = typeof business.location.city === "string" ? business.location.city : business.location.city.name;
  const state = typeof business.location.city === "string" ? business.location.state : business.location.city.state;
  const socials = ["facebook", "instagram", "youtube", "linkedin", "x"].flatMap((network) => {
    const url = business.contact.social_urls?.[network];
    return url ? [[network, url] as const] : [];
  });
  const gallery = business.media.gallery.filter((image): image is string => Boolean(image));
  return <div className="space-y-4">
    <BusinessStatusToggle business={business} onSaved={onBusinessSaved} />
    <InfoCard title="Basic information" icon="fa-building" onEdit={() => onEdit("basic")}><InfoRow label="Name" value={business.name} /><InfoRow label="Description" value={business.description} multiline /><InfoRow label="Established" value={business.established_year} /></InfoCard>
    <InfoCard title="Categories" icon="fa-grid-2" onEdit={() => onEdit("categories")}><InfoRow label="Business categories" value={business.categories?.map((category) => category.display_name).join(", ")} /></InfoCard>
    <InfoCard title="Address" icon="fa-location-dot" onEdit={() => onEdit("address")}><InfoRow label="Address" value={business.location.address} /><InfoRow label="Landmark" value={business.location.landmark} /><InfoRow label="Locality" value={business.location.locality} /><InfoRow label="City" value={city} /><InfoRow label="State" value={state} /><InfoRow label="Postal code" value={business.location.postal_code} /><InfoRow label="Show full address" value={yesNo(business.visibility.display_full_address)} /></InfoCard>
    <InfoCard title="Contact information" icon="fa-address-book" onEdit={() => onEdit("contact")}><InfoRow label="Phone" value={business.contact.phone} /><InfoRow label="WhatsApp" value={business.contact.whatsapp} /><InfoRow label="Other numbers" value={business.contact.alternate_numbers?.join(", ")} /><InfoRow label="Email" value={business.contact.email} /><InfoRow label="Website" value={business.contact.website} /></InfoCard>
    <InfoCard title="Social media" icon="fa-share-nodes" onEdit={() => onEdit("social")} >{socials.length ? socials.map(([network, url]) => <InfoRow key={network} label={humanize(network)} value={url} />) : <InfoRow label="Profiles" value={null} />}</InfoCard>
    <InfoCard title="Business hours" icon="fa-clock" onEdit={() => onEdit("hours")}><InfoRow label="Show business hours" value={yesNo(business.visibility.display_business_hours)} />{days.map((day) => <InfoRow key={day} label={humanize(day)} value={formatSlots(business.hours?.schedule[day])} />)}</InfoCard>
    <BusinessThumbnailCard business={business} onSaved={onBusinessSaved} />
    <InfoCard title="Gallery" icon="fa-images" onEdit={() => onEdit("gallery")} >{gallery.length ? <div className="grid grid-cols-3 gap-2 pt-3">{gallery.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"><Image src={image} alt={`${business.name} gallery image ${index + 1}`} fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover" /></div>)}</div> : <p className="pt-3 text-sm text-foreground-muted">No gallery images added</p>}</InfoCard>
    <InfoCard title="Search information" icon="fa-magnifying-glass" onEdit={() => onEdit("seo")}><InfoRow label="Page title" value={business.seo.title} /><InfoRow label="Description" value={business.seo.description} multiline /><InfoRow label="Keywords" value={business.seo.keywords} /></InfoCard>
    <InfoCard title="Listing status" icon="fa-circle-check"><InfoRow label="Publication" value={humanize(business.publication_status)} /><InfoRow label="Active" value={yesNo(business.is_active)} /><InfoRow label="Verified" value={yesNo(business.is_verified)} /><InfoRow label="Last updated" value={formatDate(business.last_updated)} /></InfoCard>
    <InfoCard title="Record information" icon="fa-calendar"><InfoRow label="Created" value={formatDate(business.metadata.created_at)} /><InfoRow label="Updated" value={formatDate(business.metadata.updated_at)} /></InfoCard>
  </div>;
}

function BusinessStatusToggle({ business, onSaved }: { business: OwnedBusinessInfo; onSaved: (business: OwnedBusinessInfo) => void }) {
  const mutation = useMutation({
    mutationFn: (isActive: boolean) => updateOwnedBusiness(business.slug, { is_active: isActive }),
    onSuccess: onSaved,
  });
  const nextActive = mutation.isPending ? (mutation.variables ?? business.is_active) : business.is_active;

  return <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
    <div><h2 className="text-sm font-extrabold text-foreground">Business status</h2><p className={`mt-1 text-xs font-semibold ${mutation.isError ? "text-danger" : "text-foreground-muted"}`}>{mutation.isError ? "Couldn’t update business status" : nextActive ? "Your business is active" : "Your business is inactive"}</p></div>
    <label className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${nextActive ? "bg-brand" : "bg-slate-200"}`}>
      <input type="checkbox" checked={nextActive} disabled={mutation.isPending} onChange={(event) => mutation.mutate(event.target.checked)} className="peer sr-only" aria-label={nextActive ? "Deactivate business" : "Activate business"} />
      <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${nextActive ? "left-6" : "left-1"}`} />
    </label>
  </section>;
}

function InfoCard({ title, icon, children, onEdit }: { title: string; icon: string; children: React.ReactNode; onEdit?: () => void }) { return <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-extrabold"><i className={`fa-solid ${icon} text-brand`} />{title}</h2>{onEdit && <button type="button" onClick={onEdit} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand"><i className="fa-solid fa-pen mr-1" />Edit</button>}</div><dl className="mt-3 divide-y divide-slate-100">{children}</dl></section>; }
function InfoRow({ label, value, multiline = false }: { label: string; value: string | number | null | undefined; multiline?: boolean }) { return <div className={`${multiline ? "block" : "flex items-start justify-between gap-4"} py-2.5 first:pt-0 last:pb-0`}><dt className="text-xs font-semibold text-foreground-muted">{label}</dt><dd className={`${multiline ? "mt-1" : "max-w-[65%] text-right"} break-words text-xs font-bold`}>{value === null || value === undefined || value === "" ? "Not provided" : value}</dd></div>; }
function formatSlots(slots?: Array<{ opens_at: string; closes_at: string }>) { return slots?.length ? slots.map((slot) => `${formatTime(slot.opens_at)} – ${formatTime(slot.closes_at)}`).join(", ") : "Closed"; }
function formatTime(value: string) { const [hours, minutes] = value.split(":").map(Number); return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes))); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date); }
function humanize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function yesNo(value: boolean) { return value ? "Yes" : "No"; }
function InfoSkeleton() { return <div className="space-y-4">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>; }
