"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBusinessDoctors } from "../../business.service";
import type { DoctorListItem } from "../../business.types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatTime(value: string) {
  const [hourValue, minute = "00"] = value.split(":");
  const hour = Number(hourValue);
  if (!Number.isFinite(hour)) return value;
  return `${hour % 12 || 12}${minute === "00" ? "" : `:${minute}`} ${hour >= 12 ? "PM" : "AM"}`;
}

export function BusinessDoctorsSection({ businessSlug, phone, enabled }: { businessSlug: string; phone: string | null; enabled: boolean }) {
  const query = useQuery({
    queryKey: ["business", businessSlug, "doctors"],
    queryFn: () => getBusinessDoctors(businessSlug),
    enabled,
  });
  const doctors = query.data?.results ?? [];

  if (!enabled) return null;
  if (query.isPending) return <DoctorSkeleton />;
  if (query.isError || doctors.length === 0) return null;

  return <section className="mt-5" aria-labelledby="business-doctors-heading">
    <h2 id="business-doctors-heading" className="text-base font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
      Doctors
    </h2>
    <div className="mt-2.5 space-y-3">
      {doctors.slice(0, 6).map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} phone={phone} />)}
    </div>
  </section>;
}

function DoctorCard({ doctor, phone }: { doctor: DoctorListItem; phone: string | null }) {
  const specialties = doctor.specialties.map((specialty) => specialty.label || specialty.name).filter(Boolean);
  const fee = doctor.consultation_fee ? Number(doctor.consultation_fee) : null;
  const feeText = fee !== null && Number.isFinite(fee) && fee > 0 ? currencyFormatter.format(fee) : null;
  const detailHref = `/doctors/${encodeURIComponent(doctor.slug)}`;
  const schedule = doctor.schedule.full_schedule;
  const nextAvailableClassName = doctor.schedule.is_today ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  return <article className="group relative rounded-xl border border-brand-100 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:border-brand-900 dark:bg-surface-dark-secondary dark:hover:border-brand-800 dark:hover:bg-brand-950/20">
    <Link href={detailHref} className="absolute inset-0 rounded-xl" aria-label={`View ${doctor.name}`} />
    <div className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand dark:bg-brand-950 dark:text-brand-300">
        <i className="fa-solid fa-user-doctor text-lg" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-extrabold leading-5 text-foreground dark:text-foreground-dark">
            {doctor.name}
          </h3>
          {feeText && <span className="shrink-0 text-sm font-extrabold text-brand dark:text-brand-300">{feeText}</span>}
        </div>
        {specialties.length > 0 && <p className="mt-1 text-xs font-bold text-foreground-muted dark:text-foreground-dark-muted">{specialties.join(" | ")}</p>}
        {doctor.qualification && <p className="mt-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">{doctor.qualification}</p>}
      </div>
    </div>
    {doctor.schedule.next_available && <p className={`mt-3 text-xs font-bold ${nextAvailableClassName}`}><i className="fa-solid fa-calendar-check mr-1" aria-hidden="true" />{doctor.schedule.next_available}</p>}
    {schedule.length > 0 && <ScheduleList items={schedule} />}
    {phone && <a href={`tel:${phone}`} className="relative z-10 mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white text-xs font-extrabold text-brand transition-colors hover:border-brand hover:bg-brand-50 dark:border-brand-800 dark:bg-surface-dark-secondary dark:text-brand-300 dark:hover:bg-brand-950/40"><i className="fa-solid fa-phone text-[11px]" aria-hidden="true" />Enquiry</a>}
  </article>;
}

function ScheduleList({ items }: { items: DoctorListItem["schedule"]["full_schedule"] }) {
  return <div className="mt-3 space-y-1.5">
    {items.map((item, index) => (
      <p key={`${item.schedule_type}-${item.schedule_label}-${item.start_time}-${index}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">
        <span className="font-extrabold text-foreground dark:text-foreground-dark">{item.schedule_label || item.schedule_type.replace(/_/g, " ")}</span>
        <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
        {item.consultation_type === "by_appointment" && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold capitalize text-brand dark:bg-brand-950 dark:text-brand-300">By appointment</span>}
      </p>
    ))}
  </div>;
}

function DoctorSkeleton() {
  return <section className="mt-5" aria-label="Loading doctors">
    <div className="h-5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
    <div className="mt-2.5 space-y-3">
      {[0, 1].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
    </div>
  </section>;
}
