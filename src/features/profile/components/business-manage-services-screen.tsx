"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { getOwnedBusinessInfo, updateOwnedBusiness } from "../profile.service";
import type { OwnedBusinessInfo } from "../profile.types";

type ServiceItem = { id: string; name: string };

function createServiceId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BusinessManageServicesScreen({ slug }: { slug: string }) {
  const business = useQuery({ queryKey: ["businesses", "mine", slug], queryFn: () => getOwnedBusinessInfo(slug) });

  return <div className="min-h-dvh bg-slate-50 pb-10">
    <MobileHeader title="Services" subtitle={business.data?.name ?? "Loading business..."} />
    <main className="mx-auto w-full max-w-3xl px-page pt-5">
      {business.isPending && <ServiceListSkeleton />}
      {business.isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-danger"><p className="font-semibold">Couldn&apos;t load services.</p><button type="button" onClick={() => void business.refetch()} className="mt-2 font-extrabold underline">Try again</button></div>}
      {business.data && <ServicesEditor key={business.data.slug} business={business.data} />}
    </main>
  </div>;
}

function ServicesEditor({ business }: { business: OwnedBusinessInfo }) {
  const [items, setItems] = useState<ServiceItem[]>(() => (business.services ?? []).map((name) => ({ id: createServiceId(), name })));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (services: string[]) => updateOwnedBusiness(business.slug, { services }),
    onSuccess: (updated) => {
      setItems((updated.services ?? []).map((name) => ({ id: createServiceId(), name })));
      setError(null);
      setSuccess("Services saved.");
      queryClient.setQueryData(["businesses", "mine", business.slug], updated);
      void queryClient.invalidateQueries({ queryKey: ["business", "detail", business.slug] });
    },
    onError: () => { setSuccess(null); setError("Unable to save services. Please try again."); },
  });

  function updateItem(id: string, name: string) {
    setSuccess(null);
    setItems((current) => current.map((item) => item.id === id ? { ...item, name } : item));
  }

  function removeItem(id: string) {
    setSuccess(null);
    setError(null);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    setSuccess(null);
    setItems((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  function addItem() {
    setSuccess(null);
    setError(null);
    setItems((current) => [...current, { id: createServiceId(), name: "" }]);
  }

  function saveServices() {
    const services = items.map((item) => item.name.trim());
    if (services.some((name) => !name)) {
      setSuccess(null);
      setError("Enter a name for every service or delete empty items.");
      return;
    }
    setError(null);
    mutation.mutate(services);
  }

  return <>
    {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center"><i className="fa-solid fa-screwdriver-wrench text-2xl text-brand" aria-hidden="true" /><p className="mt-3 text-sm font-extrabold text-foreground">No services added</p></div>
      : <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">{items.map((item, index) => <div key={item.id} className="flex items-center gap-2 border-b border-slate-100 p-3 last:border-b-0">
        <input value={item.name} onChange={(event) => updateItem(item.id, event.target.value)} disabled={mutation.isPending} placeholder="Service name" aria-label={`Service ${index + 1}`} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-foreground outline-none focus:border-brand disabled:opacity-60" />
        <div className="flex shrink-0 flex-col">
          <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0 || mutation.isPending} aria-label={`Move service ${index + 1} up`} className="flex size-6 items-center justify-center text-brand disabled:text-slate-200"><i className="fa-solid fa-chevron-up text-xs" aria-hidden="true" /></button>
          <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1 || mutation.isPending} aria-label={`Move service ${index + 1} down`} className="flex size-6 items-center justify-center text-brand disabled:text-slate-200"><i className="fa-solid fa-chevron-down text-xs" aria-hidden="true" /></button>
        </div>
        <button type="button" onClick={() => removeItem(item.id)} disabled={mutation.isPending} aria-label={`Delete service ${index + 1}`} className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-danger disabled:opacity-60"><i className="fa-solid fa-trash" aria-hidden="true" /></button>
      </div>)}</div>}
    <button type="button" onClick={addItem} disabled={mutation.isPending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white text-sm font-extrabold text-brand disabled:opacity-60"><i className="fa-solid fa-plus" aria-hidden="true" />Add service</button>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}
    {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}
    <button type="button" onClick={saveServices} disabled={mutation.isPending} className="mt-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Saving..." : "Save changes"}</button>
  </>;
}

function ServiceListSkeleton() {
  return <div className="space-y-3" aria-label="Loading services">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-white" />)}</div>;
}
