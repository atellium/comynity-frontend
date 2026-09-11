"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MobileHeader from "@/components/layout/MobileHeader";
import { getSavedItems } from "./saved-items.service";
import { SaveButton } from "./save-button";
import type { SavedBusiness, SavedItem, SavedProduct } from "./saved-items.types";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function SavedItemsPage() {
  const query = useQuery({ queryKey: ["saved-items"], queryFn: getSavedItems });
  const groups = groupSavedItems(query.data?.results ?? []);

  return <div className="min-h-dvh bg-white pb-10 dark:bg-surface-dark">
    <MobileHeader title="Saved" />
    <main className="mx-auto max-w-3xl px-page pt-4">
      {query.isPending && <SavedSkeleton />}
      {query.isError && <div className="py-20 text-center"><Bookmark className="mx-auto text-foreground-subtle" size={40} /><h1 className="mt-3 text-lg font-extrabold">Couldn&apos;t load saved items</h1><button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>}
      {query.isSuccess && query.data.results.length === 0 && <div className="py-20 text-center"><Bookmark className="mx-auto text-foreground-subtle" size={40} /><h1 className="mt-3 text-lg font-extrabold">Nothing saved yet</h1><p className="mt-1 text-sm text-foreground-muted">Save businesses and products to find them here.</p></div>}
      {groups.map(([type, items], index) => <SavedGroup key={type} type={type} items={items} first={index === 0} />)}
    </main>
  </div>;
}

function SavedGroup({ type, items, first }: { type: string; items: SavedItem[]; first: boolean }) {
  return <section className={first ? "" : "mt-7"}><h2 className="text-lg font-extrabold">{groupTitle(type)}</h2>{type === "product" ? <div className="mt-3 grid grid-cols-2 gap-3">{items.map((saved) => <SavedProductCard key={saved.id} saved={saved} />)}</div> : <div className="mt-3 space-y-3">{items.map((saved) => type === "business" ? <SavedBusinessCard key={saved.id} saved={saved} /> : <GenericSavedCard key={saved.id} saved={saved} />)}</div>}</section>;
}

function SavedBusinessCard({ saved }: { saved: SavedItem }) {
  const business = saved.item as SavedBusiness;
  const city = typeof business.location.city === "string" ? business.location.city : business.location.city?.name;
  return <article className="relative rounded-xl border border-border-subtle p-3 dark:border-border-dark-subtle"><SaveButton itemType="business" objectId={saved.object_id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow" /><Link href={`/business/${encodeURIComponent(business.slug)}`} className="flex gap-3"><div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary"><Image src={business.media.thumbnail || "/images/default.jpg"} alt="" fill sizes="80px" className="object-cover" /></div><div className="min-w-0 pr-8"><h3 className="truncate font-extrabold">{business.name}</h3><p className="mt-1 truncate text-xs font-semibold text-foreground-muted">{business.categories?.map((category) => category.display_name).join(" · ") || "Uncategorized"}</p><p className="mt-2 flex items-center gap-1 truncate text-xs text-foreground-muted"><MapPin size={12} />{business.location.locality}, {city}</p></div></Link></article>;
}

function SavedProductCard({ saved }: { saved: SavedItem }) {
  const product = saved.item as SavedProduct;
  return <article className="relative min-w-0"><SaveButton itemType="product" objectId={saved.object_id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow" /><Link href={`/product/${encodeURIComponent(product.slug)}`}><div className="relative aspect-square overflow-hidden rounded-xl bg-surface-tertiary"><Image src={product.primary_image || "/images/default.jpg"} alt={product.name} fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover" /></div><h3 className="mt-2 line-clamp-2 text-sm font-semibold">{product.name}</h3><p className="mt-1 truncate text-xs text-foreground-muted">{product.categories?.slice(0, 2).map((category) => category.name || category.display_name || category.label).filter(Boolean).join(" · ") || "Uncategorized"}</p><p className="mt-1 text-sm font-extrabold">{formatPrice(product)}</p></Link></article>;
}

function GenericSavedCard({ saved }: { saved: SavedItem }) {
  const name = typeof saved.item.name === "string" ? saved.item.name : groupTitle(saved.item_type).replace(/s$/, "");
  const slug = typeof saved.item.slug === "string" ? saved.item.slug : null;
  const content = <><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand"><Bookmark size={19} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold">{name}</span><span className="mt-1 block text-xs text-foreground-muted">Saved {formatDate(saved.created_at)}</span></span></>;
  return <article className="relative rounded-xl border border-border-subtle"><SaveButton itemType={saved.item_type} objectId={saved.object_id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center text-brand" />{slug ? <Link href={`/${encodeURIComponent(saved.item_type)}/${encodeURIComponent(slug)}`} className="flex items-center gap-3 p-3 pr-12">{content}</Link> : <div className="flex items-center gap-3 p-3 pr-12">{content}</div>}</article>;
}

function groupSavedItems(items: SavedItem[]) {
  const groups = new Map<string, SavedItem[]>();
  for (const item of items) groups.set(item.item_type, [...(groups.get(item.item_type) ?? []), item]);
  const priority = (type: string) => type === "business" ? 0 : type === "product" ? 1 : 2;
  return [...groups.entries()].sort(([a], [b]) => priority(a) - priority(b) || a.localeCompare(b));
}

function formatPrice(product: SavedProduct) { if (product.price_type === "ask") return "Ask for price"; const price = Number(product.price); const value = Number.isFinite(price) ? money.format(price) : product.price; if (product.price_type === "starts_from") return `From ${value}`; if (product.price_type === "range" && product.max_price) { const max = Number(product.max_price); return `${value} – ${Number.isFinite(max) ? money.format(max) : product.max_price}`; } return value; }
function groupTitle(type: string) { return `${type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}${type.endsWith("s") ? "" : "s"}`; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date); }
function SavedSkeleton() { return <div className="animate-pulse"><div className="h-6 w-28 rounded bg-surface-tertiary" /><div className="mt-3 space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 rounded-xl bg-surface-tertiary" />)}</div></div>; }
