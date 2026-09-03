"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getOwnedBusinesses } from "../profile.service";
import type { OwnedBusiness } from "../profile.types";

export function MyBusinesses() {
  const { data, isPending, isError, refetch, isFetching } = useQuery({ queryKey: ["businesses", "mine"], queryFn: getOwnedBusinesses });

  return <section className="mt-5" aria-labelledby="my-businesses-heading">
    <h2 id="my-businesses-heading" className="mb-3 text-base font-extrabold text-foreground">My businesses</h2>
    {isPending && <BusinessListSkeleton />}
    {isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-danger"><p className="font-semibold">Couldn&apos;t load your businesses.</p><button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-2 font-extrabold underline disabled:opacity-60">{isFetching ? "Trying again…" : "Try again"}</button></div>}
    {!isPending && !isError && data?.results.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand" aria-hidden="true"><i className="fa-solid fa-store" /></span><p className="mt-3 text-sm font-extrabold text-foreground">No businesses yet</p><p className="mt-1 text-xs text-foreground-muted">Businesses you own will appear here.</p></div>}
    {data && data.results.length > 0 && <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">{data.results.map((business) => <OwnedBusinessCard key={business.id} business={business} />)}</div>}
  </section>;
}

function OwnedBusinessCard({ business }: { business: OwnedBusiness }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const category = business.categories?.map((item) => item.display_name).join(" · ") || "Uncategorized";
  const isPublished = business.publication_status === "published";
  const publicPath = `/business/${encodeURIComponent(business.slug)}`;

  async function shareBusiness() {
    const url = new URL(publicPath, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, text: `View ${business.name} on Comynity`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setCopied(false);
    }
  }

  return <article className="bg-white p-3">
    <div className="flex min-w-0 gap-2.5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><Image src={!imageFailed && business.media.thumbnail ? business.media.thumbnail : "/images/default.jpg"} alt="" fill sizes="56px" className="object-cover" onError={() => setImageFailed(true)} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1"><h3 className="truncate text-sm font-extrabold text-foreground">{business.name}</h3>{business.is_verified && <i className="fa-solid fa-badge-check shrink-0 text-xs text-brand" title="Verified" aria-label="Verified" />}</div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{business.publication_status.replaceAll("_", " ")}</span>
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-foreground-muted">{category}</p>
      </div>
    </div>
    <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2.5">
      <CardAction href={publicPath} icon="fa-eye" label="View" />
      <CardAction href={`${publicPath}/manage/dashboard`} icon="fa-gear" label="Manage" />
      <CardAction onClick={shareBusiness} icon={copied ? "fa-check" : "fa-share-nodes"} label={copied ? "Copied" : "Share"} />
    </div>
  </article>;
}

function CardAction({ href, icon, label, onClick }: { href?: string; icon: string; label: string; onClick?: () => void }) {
  const className = "flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-2 text-[11px] font-extrabold text-brand transition hover:bg-brand-100";
  const content = <><i className={`fa-solid ${icon}`} aria-hidden="true" /><span>{label}</span></>;
  if (href) return <Link href={href} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} className={className}>{content}</button>;
}

function BusinessListSkeleton() {
  return <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading businesses">{[0, 1].map((item) => <div key={item} className="flex animate-pulse gap-2.5 rounded-xl border border-slate-100 p-2.5"><div className="size-14 rounded-lg bg-slate-100" /><div className="flex-1 py-1"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-100" /></div></div>)}</div>;
}
