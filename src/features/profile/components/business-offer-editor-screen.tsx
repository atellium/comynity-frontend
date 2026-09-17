"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { createBusinessOffer, getBusinessOffers, getOwnedBusinessInfo, updateBusinessOffer } from "../profile.service";
import type { BusinessOfferPayload } from "../offer.types";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-brand";

export function BusinessOfferEditorScreen({ businessSlug, offerId }: { businessSlug: string; offerId?: string }) {
  const editing = Boolean(offerId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const business = useQuery({ queryKey: ["businesses", "mine", businessSlug], queryFn: () => getOwnedBusinessInfo(businessSlug) });
  const offers = useQuery({ queryKey: ["business-offers", businessSlug], queryFn: () => getBusinessOffers(businessSlug), enabled: editing });
  const offer = offers.data?.find((item) => item.id === offerId);
  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allTime, setAllTime] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [terms, setTerms] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!offer || initialized) return;
    queueMicrotask(() => {
      setTitle(offer.title);
      setDescription(offer.description ?? "");
      setAllTime(offer.is_all_time);
      setStartsAt(toDateInput(offer.starts_at));
      setExpiresAt(toDateInput(offer.expires_at));
      setActive(offer.is_active);
      setSortOrder(offer.sort_order ?? 0);
      setTerms(offer.terms.length ? offer.terms : [""]);
      setInitialized(true);
    });
  }, [initialized, offer]);

  const save = useMutation({
    mutationFn: (payload: BusinessOfferPayload) => offerId ? updateBusinessOffer(businessSlug, offerId, payload) : createBusinessOffer(businessSlug, payload),
    onSuccess: async () => {
      setIsRedirecting(true);
      await queryClient.invalidateQueries({ queryKey: ["business-offers", businessSlug] });
      router.replace(`/business/${encodeURIComponent(businessSlug)}/manage/offers`);
    },
    onError: () => {
      setIsRedirecting(false);
      setError("Unable to save the offer. Please check the form and try again.");
    },
  });
  const isBusy = save.isPending || isRedirecting;

  function changeSortOrder(delta: number) {
    setSortOrder((value) => Math.max(0, value + delta));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (isBusy) return;
    if (!title.trim()) return setError("Title is required.");
    if (!allTime && (!startsAt || !expiresAt)) return setError("Start date and expiry date are required.");
    if (!allTime && expiresAt < startsAt) return setError("End date cannot be before the start date.");
    const payload: BusinessOfferPayload = {
      title: title.trim(),
      description: description.trim(),
      is_all_time: allTime,
      starts_at: allTime ? null : toApiDateTime(startsAt, "start"),
      expires_at: allTime ? null : toApiDateTime(expiresAt, "end"),
      is_active: active,
      sort_order: sortOrder,
      terms: terms.map((term) => term.trim()).filter(Boolean),
    };
    save.mutate(payload);
  }

  if (editing && offers.isPending) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Offer" subtitle={business.data?.name ?? "Loading business..."} /><p className="py-12 text-center text-sm text-foreground-muted">Loading offer...</p></div>;
  if (editing && offers.data && !offer) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Offer" subtitle={business.data?.name} /><p className="py-12 text-center text-sm font-semibold text-danger">Offer not found.</p></div>;

  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={editing ? "Edit Offer" : "Add Offer"} subtitle={business.data?.name ?? "Loading business..."} /><form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 px-page pt-5">
    <FormCard title="Offer information"><Field label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter offer title" required className={inputClass} /></Field><Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the offer" rows={4} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <FormCard title="Schedule"><Toggle label="All-time offer" checked={allTime} onChange={setAllTime} />{!allTime && <><Field label="Start date"><input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required={!allTime} className={inputClass} /></Field><Field label="End date"><input type="date" value={expiresAt} min={startsAt || undefined} onChange={(event) => setExpiresAt(event.target.value)} required={!allTime} className={inputClass} /></Field></>}</FormCard>
    <FormCard title="Terms">{terms.map((term, index) => <div key={index} className="flex gap-2"><input value={term} onChange={(event) => setTerms(terms.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Enter term ${index + 1}`} className={inputClass} />{terms.length > 1 && <button type="button" aria-label={`Remove term ${index + 1}`} onClick={() => setTerms(terms.filter((_, itemIndex) => itemIndex !== index))} className="size-11 shrink-0 rounded-xl bg-red-50 text-danger"><i className="fa-solid fa-xmark" /></button>}</div>)}<button type="button" onClick={() => setTerms([...terms, ""])} disabled={!terms.at(-1)?.trim()} className="text-xs font-extrabold text-brand disabled:opacity-40"><i className="fa-solid fa-plus mr-1" />Add term</button></FormCard>
    <FormCard title="Settings"><Field label="Sort order"><div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand"><button type="button" onClick={() => changeSortOrder(-1)} disabled={sortOrder <= 0} aria-label="Decrease sort order" className="flex w-11 shrink-0 items-center justify-center border-r border-slate-100 text-foreground-muted disabled:text-slate-300"><i className="fa-solid fa-minus" aria-hidden="true" /></button><input type="number" min="0" step="1" inputMode="numeric" value={sortOrder} onChange={(event) => setSortOrder(Math.max(0, Number(event.target.value) || 0))} placeholder="Lower numbers appear first" className="min-w-0 flex-1 px-3 text-center text-sm font-normal text-foreground outline-none" /><button type="button" onClick={() => changeSortOrder(1)} aria-label="Increase sort order" className="flex w-11 shrink-0 items-center justify-center border-l border-slate-100 text-brand"><i className="fa-solid fa-plus" aria-hidden="true" /></button></div></Field><Toggle label="Active" checked={active} onChange={setActive} /></FormCard>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}<button type="submit" disabled={isBusy} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Saving..." : editing ? "Update offer" : "Add offer"}</button>
  </form></div>;
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4"><h2 className="text-sm font-extrabold">{title}</h2>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
function toDateInput(value: string | null) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }
function toApiDateTime(value: string, boundary: "start" | "end") { return `${value}T${boundary === "start" ? "00:00:00" : "23:59:59"}+05:30`; }
