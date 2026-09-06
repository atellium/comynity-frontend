"use client";

import { useQuery } from "@tanstack/react-query";
import { getBusinessDoctors } from "../../business.service";
import type { BusinessProduct } from "../../business.types";

type DoctorSpecs = {
  qualification?: string;
  experience_years?: number;
  gender?: string;
  consultation_fee?: number;
  treatments?: string[];
  languages?: string[];
  schedule?: Array<{ title?: string; slots?: string[] }>;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function BusinessDoctorsSection({ businessSlug, phone }: { businessSlug: string; phone: string | null }) {
  const query = useQuery({
    queryKey: ["business", businessSlug, "doctors"],
    queryFn: () => getBusinessDoctors(businessSlug),
  });
  const doctors = query.data?.results ?? [];

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

function DoctorCard({ doctor, phone }: { doctor: BusinessProduct; phone: string | null }) {
  const specs = doctor.specifications as DoctorSpecs | undefined;
  const specialties = doctor.categories?.map((category) => category.display_name || category.label).filter(Boolean) ?? [];
  const fee = specs?.consultation_fee ?? Number(doctor.price);
  const feeText = Number.isFinite(fee) && fee > 0 ? currencyFormatter.format(fee) : null;

  return <article className="rounded-xl border border-brand-100 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.06)] dark:border-brand-900 dark:bg-surface-dark-secondary">
    <div className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand dark:bg-brand-950 dark:text-brand-300">
        <i className="fa-solid fa-user-doctor text-lg" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-extrabold leading-5 text-foreground dark:text-foreground-dark">{doctor.name}</h3>
          {feeText && <span className="shrink-0 text-sm font-extrabold text-brand dark:text-brand-300">{feeText}</span>}
        </div>
        {specialties.length > 0 && <p className="mt-1 text-xs font-bold text-foreground-muted dark:text-foreground-dark-muted">{specialties.join(" | ")}</p>}
        {(specs?.qualification || specs?.experience_years || specs?.gender) && <p className="mt-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">{[specs.qualification, specs.experience_years ? `${specs.experience_years} years experience` : null, specs.gender].filter(Boolean).join(" | ")}</p>}
      </div>
    </div>
    {specs?.languages && specs.languages.length > 0 && <ChipList title="Languages" items={specs.languages} />}
    {specs?.treatments && specs.treatments.length > 0 && <ChipList title="Treatments" items={specs.treatments.slice(0, 5)} />}
    {specs?.schedule && specs.schedule.length > 0 && <div className="mt-3 space-y-1.5">{specs.schedule.slice(0, 3).map((item, index) => <p key={`${item.title}-${index}`} className="text-xs text-foreground-muted dark:text-foreground-dark-muted"><span className="font-extrabold text-foreground dark:text-foreground-dark">{item.title}:</span> {(item.slots ?? []).join(", ")}</p>)}</div>}
    {phone && <a href={`tel:${phone}`} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white text-xs font-extrabold text-brand transition-colors hover:border-brand hover:bg-brand-50 dark:border-brand-800 dark:bg-surface-dark-secondary dark:text-brand-300 dark:hover:bg-brand-950/40"><i className="fa-solid fa-phone text-[11px]" aria-hidden="true" />Enquiry</a>}
  </article>;
}

function ChipList({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-3">
    <p className="text-[11px] font-extrabold uppercase text-foreground-subtle dark:text-foreground-dark-muted">{title}</p>
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((item) => <span key={item} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand dark:bg-brand-950 dark:text-brand-300">{item}</span>)}
    </div>
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
