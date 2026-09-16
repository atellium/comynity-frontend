"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BadgeCheck, LoaderCircle, MapPin, Store } from "lucide-react";
import axios from "axios";
import MobileHeader from "@/components/layout/MobileHeader";
import { LocationButton } from "@/features/location";
import { SaveButton } from "@/features/saved-items";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppSelector } from "@/store/hooks";
import { getProducts } from "../business.service";
import type { BusinessProduct, ProductListImage } from "../business.types";

const priceFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function labelFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function displayPrice(price: string, priceType: string, maxPrice?: string | null) {
  if (priceType === "ask") return "Ask for price";
  const number = Number(price);
  const value = Number.isFinite(number) ? priceFormatter.format(number) : price;
  if (priceType === "starts_from") return `From ${value}`;
  if (priceType === "range" && maxPrice) {
    const maximum = Number(maxPrice);
    return `${value} - ${Number.isFinite(maximum) ? priceFormatter.format(maximum) : maxPrice}`;
  }
  return value;
}

export function ProductListPage({ categorySlug }: { city: string; locality: string; categorySlug: string }) {
  const hydrated = useHydrated();
  const { lat, lng, locality, city } = useAppSelector((state) => state.location);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const query = useInfiniteQuery({
    queryKey: ["products", categorySlug, lat, lng],
    queryFn: ({ pageParam }) => getProducts({ lat: lat!, lng: lng!, category: categorySlug, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (page) => page.pagination.has_next ? page.pagination.page + 1 : undefined,
    enabled: hydrated && lat !== null && lng !== null,
  });
  const products = useMemo(() => query.data?.pages.flatMap((page) => page.results) ?? [], [query.data]);
  const categoryLabel = query.data?.pages[0]?.category?.label || query.data?.pages[0]?.category?.display_name || labelFromSlug(categorySlug);
  const error = axios.isAxiosError(query.error) ? query.error.response?.data?.detail ?? query.error.message : "Unable to load products.";

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    }, { rootMargin: "300px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [query]);

  return <div className="min-h-dvh bg-white pb-10"><MobileHeader title={categoryLabel} subtitle={locality && city ? `Near ${locality}, ${city}` : "Products near you"} /><main className="mx-auto w-full max-w-3xl px-page pt-4">{!hydrated ? <ProductGridSkeleton /> : lat === null || lng === null ? <LocationPrompt /> : query.isPending ? <ProductGridSkeleton /> : query.isError ? <div role="alert" className="rounded-2xl bg-red-50 p-5 text-center text-sm text-danger"><p>{String(error)}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 font-extrabold underline">Try again</button></div> : products.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><Store size={34} className="mx-auto text-foreground-subtle" /><h2 className="mt-3 text-sm font-extrabold">No products found</h2><p className="mt-1 text-xs text-foreground-muted">Try another category or location.</p></div> : <div className="grid grid-cols-2 gap-x-3 gap-y-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}<div ref={loadMoreRef} className="flex h-20 items-center justify-center" aria-live="polite">{query.isFetchingNextPage && <><LoaderCircle size={20} className="animate-spin text-brand" /><span className="ml-2 text-sm font-semibold text-foreground-muted">Loading more</span></>}{!query.hasNextPage && products.length > 0 && <span className="text-xs font-semibold text-foreground-subtle">You&apos;ve reached the end</span>}</div></main></div>;
}

function ProductCard({ product }: { product: BusinessProduct }) {
  const business = product.business;
  const location = [business?.locality, business?.city?.name].filter(Boolean).join(", ");
  return <article className="relative min-w-0"><SaveButton itemType="product" objectId={product.id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm" /><Link href={`/product/${encodeURIComponent(product.slug)}`} className="block"><div className="relative aspect-square overflow-hidden rounded-xl border border-black/5 bg-surface-tertiary shadow-[0_1px_4px_rgba(15,23,42,0.06)]"><Image src={productImage(product)} alt={product.name} fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover transition-transform duration-200 hover:scale-[1.02]" />{product.is_featured && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-brand shadow-sm"><BadgeCheck size={11} aria-hidden="true" />Featured</span>}</div><h2 className="mt-2 line-clamp-2 text-base font-normal leading-5 text-foreground">{product.name}</h2><p className="mt-1 text-xs font-extrabold text-foreground">{displayPrice(product.price, product.price_type, product.max_price)}</p>{business?.name && <div className="mt-2 flex min-w-0 items-center gap-2"><span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-tertiary text-foreground-muted">{business.media?.cover_image || business.media?.thumbnail ? <Image src={business.media.cover_image || business.media.thumbnail || ""} alt="" fill sizes="28px" className="object-cover" /> : <Store size={14} aria-hidden="true" />}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-foreground-secondary">{business.name}</span>{location && <span className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-muted"><MapPin size={10} className="shrink-0" aria-hidden="true" /><span className="truncate">{location}</span></span>}</span></div>}</Link></article>;
}

function productImage(product: BusinessProduct) {
  return imageUrl(product.images?.[0]) || product.primary_image || "/images/default.jpg";
}

function imageUrl(image: ProductListImage | undefined) {
  if (!image) return null;
  return typeof image === "string" ? image : image.upload.url;
}

function LocationPrompt() {
  return <div className="rounded-2xl border border-slate-100 bg-white p-7 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand"><i className="fa-solid fa-location-dot" /></span><h2 className="mt-3 text-sm font-extrabold">Choose your location</h2><p className="mt-1 text-xs text-foreground-muted">Select an area to discover products near you.</p><LocationButton className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Choose location</LocationButton></div>;
}

function ProductGridSkeleton() {
  return <div className="grid animate-pulse grid-cols-2 gap-3">{Array.from({ length: 8 }, (_, index) => <div key={index}><div className="aspect-square rounded-xl bg-surface-tertiary" /><div className="mt-2 h-4 w-4/5 rounded bg-surface-tertiary" /><div className="mt-2 h-4 w-1/2 rounded bg-surface-tertiary" /></div>)}</div>;
}
