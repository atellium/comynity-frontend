"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { compressImage } from "@/lib/compress-image";
import { createBusinessOffer, getBusinessOffers, getOwnedBusinessInfo, updateBusinessOffer, uploadBusinessOfferImage } from "../profile.service";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-brand";

export function BusinessOfferEditorScreen({ businessSlug, offerId }: { businessSlug: string; offerId?: string }) {
  const editing = Boolean(offerId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const createdOfferIdRef = useRef<string | null>(null);
  const business = useQuery({ queryKey: ["businesses", "mine", businessSlug], queryFn: () => getOwnedBusinessInfo(businessSlug) });
  const offers = useQuery({ queryKey: ["business-offers", businessSlug], queryFn: () => getBusinessOffers(businessSlug), enabled: editing });
  const offer = offers.data?.find((item) => item.id === offerId);
  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [terms, setTerms] = useState<string[]>([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!offer || initialized) return;
    queueMicrotask(() => {
      setTitle(offer.title); setDescription(offer.description ?? ""); setStartsAt(toDateInput(offer.starts_at));
      setExpiresAt(toDateInput(offer.expires_at)); setActive(offer.is_active); setTerms(offer.terms.length ? offer.terms : [""]); setInitialized(true);
    });
  }, [initialized, offer]);
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const save = useMutation({ mutationFn: async (payload: FormData) => {
    const existingOfferId = offerId ?? createdOfferIdRef.current;
    const savedOffer = existingOfferId ? await updateBusinessOffer(businessSlug, existingOfferId, payload) : await createBusinessOffer(businessSlug, payload);
    createdOfferIdRef.current = savedOffer.id;
    if (imageFile) await uploadBusinessOfferImage(businessSlug, savedOffer.id, imageFile);
    return savedOffer;
  }, onSuccess: async () => { setIsRedirecting(true); await queryClient.invalidateQueries({ queryKey: ["business-offers", businessSlug] }); router.replace(`/business/${encodeURIComponent(businessSlug)}/manage/offers`); }, onError: () => { setIsRedirecting(false); setError("Unable to save the offer. Please check the form and try again."); } });
  const isBusy = save.isPending || preparingImage || isRedirecting;

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]; event.target.value = ""; if (!selected) return;
    setPreparingImage(true); setError(null);
    try {
      const compressed = await compressImage(selected, { maxWidth: 1024, quality: 0.95 });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(compressed); setImagePreview(URL.createObjectURL(compressed));
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Unable to prepare the selected image.");
    } finally { setPreparingImage(false); }
  }

  function clearSelectedImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null); setImagePreview(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault(); setError(null);
    if (isBusy) return;
    if (!title.trim() || !startsAt || !expiresAt) return setError("Title, start date and expiry date are required.");
    if (expiresAt < startsAt) return setError("End date cannot be before the start date.");
    const payload = new FormData();
    payload.append("title", title.trim()); payload.append("description", description.trim());
    payload.append("starts_at", new Date(`${startsAt}T00:00:00`).toISOString()); payload.append("expires_at", new Date(`${expiresAt}T23:59:59.999`).toISOString());
    payload.append("is_active", String(active)); payload.append("terms", JSON.stringify(terms.map((term) => term.trim()).filter(Boolean)));
    save.mutate(payload);
  }

  if (editing && offers.isPending) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Offer" subtitle={business.data?.name ?? "Loading business…"} /><p className="py-12 text-center text-sm text-foreground-muted">Loading offer…</p></div>;
  if (editing && offers.data && !offer) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Offer" subtitle={business.data?.name} /><p className="py-12 text-center text-sm font-semibold text-danger">Offer not found.</p></div>;

  const imageSource = imagePreview || offer?.image;
  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={editing ? "Edit Offer" : "Add Offer"} subtitle={business.data?.name ?? "Loading business…"} /><form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 px-page pt-5">
    <FormCard title="Offer information"><div><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-bold">Image</span>{imageSource && <button type="button" onClick={() => imageInputRef.current?.click()} disabled={preparingImage} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand disabled:opacity-50"><i className="fa-solid fa-pen mr-1" aria-hidden="true" />Edit</button>}</div>{imageSource ? <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100"><img src={imageSource} alt="Offer preview" className="size-full object-cover" />{imagePreview && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-extrabold text-white">New</span>}</div> : <button type="button" onClick={() => imageInputRef.current?.click()} disabled={preparingImage} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 text-brand disabled:opacity-50"><i className={`fa-solid ${preparingImage ? "fa-circle-notch fa-spin" : "fa-image"} text-2xl`} aria-hidden="true" /><span className="mt-2 text-xs font-extrabold">Select offer image</span></button>}<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void selectImage(event)} className="sr-only" />{imageFile && <button type="button" onClick={clearSelectedImage} className="mt-2 text-xs font-bold text-foreground-muted underline">Cancel new image</button>}</div><Field label="Title"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter offer title" required className={inputClass} /></Field><Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the offer" rows={4} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <FormCard title="Schedule"><Field label="Start date"><input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required className={inputClass} /></Field><Field label="End date"><input type="date" value={expiresAt} min={startsAt || undefined} onChange={(event) => setExpiresAt(event.target.value)} required className={inputClass} /></Field><Toggle label="Active" checked={active} onChange={setActive} /></FormCard>
    <FormCard title="Terms">{terms.map((term, index) => <div key={index} className="flex gap-2"><input value={term} onChange={(event) => setTerms(terms.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Enter term ${index + 1}`} className={inputClass} />{terms.length > 1 && <button type="button" aria-label={`Remove term ${index + 1}`} onClick={() => setTerms(terms.filter((_, itemIndex) => itemIndex !== index))} className="size-11 shrink-0 rounded-xl bg-red-50 text-danger"><i className="fa-solid fa-xmark" /></button>}</div>)}<button type="button" onClick={() => setTerms([...terms, ""])} disabled={!terms.at(-1)?.trim()} className="text-xs font-extrabold text-brand disabled:opacity-40"><i className="fa-solid fa-plus mr-1" />Add term</button></FormCard>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}<button type="submit" disabled={isBusy} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Saving..." : editing ? "Update offer" : "Add offer"}</button>
  </form></div>;
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4"><h2 className="text-sm font-extrabold">{title}</h2>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
function toDateInput(value: string) { const date = new Date(value); if (Number.isNaN(date.getTime())) return ""; const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }

