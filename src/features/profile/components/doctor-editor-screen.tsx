"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/layout/MobileHeader";
import { createDoctor, getManagedDoctor, getOwnedBusinessInfo, searchDoctorSpecialties, updateDoctor } from "../profile.service";
import type { DoctorPayload, DoctorSchedulePayload, DoctorSpecialty, ManagedDoctor } from "../catalog.types";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-foreground outline-none focus:border-brand";
type ScheduleSlotDraft = { id: string; startTime: string; endTime: string; consultationType: "walk_in" | "by_appointment"; isActive: boolean };
type ScheduleDraft = { id: string; scheduleType: "weekly" | "monthly_weekday" | "monthly_date"; weekday: string; weekOfMonth: string; dayOfMonth: string; slots: ScheduleSlotDraft[] };

function createDraftId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function blankSchedule(): ScheduleDraft {
  return { id: createDraftId(), scheduleType: "weekly", weekday: "0", weekOfMonth: "1", dayOfMonth: "1", slots: [blankSlot()] };
}

function blankSlot(): ScheduleSlotDraft {
  return { id: createDraftId(), startTime: "09:00", endTime: "12:00", consultationType: "walk_in", isActive: true };
}

export function DoctorEditorScreen({ businessSlug, catalogSlug }: { businessSlug: string; catalogSlug?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = Boolean(catalogSlug);
  const business = useQuery({ queryKey: ["businesses", "mine", businessSlug], queryFn: () => getOwnedBusinessInfo(businessSlug) });
  const doctor = useQuery({ queryKey: ["business", businessSlug, "doctors", catalogSlug], queryFn: () => getManagedDoctor(businessSlug, catalogSlug!), enabled: editing });
  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState("");
  const [specialties, setSpecialties] = useState<DoctorSpecialty[]>([]);
  const [qualification, setQualification] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationCouncil, setRegistrationCouncil] = useState("");
  const [registrationYear, setRegistrationYear] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [treatments, setTreatments] = useState("");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>([blankSchedule()]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!doctor.data || initialized) return;
    queueMicrotask(() => {
      setName(doctor.data.name);
      setSpecialties(doctor.data.specialties ?? []);
      setQualification(doctor.data.qualification ?? "");
      setRegistrationNumber(doctor.data.registration_number ?? "");
      setRegistrationCouncil(doctor.data.registration_council ?? "");
      setRegistrationYear(doctor.data.registration_year ? String(doctor.data.registration_year) : "");
      setConsultationFee(doctor.data.consultation_fee ?? "");
      setBio(doctor.data.bio ?? "");
      setLanguages((doctor.data.languages ?? []).join(", "));
      setTreatments((doctor.data.treatments ?? []).join(", "));
      setSchedules(doctor.data.schedule?.full_schedule?.length ? schedulesFromApi(doctor.data.schedule.full_schedule) : [blankSchedule()]);
      setIsActive(doctor.data.is_active !== false);
      setInitialized(true);
    });
  }, [doctor.data, initialized]);

  const save = useMutation({
    mutationFn: (payload: DoctorPayload) => {
      if (!business.data?.id) throw new Error("Business is still loading.");
      return editing ? updateDoctor(business.data.id, doctor.data?.id ?? catalogSlug!, payload) : createDoctor(business.data.id, payload);
    },
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
    const payload = buildPayload();
    if (!payload) return;
    save.mutate(payload, { onError: () => setError(`Unable to ${editing ? "update" : "add"} doctor.`) });
  }

  function buildPayload(): DoctorPayload | null {
    if (!name.trim()) return fail("Doctor name is required.");
    if (specialties.length === 0) return fail("Choose at least one specialty.");
    if (!qualification.trim()) return fail("Qualification is required.");
    if (consultationFee.trim() && Number(consultationFee) < 0) return fail("Enter a valid consultation fee.");
    const year = registrationYear.trim() ? Number(registrationYear) : null;
    if (year !== null && (!Number.isInteger(year) || registrationYear.length > 4)) return fail("Enter a valid registration year.");
    const schedulePayload = schedules.flatMap(scheduleToApi);
    if (schedules.some((schedule) => schedule.slots.some((slot) => Boolean(slot.startTime || slot.endTime) && !(slot.startTime && slot.endTime)))) return fail("Complete every schedule slot or remove it.");
    if (hasDuplicateSchedules(schedulePayload)) return fail("Duplicate schedule entry found. Change the day, week, time, or consultation type.");
    setError(null);
    return {
      name: name.trim(),
      specialty_ids: specialties.map((item) => item.id),
      qualification: qualification.trim(),
      ...(registrationNumber.trim() ? { registration_number: registrationNumber.trim() } : {}),
      ...(registrationCouncil.trim() ? { registration_council: registrationCouncil.trim() } : {}),
      ...(year !== null ? { registration_year: year } : {}),
      ...(consultationFee.trim() ? { consultation_fee: Number(consultationFee).toFixed(2) } : {}),
      ...(bio.trim() ? { bio: bio.trim() } : {}),
      ...(splitItems(languages).length ? { languages: splitItems(languages) } : {}),
      ...(splitItems(treatments).length ? { treatments: splitItems(treatments) } : {}),
      is_active: isActive,
      ...(schedulePayload.length ? { schedules: schedulePayload } : {}),
    };
  }

  function fail(message: string) {
    setError(message);
    return null;
  }

  if (editing && doctor.isPending) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Doctor" subtitle={business.data?.name ?? "Loading business..."} /><p className="py-12 text-center text-sm text-foreground-muted">Loading doctor...</p></div>;
  if (editing && doctor.isError) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Doctor" subtitle={business.data?.name} /><p className="py-12 text-center text-sm font-semibold text-danger">Doctor not found.</p></div>;

  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={editing ? "Edit Doctor" : "Add Doctor"} subtitle={business.data?.name ?? "Loading business..."} /><form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-4 px-page pt-5">
    <FormCard title="Doctor details"><Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter doctor name" className={inputClass} /></Field><SpecialtyPicker selected={specialties} onChange={setSpecialties} /><Field label="Qualification"><input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="MBBS, MD" className={inputClass} /></Field><Field label="Bio"><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short profile summary" rows={4} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <FormCard title="Registration"><Field label="Registration number"><input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="WBMC-12345" className={inputClass} /></Field><Field label="Registration council"><input value={registrationCouncil} onChange={(e) => setRegistrationCouncil(e.target.value)} placeholder="West Bengal Medical Council" className={inputClass} /></Field><Field label="Registration year"><input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={registrationYear} onBeforeInput={(event) => { if (event.data && /\D/.test(event.data)) event.preventDefault(); }} onPaste={(event) => { event.preventDefault(); setRegistrationYear(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)); }} onChange={(e) => setRegistrationYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2015" className={inputClass} /></Field></FormCard>
    <FormCard title="Consultation"><Field label="Consultation fee"><input type="number" min="0" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="700.00" className={inputClass} /></Field><Field label="Languages"><input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi, Bengali" className={inputClass} /></Field><Field label="Treatments"><textarea value={treatments} onChange={(e) => setTreatments(e.target.value)} placeholder="ECG, Cardiac consultation, Hypertension care" rows={3} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <ScheduleEditor schedules={schedules} onChange={setSchedules} />
    <FormCard title="Settings"><Toggle label="Active" checked={isActive} onChange={setIsActive} /></FormCard>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}
    <button type="submit" disabled={isBusy || business.isPending} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Saving..." : editing ? "Save changes" : "Add doctor"}</button>
  </form></div>;
}

function SpecialtyPicker({ selected, onChange }: { selected: DoctorSpecialty[]; onChange: (items: DoctorSpecialty[]) => void }) {
  const [search, setSearch] = useState(""); const [term, setTerm] = useState("");
  useEffect(() => { const timeout = window.setTimeout(() => setTerm(search.trim()), 300); return () => window.clearTimeout(timeout); }, [search]);
  const query = useQuery({ queryKey: ["doctor-specialties", term], queryFn: () => searchDoctorSpecialties(term), enabled: term.length > 0 });
  return <div className="space-y-3"><div className="flex flex-wrap gap-2">{selected.map((item) => <button key={item.id} type="button" onClick={() => onChange(selected.filter((specialty) => specialty.id !== item.id))} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand">{item.label || item.name}<i className="fa-solid fa-xmark ml-1" /></button>)}</div><div className="relative"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search specialties" className={`${inputClass} pr-11`} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear specialty search" className="absolute right-1 top-1 flex size-9 items-center justify-center text-foreground-muted"><i className="fa-solid fa-xmark" /></button>}</div>{term && <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100">{query.isFetching && <p className="p-3 text-xs text-foreground-muted">Searching...</p>}{query.data?.map((item) => { const chosen = selected.some((specialty) => specialty.id === item.id); return <label key={item.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-sm font-semibold last:border-0 ${chosen ? "bg-slate-50" : "hover:bg-slate-50"}`}><input type="checkbox" checked={chosen} onChange={() => onChange(chosen ? selected.filter((specialty) => specialty.id !== item.id) : [...selected, item])} className="size-4 shrink-0 accent-brand" /><span>{item.label || item.name}</span></label>; })}{query.data?.length === 0 && <p className="p-3 text-xs text-foreground-muted">No specialties found.</p>}</div>}</div>;
}

function ScheduleEditor({ schedules, onChange }: { schedules: ScheduleDraft[]; onChange: (items: ScheduleDraft[]) => void }) {
  function updateSchedule(id: string, patch: Partial<ScheduleDraft>) { onChange(schedules.map((schedule) => schedule.id === id ? { ...schedule, ...patch } : schedule)); }
  function updateSlot(scheduleId: string, slotId: string, patch: Partial<ScheduleSlotDraft>) {
    onChange(schedules.map((schedule) => schedule.id === scheduleId ? { ...schedule, slots: schedule.slots.map((slot) => slot.id === slotId ? { ...slot, ...patch } : slot) } : schedule));
  }
  return <FormCard title="Schedule">{schedules.map((schedule) => <div key={schedule.id} className="space-y-3 rounded-xl border border-slate-100 p-3"><div className="grid grid-cols-[1fr_1fr_auto] gap-2"><select value={schedule.scheduleType} onChange={(e) => updateSchedule(schedule.id, { scheduleType: e.target.value as ScheduleDraft["scheduleType"] })} className={inputClass}><option value="weekly">Weekly</option><option value="monthly_weekday">Monthly weekday</option><option value="monthly_date">Monthly date</option></select>{schedule.scheduleType === "monthly_date" ? <input type="number" min="1" max="31" value={schedule.dayOfMonth} onChange={(e) => updateSchedule(schedule.id, { dayOfMonth: e.target.value })} aria-label="Day of month" className={inputClass} /> : <div className={`grid gap-2 ${schedule.scheduleType === "monthly_weekday" ? "grid-cols-2" : "grid-cols-1"}`}>{schedule.scheduleType === "monthly_weekday" && <input type="number" min="1" max="5" value={schedule.weekOfMonth} onChange={(e) => updateSchedule(schedule.id, { weekOfMonth: e.target.value })} aria-label="Week of month" className={inputClass} />}<select value={schedule.weekday} onChange={(e) => updateSchedule(schedule.id, { weekday: e.target.value })} className={inputClass}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></div>}<button type="button" onClick={() => onChange(schedules.filter((item) => item.id !== schedule.id))} disabled={schedules.length === 1} aria-label="Remove schedule day" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-danger disabled:opacity-40"><i className="fa-solid fa-trash" /></button></div><div className="space-y-2">{schedule.slots.map((slot) => <div key={slot.id} className="rounded-xl bg-slate-50 p-2"><div className="grid grid-cols-[1fr_1fr_auto] gap-2"><input type="time" value={slot.startTime} onChange={(e) => updateSlot(schedule.id, slot.id, { startTime: e.target.value })} aria-label="Start time" className={inputClass} /><input type="time" value={slot.endTime} onChange={(e) => updateSlot(schedule.id, slot.id, { endTime: e.target.value })} aria-label="End time" className={inputClass} /><button type="button" onClick={() => updateSchedule(schedule.id, { slots: schedule.slots.filter((item) => item.id !== slot.id) })} disabled={schedule.slots.length === 1} aria-label="Remove time slot" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-danger disabled:opacity-40"><i className="fa-solid fa-xmark" /></button></div><div className="mt-2 grid grid-cols-2 gap-2"><select value={slot.consultationType} onChange={(e) => updateSlot(schedule.id, slot.id, { consultationType: e.target.value as ScheduleSlotDraft["consultationType"] })} className={inputClass}><option value="walk_in">Walk in</option><option value="by_appointment">By appointment</option></select><Toggle label="Active" checked={slot.isActive} onChange={(checked) => updateSlot(schedule.id, slot.id, { isActive: checked })} /></div></div>)}</div><button type="button" onClick={() => updateSchedule(schedule.id, { slots: [...schedule.slots, blankSlot()] })} className="text-xs font-extrabold text-brand"><i className="fa-solid fa-plus mr-1" />Add slot</button></div>)}<button type="button" onClick={() => onChange([...schedules, blankSchedule()])} className="text-xs font-extrabold text-brand"><i className="fa-solid fa-plus mr-1" />Add day</button></FormCard>;
}

function scheduleToApi(schedule: ScheduleDraft): DoctorSchedulePayload[] {
  const weekday = Number(schedule.weekday);
  const weekOfMonth = Number(schedule.weekOfMonth);
  const dayOfMonth = Number(schedule.dayOfMonth);
  if ((schedule.scheduleType === "weekly" || schedule.scheduleType === "monthly_weekday") && (!Number.isInteger(weekday) || weekday < 0 || weekday > 6)) return [];
  if (schedule.scheduleType === "monthly_weekday" && (!Number.isInteger(weekOfMonth) || weekOfMonth < 1 || weekOfMonth > 5)) return [];
  if (schedule.scheduleType === "monthly_date" && (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31)) return [];
  return schedule.slots.filter((slot) => slot.startTime && slot.endTime).map((slot) => ({ schedule_type: schedule.scheduleType, weekday: schedule.scheduleType === "weekly" || schedule.scheduleType === "monthly_weekday" ? weekday : null, week_of_month: schedule.scheduleType === "monthly_weekday" ? weekOfMonth : null, day_of_month: schedule.scheduleType === "monthly_date" ? dayOfMonth : null, start_time: toApiTime(slot.startTime), end_time: toApiTime(slot.endTime), consultation_type: slot.consultationType, is_active: slot.isActive }));
}

function hasDuplicateSchedules(items: DoctorSchedulePayload[]) {
  const seen = new Set<string>();
  return items.some((item) => {
    const key = [item.schedule_type, item.weekday ?? "", item.week_of_month ?? "", item.day_of_month ?? "", item.start_time, item.end_time, item.consultation_type].join("|");
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}

type DoctorScheduleItem = NonNullable<NonNullable<ManagedDoctor["schedule"]>["full_schedule"]>[number];

function schedulesFromApi(items: DoctorScheduleItem[]): ScheduleDraft[] {
  const schedules = new Map<string, ScheduleDraft>();
  items.forEach((item) => {
    const weekday = String(item.weekday ?? 0);
    const weekOfMonth = String(item.week_of_month ?? 1);
    const dayOfMonth = String(item.day_of_month ?? 1);
    const key = `${item.schedule_type}:${item.schedule_type === "monthly_date" ? dayOfMonth : `${weekOfMonth}:${weekday}`}`;
    const schedule = schedules.get(key) ?? { id: createDraftId(), scheduleType: item.schedule_type, weekday, weekOfMonth, dayOfMonth, slots: [] };
    schedule.slots.push({ id: createDraftId(), startTime: toTimeInput(item.start_time), endTime: toTimeInput(item.end_time), consultationType: item.consultation_type, isActive: true });
    schedules.set(key, schedule);
  });
  return Array.from(schedules.values()).map((schedule) => schedule.slots.length ? schedule : { ...schedule, slots: [blankSlot()] });
}

function splitItems(value: string) { return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean); }
function toApiTime(value: string) { return value.length === 5 ? `${value}:00` : value; }
function toTimeInput(value: string) { return value.slice(0, 5); }
function FormCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><h2 className="mb-4 text-sm font-extrabold text-foreground">{title}</h2><div className="space-y-4">{children}</div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-foreground"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between gap-3 text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
