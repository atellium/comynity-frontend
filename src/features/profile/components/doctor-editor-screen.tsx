"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/layout/MobileHeader";
import { createCatalog, getCatalogDetails, getOwnedBusinessInfo, searchCatalogCategories, updateCatalogViaEditEndpoint } from "../profile.service";
import type { CatalogCategory, CatalogPayload, DoctorSpecifications, EditableProduct } from "../catalog.types";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-foreground outline-none focus:border-brand";
type ScheduleDraft = { id: string; title: string; slots: Array<{ id: string; start: string; end: string }> };

function createDraftId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function DoctorEditorScreen({ businessSlug, catalogSlug }: { businessSlug: string; catalogSlug?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = Boolean(catalogSlug);
  const business = useQuery({ queryKey: ["businesses", "mine", businessSlug], queryFn: () => getOwnedBusinessInfo(businessSlug) });
  const detail = useQuery({ queryKey: ["businesses", "mine", businessSlug, "catalog", catalogSlug, "details"], queryFn: () => getCatalogDetails(businessSlug, catalogSlug!), enabled: editing });
  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialties, setSpecialties] = useState<CatalogCategory[]>([]);
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [gender, setGender] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [treatments, setTreatments] = useState("");
  const [languages, setLanguages] = useState("");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>([
    { id: createDraftId(), title: "Monday - Friday", slots: [{ id: createDraftId(), start: "10:00", end: "13:00" }, { id: createDraftId(), start: "17:00", end: "20:00" }] },
  ]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!detail.data || initialized) return;
    const doctor = detail.data as EditableProduct;
    const specs = doctor.specifications as Partial<DoctorSpecifications> | undefined;
    queueMicrotask(() => {
      setName(doctor.name);
      setDescription(doctor.description ?? "");
      setSpecialties(doctor.categories ?? []);
      setQualification(specs?.qualification ?? "");
      setExperienceYears(specs?.experience_years === undefined ? "" : String(specs.experience_years));
      setGender(specs?.gender ?? "");
      setConsultationFee(specs?.consultation_fee === undefined ? "" : String(specs.consultation_fee));
      setTreatments((specs?.treatments ?? []).join(", "));
      setLanguages((specs?.languages ?? []).join(", "));
      setSchedules((specs?.schedule?.length ? specs.schedule : [{ title: "Monday - Friday", slots: ["10:00 AM - 1:00 PM", "5:00 PM - 8:00 PM"] }]).map((schedule) => ({
        id: createDraftId(),
        title: schedule.title,
        slots: schedule.slots.map((slot) => {
          const [start = "", end = ""] = slot.split(" - ");
          return { id: createDraftId(), start: toTimeInput(start), end: toTimeInput(end) };
        }),
      })));
      setIsActive(doctor.is_active !== false);
      setInitialized(true);
    });
  }, [detail.data, initialized]);

  const save = useMutation({
    mutationFn: (payload: CatalogPayload) => editing ? updateCatalogViaEditEndpoint(businessSlug, catalogSlug!, payload) : createCatalog(businessSlug, payload),
    onSuccess: async () => {
      setIsRedirecting(true);
      await queryClient.invalidateQueries({ queryKey: ["business", businessSlug, "doctors"] });
      router.replace(`/business/${encodeURIComponent(businessSlug)}/manage/doctors`);
    },
    onError: () => setIsRedirecting(false),
  });
  const isBusy = save.isPending || isRedirecting;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (isBusy) return;
    if (!name.trim()) return setError("Doctor name is required.");
    if (!qualification.trim()) return setError("Qualification is required.");
    const years = Number(experienceYears);
    const fee = Number(consultationFee);
    if (!Number.isFinite(years) || years < 0) return setError("Enter valid experience years.");
    if (!Number.isFinite(fee) || fee < 0) return setError("Enter a valid consultation fee.");
    const schedule = schedules.map((item) => ({ title: item.title.trim(), slots: item.slots.map((slot) => formatSlot(slot.start, slot.end)).filter(Boolean) }));
    if (schedule.some((item) => !item.title || item.slots.length === 0)) return setError("Each schedule needs a title and at least one complete time slot.");
    setError(null);
    const payload: CatalogPayload = {
      name: name.trim(),
      type: "doctor",
      description: description.trim(),
      price_type: "fixed",
      price: consultationFee,
      variants: [],
      specifications: {
        qualification: qualification.trim(),
        experience_years: years,
        gender: gender.trim(),
        consultation_fee: fee,
        treatments: splitLines(treatments),
        languages: splitLines(languages),
        schedule,
      },
      custom_fields: [],
      categories: specialties.map((item) => item.id),
      is_featured: false,
      is_active: isActive,
    };
    save.mutate(payload, { onError: () => setError(`Unable to ${editing ? "update" : "add"} doctor.`) });
  }

  if (editing && detail.isPending) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Doctor" subtitle={business.data?.name ?? "Loading business..."} /><p className="py-12 text-center text-sm text-foreground-muted">Loading doctor...</p></div>;
  if (editing && detail.isError) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Doctor" subtitle={business.data?.name} /><p className="py-12 text-center text-sm font-semibold text-danger">Doctor not found.</p></div>;

  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={editing ? "Edit Doctor" : "Add Doctor"} subtitle={business.data?.name ?? "Loading business..."} /><form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-4 px-page pt-5">
    <FormCard title="Doctor details"><Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter doctor name" className={inputClass} /></Field><Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short profile summary" rows={4} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <SpecialtyPicker selected={specialties} onChange={setSpecialties} />
    <FormCard title="Specifications"><Field label="Qualification"><input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="MBBS, MD (Medicine)" className={inputClass} /></Field><Field label="Experience years"><input type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="12" className={inputClass} /></Field><Field label="Gender"><select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></Field><Field label="Consultation fee"><input type="number" min="0" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="700" className={inputClass} /></Field><Field label="Treatments"><textarea value={treatments} onChange={(e) => setTreatments(e.target.value)} placeholder="High Blood Pressure, Chest Pain, Diabetes" rows={3} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></Field><Field label="Languages"><input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Bengali, Hindi, English" className={inputClass} /></Field></FormCard>
    <ScheduleEditor schedules={schedules} onChange={setSchedules} />
    <FormCard title="Settings"><Toggle label="Active" checked={isActive} onChange={setIsActive} /></FormCard>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}
    <button type="submit" disabled={isBusy} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Saving..." : editing ? "Save changes" : "Add doctor"}</button>
  </form></div>;
}

function ScheduleEditor({ schedules, onChange }: { schedules: ScheduleDraft[]; onChange: (items: ScheduleDraft[]) => void }) {
  function updateSchedule(id: string, patch: Partial<ScheduleDraft>) {
    onChange(schedules.map((schedule) => schedule.id === id ? { ...schedule, ...patch } : schedule));
  }

  function updateSlot(scheduleId: string, slotId: string, patch: Partial<{ start: string; end: string }>) {
    onChange(schedules.map((schedule) => schedule.id === scheduleId ? { ...schedule, slots: schedule.slots.map((slot) => slot.id === slotId ? { ...slot, ...patch } : slot) } : schedule));
  }

  return <FormCard title="Schedule">
    {schedules.map((schedule) => <div key={schedule.id} className="rounded-xl border border-slate-100 p-3">
      <div className="flex gap-2">
        <input value={schedule.title} onChange={(e) => updateSchedule(schedule.id, { title: e.target.value })} placeholder="Monday - Friday" aria-label="Schedule title" className={inputClass} />
        <button type="button" onClick={() => onChange(schedules.filter((item) => item.id !== schedule.id))} disabled={schedules.length === 1} aria-label="Remove schedule" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-danger disabled:opacity-40"><i className="fa-solid fa-trash" /></button>
      </div>
      <div className="mt-3 space-y-2">
        {schedule.slots.map((slot) => <div key={slot.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input type="time" value={slot.start} onChange={(e) => updateSlot(schedule.id, slot.id, { start: e.target.value })} aria-label="Slot start time" className={inputClass} />
          <input type="time" value={slot.end} onChange={(e) => updateSlot(schedule.id, slot.id, { end: e.target.value })} aria-label="Slot end time" className={inputClass} />
          <button type="button" onClick={() => updateSchedule(schedule.id, { slots: schedule.slots.filter((item) => item.id !== slot.id) })} disabled={schedule.slots.length === 1} aria-label="Remove time slot" className="flex size-11 items-center justify-center rounded-xl bg-slate-50 text-foreground-muted disabled:opacity-40"><i className="fa-solid fa-xmark" /></button>
        </div>)}
      </div>
      <button type="button" onClick={() => updateSchedule(schedule.id, { slots: [...schedule.slots, { id: createDraftId(), start: "", end: "" }] })} className="mt-3 text-xs font-extrabold text-brand"><i className="fa-solid fa-plus mr-1" />Add time slot</button>
    </div>)}
    <button type="button" onClick={() => onChange([...schedules, { id: createDraftId(), title: "", slots: [{ id: createDraftId(), start: "", end: "" }] }])} className="text-xs font-extrabold text-brand"><i className="fa-solid fa-plus mr-1" />Add schedule</button>
  </FormCard>;
}

function SpecialtyPicker({ selected, onChange }: { selected: CatalogCategory[]; onChange: (items: CatalogCategory[]) => void }) {
  const [search, setSearch] = useState(""); const [term, setTerm] = useState("");
  useEffect(() => { const timeout = window.setTimeout(() => setTerm(search.trim()), 300); return () => window.clearTimeout(timeout); }, [search]);
  const query = useQuery({ queryKey: ["catalog-specialties", term], queryFn: () => searchCatalogCategories(term, "specialty"), enabled: term.length > 0 });
  return <FormCard title="Specialties"><div className="flex flex-wrap gap-2">{selected.map((item, index) => <button key={categoryKey(item, index)} type="button" onClick={() => onChange(selected.filter((specialty) => specialty.id !== item.id))} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand">{item.display_name} <i className="fa-solid fa-xmark ml-1" /></button>)}</div><div className="relative"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search specialties" className={`${inputClass} pr-11`} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear specialty search" className="absolute right-1 top-1 flex size-9 items-center justify-center text-foreground-muted"><i className="fa-solid fa-xmark" /></button>}</div>{term && <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100">{query.isFetching && <p className="p-3 text-xs text-foreground-muted">Searching...</p>}{query.data?.map((item, index) => { const chosen = selected.some((specialty) => specialty.id === item.id); return <label key={categoryKey(item, index)} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-sm font-semibold last:border-0 ${chosen ? "bg-slate-50" : "hover:bg-slate-50"}`}><input type="checkbox" checked={chosen} onChange={() => onChange(chosen ? selected.filter((specialty) => specialty.id !== item.id) : [...selected, item])} className="size-4 shrink-0 accent-brand" /><span>{item.display_name}</span></label>; })}{query.data?.length === 0 && <p className="p-3 text-xs text-foreground-muted">No specialties found.</p>}</div>}</FormCard>;
}

function categoryKey(category: CatalogCategory, index: number) {
  return `${category.id ?? category.slug ?? category.display_name ?? category.name}-${index}`;
}

function splitLines(value: string) { return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean); }
function formatSlot(start: string, end: string) { if (!start || !end) return ""; return `${formatTime(start)} - ${formatTime(end)}`; }
function formatTime(value: string) {
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  if (!Number.isFinite(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
}
function toTimeInput(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}
function FormCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><h2 className="mb-4 text-sm font-extrabold text-foreground">{title}</h2><div className="space-y-4">{children}</div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-foreground"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between gap-3 text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
