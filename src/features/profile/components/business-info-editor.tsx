"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { FullScreenModal } from "@/components/modals";
import { searchBusinessCategories, searchBusinessCities, updateBusinessHours, updateOwnedBusiness } from "../profile.service";
import type { BusinessCategoryOption, BusinessCityOption, BusinessHoursUpdatePayload, BusinessUpdatePayload, OwnedBusinessInfo } from "../profile.types";

export type BusinessInfoSection = "basic" | "categories" | "address" | "contact" | "social" | "hours" | "seo";
const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-brand";
const scheduleDays = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;
type HoursSlot = { opens_at: string; closes_at: string };
type HoursByDay = HoursSlot[][];
type EditorSavePayload =
  | { type: "business"; payload: BusinessUpdatePayload | FormData }
  | { type: "hours"; payload: BusinessHoursUpdatePayload; showHours: boolean };

export function BusinessInfoEditor({ section, business, onClose, onSaved }: { section: BusinessInfoSection; business: OwnedBusinessInfo; onClose: () => void; onSaved: (business: OwnedBusinessInfo) => void }) {
  const cityValue = typeof business.location.city === "string" ? null : business.location.city;
  const [values, setValues] = useState<Record<string, string>>({
    name: business.name, description: business.description ?? "", established_year: String(business.established_year ?? ""),
    address: business.location.address ?? "", landmark: business.location.landmark ?? "", locality: business.location.locality, postal_code: business.location.postal_code,
    phone: localPhone(business.contact.phone), whatsapp: localPhone(business.contact.whatsapp), email: business.contact.email, website: business.contact.website,
    facebook: business.contact.social_urls?.facebook ?? "", instagram: business.contact.social_urls?.instagram ?? "", youtube: business.contact.social_urls?.youtube ?? "", linkedin: business.contact.social_urls?.linkedin ?? "", x: business.contact.social_urls?.x ?? "",
    seo_title: business.seo.title ?? "", seo_description: business.seo.description ?? "", seo_keywords: business.seo.keywords ?? "",
  });
  const [categories, setCategories] = useState<BusinessCategoryOption[]>((business.categories ?? []).filter((item) => item.id !== undefined).map((item) => ({ id: item.id!, name: item.display_name, display_name: item.display_name, label: item.display_name, slug: item.slug })));
  const [city, setCity] = useState<BusinessCityOption | null>(cityValue ? { id: cityValue.id ?? 0, name: cityValue.name, slug: "", tier: 0, state: { id: cityValue.state_id ?? 0, name: cityValue.state ?? "", slug: "", code: "" } } : null);
  const [alternateNumbers, setAlternateNumbers] = useState((business.contact.alternate_numbers ?? []).slice(0, 4).map(localPhone));
  const [fullAddress, setFullAddress] = useState(business.visibility.display_full_address); const [showHours, setShowHours] = useState(business.visibility.display_business_hours);
  const [hoursByDay, setHoursByDay] = useState<HoursByDay>(() =>
    scheduleDays.map(({ key }) =>
      (business.hours?.schedule[key] ?? []).map((slot) => ({
        opens_at: timeInputValue(slot.opens_at),
        closes_at: timeInputValue(slot.closes_at),
      })),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: async (save: EditorSavePayload) => {
    if (save.type === "hours") {
      if (save.showHours) await updateBusinessHours(business.slug, save.payload);
      return updateOwnedBusiness(business.slug, { display_business_hours: save.showHours });
    }
    return updateOwnedBusiness(business.slug, save.payload);
  }, onSuccess: (updated) => { onSaved(updated); onClose(); }, onError: () => setError("Unable to update business information.") });
  const field = (key: string, label: string, type = "text") => <label className="block text-xs font-bold"><span className="mb-1.5 block">{label}</span><input type={type} value={values[key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} className={inputClass} /></label>;
  const phoneField = (key: "phone" | "whatsapp", label: string) => <label className="block text-xs font-bold"><span className="mb-1.5 block">{label}</span><div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand"><span className="flex items-center border-r border-slate-100 px-3 text-sm font-semibold text-slate-500">+91</span><input type="tel" inputMode="numeric" maxLength={10} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value.replace(/\D/g, "").slice(0, 10) }))} className="min-w-0 flex-1 px-3 text-sm font-normal outline-none" /></div></label>;

  function submit(event: FormEvent) {
    event.preventDefault(); setError(null);
    if (section === "hours") {
      mutation.mutate({
        type: "hours",
        showHours,
        payload: {
          business_hours: hoursByDay.flatMap((slots, dayIndex) =>
            slots.map((slot) => ({ days: [dayIndex], ...slot })),
          ),
        },
      });
      return;
    }
    let payload: BusinessUpdatePayload | FormData;
    if (section === "basic") payload = { name: values.name, description: values.description, established_year: Number(values.established_year) };
    else if (section === "categories") payload = { categories: categories.map((item) => item.id) };
    else if (section === "address") payload = { address: values.address, landmark: values.landmark, locality: values.locality, city: city?.id, postal_code: values.postal_code, display_full_address: fullAddress };
    else if (section === "contact") payload = { phone: indianPhone(values.phone), whatsapp: indianPhone(values.whatsapp), email: values.email, website: values.website, alternate_numbers: alternateNumbers.map(indianPhone).filter(Boolean) };
    else if (section === "social") payload = { social_urls: Object.fromEntries(["facebook", "instagram", "youtube", "linkedin", "x"].filter((key) => values[key]?.trim()).map((key) => [key, values[key].trim()])) };
    else payload = { seo_title: values.seo_title, seo_description: values.seo_description, seo_keywords: values.seo_keywords };
    mutation.mutate({ type: "business", payload });
  }

  return <FullScreenModal open onClose={() => !mutation.isPending && onClose()} title={`Edit ${section}`}><div className="min-h-dvh bg-slate-50"><MobileHeader title={sectionTitle(section)} onBack={onClose} /><form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 px-page py-5"><section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
    {section === "basic" && <>{field("name", "Name")}<label className="block text-xs font-bold"><span className="mb-1.5 block">Description</span><textarea value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} rows={5} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-brand" /></label><label className="block text-xs font-bold"><span className="mb-1.5 block">Established year</span><input inputMode="numeric" maxLength={4} pattern="\d{4}" value={values.established_year} onChange={(event) => setValues((current) => ({ ...current, established_year: event.target.value.replace(/\D/g, "").slice(0, 4) }))} className={inputClass} /></label></>}
    {section === "categories" && <CategorySelect selected={categories} onChange={setCategories} />}
    {section === "address" && <>{field("address", "Address")}{field("landmark", "Landmark")}{field("locality", "Locality")}<CitySelect selected={city} onChange={setCity} />{field("postal_code", "Postal code")}<Switch label="Show full address" checked={fullAddress} onChange={setFullAddress} /></>}
    {section === "contact" && <>{phoneField("phone", "Phone")}{phoneField("whatsapp", "WhatsApp")}<div><p className="mb-2 text-xs font-bold">Alternate numbers</p><div className="space-y-2">{alternateNumbers.map((number, index) => <div key={index} className="flex gap-2"><div className="flex h-11 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand"><span className="flex items-center border-r border-slate-100 px-3 text-sm font-semibold text-slate-500">+91</span><input type="tel" inputMode="numeric" maxLength={10} value={number} onChange={(event) => setAlternateNumbers(alternateNumbers.map((item, itemIndex) => itemIndex === index ? event.target.value.replace(/\D/g, "").slice(0, 10) : item))} className="min-w-0 flex-1 px-3 text-sm font-normal outline-none" /></div><button type="button" aria-label={`Remove alternate number ${index + 1}`} onClick={() => setAlternateNumbers(alternateNumbers.filter((_, itemIndex) => itemIndex !== index))} className="size-11 shrink-0 rounded-xl bg-red-50 text-danger"><i className="fa-solid fa-xmark" /></button></div>)}</div>{alternateNumbers.length < 4 && <button type="button" onClick={() => setAlternateNumbers([...alternateNumbers, ""])} className="mt-2 text-xs font-extrabold text-brand"><i className="fa-solid fa-plus mr-1" />Add number</button>}</div>{field("email", "Email", "email")}{field("website", "Website", "url")}</>}
    {section === "social" && <>{field("facebook", "Facebook", "url")}{field("instagram", "Instagram", "url")}{field("youtube", "YouTube", "url")}{field("linkedin", "LinkedIn", "url")}{field("x", "X", "url")}</>}
    {section === "hours" && <><Switch label="Show business hours" checked={showHours} onChange={setShowHours} />{showHours && <BusinessHoursEditor value={hoursByDay} onChange={setHoursByDay} />}</>}
    {section === "seo" && <>{field("seo_title", "Page title")}<label className="block text-xs font-bold"><span className="mb-1.5 block">Description</span><textarea value={values.seo_description} onChange={(event) => setValues((current) => ({ ...current, seo_description: event.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" /></label>{field("seo_keywords", "Keywords")}</>}
  </section>{error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}<button type="submit" disabled={mutation.isPending} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Saving…" : "Save changes"}</button></form></div></FullScreenModal>;
}

function BusinessHoursEditor({ value, onChange }: { value: HoursByDay; onChange: (value: HoursByDay) => void }) {
  function updateSlot(dayIndex: number, slotIndex: number, field: keyof HoursSlot, fieldValue: string) {
    onChange(value.map((slots, currentDayIndex) => currentDayIndex === dayIndex
      ? slots.map((slot, currentSlotIndex) => currentSlotIndex === slotIndex ? { ...slot, [field]: fieldValue } : slot)
      : slots));
  }

  function addSlot(dayIndex: number) {
    onChange(value.map((slots, currentDayIndex) => currentDayIndex === dayIndex
      ? [...slots, { opens_at: "09:00", closes_at: "17:00" }]
      : slots));
  }

  function removeSlot(dayIndex: number, slotIndex: number) {
    onChange(value.map((slots, currentDayIndex) => currentDayIndex === dayIndex
      ? slots.filter((_, currentSlotIndex) => currentSlotIndex !== slotIndex)
      : slots));
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      {scheduleDays.map((day, dayIndex) => {
        const slots = value[dayIndex] ?? [];
        return (
          <section key={day.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-extrabold">{day.label}</h3>
              <button type="button" onClick={() => addSlot(dayIndex)} className="text-[11px] font-extrabold text-brand">
                <i className="fa-solid fa-plus mr-1" aria-hidden="true" />
                Add hours
              </button>
            </div>
            {slots.length === 0 ? (
              <p className="mt-2 text-xs font-medium text-foreground-muted">Closed</p>
            ) : (
              <div className="mt-2 space-y-2">
                {slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2">
                    <input
                      type="time"
                      required
                      value={slot.opens_at}
                      onChange={(event) => updateSlot(dayIndex, slotIndex, "opens_at", event.target.value)}
                      aria-label={`${day.label} opening time ${slotIndex + 1}`}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand"
                    />
                    <span className="text-xs font-semibold text-foreground-muted">to</span>
                    <input
                      type="time"
                      required
                      value={slot.closes_at}
                      onChange={(event) => updateSlot(dayIndex, slotIndex, "closes_at", event.target.value)}
                      aria-label={`${day.label} closing time ${slotIndex + 1}`}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      aria-label={`Remove ${day.label} time slot ${slotIndex + 1}`}
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-danger"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function CategorySelect({ selected, onChange }: { selected: BusinessCategoryOption[]; onChange: (items: BusinessCategoryOption[]) => void }) {
  const [search, setSearch] = useState(""); const [results, setResults] = useState<BusinessCategoryOption[]>([]);
  useEffect(() => { if (!search.trim()) return; const timer = setTimeout(() => void searchBusinessCategories(search).then(setResults), 300); return () => clearTimeout(timer); }, [search]);
  const clear = () => { setSearch(""); setResults([]); };
  return <div><div className="mb-3 flex flex-wrap gap-2">{selected.map((item) => <button key={item.id} type="button" onClick={() => onChange(selected.filter((chosen) => chosen.id !== item.id))} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand">{item.display_name}<i className="fa-solid fa-xmark ml-1" /></button>)}</div><div className="relative"><input value={search} onChange={(event) => { setSearch(event.target.value); if (!event.target.value.trim()) setResults([]); }} placeholder="Search categories" className={`${inputClass} pr-11`} />{search && <button type="button" aria-label="Clear category search" onClick={clear} className="absolute right-0 top-0 flex size-11 items-center justify-center text-slate-400"><i className="fa-solid fa-xmark" /></button>}</div>{results.length > 0 && <div className="mt-2 overflow-hidden rounded-xl border border-slate-100">{results.map((item) => { const chosen = selected.some((value) => value.id === item.id); return <label key={item.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0 ${chosen ? "bg-slate-50 text-slate-500" : "hover:bg-slate-50"}`}><input type="checkbox" checked={chosen} disabled={chosen} onChange={() => onChange([...selected, item])} className="size-4 accent-brand" />{item.display_name}</label>; })}</div>}</div>;
}
function CitySelect({ selected, onChange }: { selected: BusinessCityOption | null; onChange: (city: BusinessCityOption) => void }) {
  const [search, setSearch] = useState(""); const [results, setResults] = useState<BusinessCityOption[]>([]);
  useEffect(() => { if (!search.trim()) return; const timer = setTimeout(() => void searchBusinessCities(search).then(setResults), 300); return () => clearTimeout(timer); }, [search]);
  const clear = () => { setSearch(""); setResults([]); };
  return <div><label className="block text-xs font-bold"><span className="mb-1.5 block">City</span><span className="relative block"><input value={search} onChange={(event) => { setSearch(event.target.value); if (!event.target.value.trim()) setResults([]); }} placeholder={selected ? `${selected.name}, ${selected.state.name}` : "Search city"} className={`${inputClass} pr-11`} />{search && <button type="button" aria-label="Clear city search" onClick={clear} className="absolute right-0 top-0 flex size-11 items-center justify-center text-slate-400"><i className="fa-solid fa-xmark" /></button>}</span></label>{results.length > 0 && <div className="mt-2 overflow-hidden rounded-xl border border-slate-100">{results.map((item) => { const chosen = selected?.id === item.id; return <label key={item.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0 ${chosen ? "bg-slate-50" : "hover:bg-slate-50"}`}><input type="checkbox" checked={chosen} onChange={() => { onChange(item); clear(); }} className="size-4 accent-brand" />{item.name}, {item.state.name}</label>; })}</div>}</div>;
}
function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
function localPhone(value: string | null | undefined) { const digits = (value ?? "").replace(/\D/g, ""); return digits.startsWith("91") && digits.length > 10 ? digits.slice(2, 12) : digits.slice(0, 10); }
function indianPhone(value: string) { const digits = value.replace(/\D/g, "").slice(0, 10); return digits ? `+91${digits}` : ""; }
function timeInputValue(value: string) { return value.match(/(\d{2}:\d{2})/)?.[1] ?? value; }
function sectionTitle(section: BusinessInfoSection) { return `Edit ${section === "seo" ? "Search information" : section.charAt(0).toUpperCase() + section.slice(1)}`; }
