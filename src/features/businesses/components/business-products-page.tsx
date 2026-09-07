"use client";

import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, ChevronRight, Handshake, LoaderCircle, MapPin, SlidersHorizontal, Store, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModal } from "@/components/modals";
import { SiteLoader } from "@/components/loaders";
import { SaveButton } from "@/features/saved-items";
import { getBusinessNameBySlug, getBusinessProducts } from "../business.service";
import { getDemoBusinessProductsPage } from "../demo-products";

const PRICE_CAP = 100000;
const PRICE_STEP = 100;
const SHOW_PRODUCT_FILTERS = false;
const priceFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function priceValue(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.min(number, PRICE_CAP) : fallback;
}

function displayPrice(price: string, priceType: string, maxPrice?: string | null) {
  if (priceType === "ask") return "Ask for price";
  const number = Number(price);
  const value = Number.isFinite(number) ? priceFormatter.format(number) : price;
  if (priceType === "starts_from") return `From ${value}`;
  if (priceType === "range" && maxPrice) {
    const maximum = Number(maxPrice);
    return `${value} – ${Number.isFinite(maximum) ? priceFormatter.format(maximum) : maxPrice}`;
  }
  return value;
}

function labelFromSlug(slug?: string) {
  if (!slug) return "Products";
  return slug.split("-").filter(Boolean).map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
}

export function BusinessProductsPage({ businessSlug, categorySlug }: { businessSlug: string; categorySlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const restoredScrollRef = useRef(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const appliedMin = searchParams.get("min_price") ?? "";
  const appliedMax = searchParams.get("max_price") ?? "";
  const [minPrice, setMinPrice] = useState(() => priceValue(appliedMin, 0));
  const [maxPrice, setMaxPrice] = useState(() => priceValue(appliedMax, PRICE_CAP));
  const isFeatured = searchParams.get("is_featured") === "true";
  const sortBy = searchParams.get("sort_by") === "name" ? "name" : searchParams.get("sort_by") === "price" ? "price" : undefined;
  const sortOrder = searchParams.get("sort_order") === "desc" ? "desc" : searchParams.get("sort_order") === "asc" ? "asc" : undefined;
  const filterKey = [appliedMin, appliedMax, isFeatured, sortBy, sortOrder].join(":");
  const filterCount = Number(Boolean(appliedMin || appliedMax)) + Number(isFeatured) + Number(Boolean(sortBy));
  const selectedRangeStart = (minPrice / PRICE_CAP) * 100;
  const selectedRangeEnd = (maxPrice / PRICE_CAP) * 100;

  const query = useInfiniteQuery({
    queryKey: ["business", businessSlug, "products", categorySlug, filterKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getBusinessProducts(businessSlug, { category: categorySlug, minPrice: appliedMin || undefined, maxPrice: appliedMax || undefined, isFeatured, sortBy, sortOrder, page: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage) => lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
  });
  const products = useMemo(() => query.data?.pages.flatMap((page) => page.results) ?? [], [query.data]);
  const data = query.data?.pages[0];
  const businessQuery = useQuery({
    queryKey: ["business", "detail", data?.business.slug],
    queryFn: () => getBusinessNameBySlug(data?.business.slug ?? ""),
    enabled: Boolean(data?.business.slug),
  });
  const demoData = query.isSuccess && products.length === 0 && businessQuery.data ? getDemoBusinessProductsPage(businessQuery.data, categorySlug) : null;
  const displayData = products.length > 0 ? data : demoData;
  const displayProducts = products.length > 0 ? products : demoData?.results ?? [];
  const displayCategories = displayData?.categories ?? [];
  const currentCategory = displayCategories.find((category) => category.slug === categorySlug);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useLayoutEffect(() => {
    if (!query.isSuccess || restoredScrollRef.current) return;
    restoredScrollRef.current = true;
    const key = `product-list-scroll:${window.location.pathname}${window.location.search}`;
    const savedPosition = sessionStorage.getItem(key);
    if (savedPosition === null) return;
    sessionStorage.removeItem(key);
    const scrollTop = Number(savedPosition);
    if (!Number.isFinite(scrollTop)) return;
    window.scrollTo({ top: scrollTop, behavior: "instant" });
  }, [query.isSuccess]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage();
    }, { rootMargin: "400px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  function replaceParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const value = params.toString();
    router.replace(`${window.location.pathname}${value ? `?${value}` : ""}`);
  }

  function openFilters() {
    setMinPrice(priceValue(appliedMin, 0));
    setMaxPrice(priceValue(appliedMax, PRICE_CAP));
    setFiltersOpen(true);
  }

  function applyFilters() {
    replaceParams({ min_price: minPrice > 0 ? String(minPrice) : undefined, max_price: maxPrice < PRICE_CAP ? String(maxPrice) : undefined });
    setFiltersOpen(false);
  }

  function clearFilters() {
    setMinPrice(0);
    setMaxPrice(PRICE_CAP);
    replaceParams({ min_price: undefined, max_price: undefined, is_featured: undefined, sort_by: undefined, sort_order: undefined });
    setFiltersOpen(false);
  }

  function categoryHref(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("page");
    const path = `/business/${encodeURIComponent(businessSlug)}/products/${encodeURIComponent(slug)}`;
    return `${path}${params.size ? `?${params.toString()}` : ""}`;
  }

  function rememberScrollPosition() {
    const key = `product-list-scroll:${window.location.pathname}${window.location.search}`;
    sessionStorage.setItem(key, String(window.scrollY));
  }

  const error = axios.isAxiosError(query.error) ? String(query.error.response?.data?.detail ?? query.error.message) : query.error instanceof Error ? query.error.message : "Unable to load products.";

  return <div className="min-h-dvh bg-white dark:bg-surface-dark">
    <header className="sticky top-0 z-40 bg-white/95 px-page py-2.5 backdrop-blur dark:bg-surface-dark/95">
      <div className="mx-auto flex h-12 max-w-3xl items-center gap-2">
        <button type="button" onClick={() => router.back()} aria-label="Go back" className="flex size-10 items-center justify-center text-brand"><ArrowLeft size={25} /></button>
        <div className="min-w-0 flex-1"><h1 className="truncate text-lg font-extrabold text-foreground dark:text-foreground-dark">{currentCategory?.display_name ?? labelFromSlug(categorySlug)}</h1>{displayData?.business.name && <p className="truncate text-xs text-foreground-muted dark:text-foreground-dark-muted">{displayData.business.name}</p>}</div>
      </div>
    </header>

    <main className="mx-auto w-full max-w-3xl bg-white pb-10 dark:bg-surface-dark">
      {!categorySlug && displayCategories.length > 0 && <nav className="hide-scrollbar flex gap-2 overflow-x-auto bg-white px-page pt-3 dark:bg-surface-dark" aria-label="Product categories">{displayCategories.map((category) => <Link key={category.id} href={categoryHref(category.slug)} onClick={() => setCategoryLoading(true)} className={`flex shrink-0 items-center gap-2 rounded-full border border-border bg-white py-1.5 pr-3.5 text-xs font-bold dark:border-border-dark dark:bg-surface-dark ${category.image ? "pl-1.5" : "pl-3.5"}`}>{category.image && <span className="relative size-6 shrink-0 overflow-hidden rounded-full"><Image src={category.image} alt="" fill sizes="24px" className="object-cover" /></span>}{category.display_name}</Link>)}</nav>}
      {SHOW_PRODUCT_FILTERS && <div className="hide-scrollbar flex gap-2 overflow-x-auto border-b border-border-subtle bg-white px-page py-3 dark:border-border-dark-subtle dark:bg-surface-dark" aria-label="Quick product filters">
        <div className={`flex shrink-0 items-center overflow-hidden rounded-full border ${filterCount ? "border-brand bg-brand-50 text-brand dark:bg-brand-950" : "border-border text-foreground-secondary dark:border-border-dark dark:text-foreground-dark-secondary"}`}>
          <button type="button" onClick={openFilters} className="flex items-center gap-1.5 py-1.5 pl-3 pr-2 text-xs font-bold"><SlidersHorizontal size={13} />Filters{filterCount > 0 && <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[9px] text-white">{filterCount}</span>}</button>
          {filterCount > 0 && <button type="button" onClick={clearFilters} aria-label="Clear all filters" className="flex h-7 w-7 items-center justify-center border-l border-brand-200 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:hover:bg-brand-900"><X size={12} /></button>}
        </div>
        <button type="button" aria-pressed={isFeatured} onClick={() => replaceParams({ is_featured: isFeatured ? undefined : "true" })} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${isFeatured ? "border-brand bg-brand text-white" : "border-border text-foreground-secondary dark:border-border-dark dark:text-foreground-dark-secondary"}`}><BadgeCheck size={13} aria-hidden="true" />Bestseller{isFeatured && <X size={12} aria-hidden="true" />}</button>
      </div>}
      {query.isPending && <ProductGridSkeleton />}
      {query.isError && <StateMessage title="Couldn’t load products" message={error} action={() => void query.refetch()} />}
      {query.isSuccess && displayProducts.length === 0 && <StateMessage title="No products found" message="Try changing or clearing the selected filters." />}
      {displayProducts.length > 0 && <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-page py-4">{displayProducts.map((product) => <article key={product.id} className="relative min-w-0"><SaveButton itemType="product" objectId={product.id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm" /><Link href={`/product/${encodeURIComponent(product.slug)}`} onClick={rememberScrollPosition} className="block"><div className="relative aspect-square overflow-hidden rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary"><Image src={product.primary_image || "/images/default.jpg"} alt={product.name} fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover transition-transform duration-200 hover:scale-[1.02]" />{product.specifications?.is_bestseller === true && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-brand shadow-sm"><BadgeCheck size={11} aria-hidden="true" />Bestseller</span>}</div><h2 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-foreground dark:text-foreground-dark">{product.name}</h2>{product.variants && product.variants.length > 0 && <div className="mt-1 space-y-0.5">{product.variants.map((variant) => <p key={`${variant.name}-${variant.type}`} className="truncate text-[11px] text-foreground-muted dark:text-foreground-dark-muted"><span className="font-bold">{variant.name}:</span> {variant.values.map((option) => `${option.value}${option.unit ? ` ${option.unit}` : ""}`).join(", ")}</p>)}</div>}<p className="mt-1 text-sm font-extrabold text-foreground dark:text-foreground-dark">{displayPrice(product.price, product.price_type, product.max_price)}</p>{product.specifications?.is_bargain === true && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-success-700 dark:text-success-400"><Handshake size={12} aria-hidden="true" />Bargaining available</p>}</Link></article>)}</div>}
      <div ref={loadMoreRef} className="flex min-h-20 items-center justify-center px-page py-4 [overflow-anchor:none]" aria-live="polite">{query.isFetchingNextPage && <><LoaderCircle size={20} className="animate-spin text-brand" /><span className="ml-2 text-sm font-semibold text-foreground-muted">Loading more</span></>}{!query.hasNextPage && displayProducts.length > 0 && displayData && <MiniBusinessCard business={businessQuery.data} fallback={displayData.business} />}</div>
    </main>

    {categoryLoading && <SiteLoader label="Loading category products" />}

    {SHOW_PRODUCT_FILTERS && <BottomSheetModal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Product filters" closeLabel="Close product filters">
      <section className="px-page pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5">
        <h2 className="text-xl font-extrabold text-foreground dark:text-foreground-dark">Filters</h2>
        <div className="mt-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Price range</h3><span className="text-sm font-extrabold text-brand">{priceFormatter.format(minPrice)} – {maxPrice === PRICE_CAP ? `${priceFormatter.format(PRICE_CAP)}+` : priceFormatter.format(maxPrice)}</span></div>
          <div className="relative mt-7 h-8" aria-label="Price range">
            <div className="absolute top-3 h-1.5 w-full rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary" />
            <div className="absolute top-3 h-1.5 rounded-full bg-brand" style={{ left: `${selectedRangeStart}%`, right: `${100 - selectedRangeEnd}%` }} />
            <input type="range" aria-label="Minimum price" min="0" max={PRICE_CAP} step={PRICE_STEP} value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - PRICE_STEP))} className="pointer-events-none absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-1.5 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow" />
            <input type="range" aria-label="Maximum price" min="0" max={PRICE_CAP} step={PRICE_STEP} value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + PRICE_STEP))} className="pointer-events-none absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-1.5 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow" />
          </div>
        </div>
        <label className="mt-5 flex items-center justify-between border-t border-border-subtle pt-5 text-sm font-bold dark:border-border-dark-subtle"><span className="flex items-center gap-1.5"><BadgeCheck size={16} className="text-brand" aria-hidden="true" />Bestsellers only</span><input type="checkbox" checked={isFeatured} onChange={(event) => replaceParams({ is_featured: event.target.checked ? "true" : undefined })} className="size-5 accent-brand" /></label>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-subtle pt-5"><label className="text-xs font-bold text-foreground-secondary">Sort by<select value={sortBy ?? ""} onChange={(event) => replaceParams({ sort_by: event.target.value || undefined, sort_order: event.target.value ? (sortOrder ?? "asc") : undefined })} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-input px-3 text-sm"><option value="">Default</option><option value="price">Price</option><option value="name">Name</option></select></label><label className="text-xs font-bold text-foreground-secondary">Order<select value={sortOrder ?? "asc"} disabled={!sortBy} onChange={(event) => replaceParams({ sort_order: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-input px-3 text-sm disabled:opacity-50"><option value="asc">Ascending</option><option value="desc">Descending</option></select></label></div>
        <div className="mt-6 flex gap-2"><button type="button" onClick={clearFilters} className="h-11 flex-1 rounded-xl border border-border text-sm font-bold">Clear</button><button type="button" onClick={applyFilters} className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-white">Apply filters</button></div>
      </section>
    </BottomSheetModal>}
  </div>;
}

function MiniBusinessCard({ business, fallback }: { business: Awaited<ReturnType<typeof getBusinessNameBySlug>> | undefined; fallback: { id: string; name: string; slug: string } }) {
  const address = business ? [business.location.locality, business.location.city.name].filter(Boolean).join(", ") : "";
  return <Link href={`/business/${encodeURIComponent(fallback.slug)}`} className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface p-2.5 transition-colors hover:border-brand-200 hover:bg-surface-secondary dark:border-border-dark-subtle dark:bg-surface-dark-secondary dark:hover:border-brand-800">
    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary">{business?.media.thumbnail ? <Image src={business.media.thumbnail} alt="" fill sizes="40px" className="object-cover" /> : <Store size={18} className="text-foreground-muted" aria-hidden="true" />}</div>
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-foreground dark:text-foreground-dark">{business?.name ?? fallback.name}</p>{address && <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-foreground-muted dark:text-foreground-dark-muted"><MapPin size={11} className="shrink-0" aria-hidden="true" /><span className="truncate">{address}</span></p>}</div>
    <ChevronRight size={16} className="shrink-0 text-foreground-subtle" aria-hidden="true" />
  </Link>;
}

function ProductGridSkeleton() {
  return <div className="grid animate-pulse grid-cols-2 gap-3 px-page py-4" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div key={index}><div className="aspect-square rounded-xl bg-surface-tertiary" /><div className="mt-2 h-4 w-4/5 rounded bg-surface-tertiary" /><div className="mt-2 h-4 w-1/2 rounded bg-surface-tertiary" /></div>)}</div>;
}

function StateMessage({ title, message, action }: { title: string; message: string; action?: () => void }) {
  return <div className="flex flex-col items-center px-5 py-20 text-center"><Store size={42} className="text-foreground-subtle" /><h2 className="mt-4 text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm text-foreground-muted">{message}</p>{action && <button type="button" onClick={action} className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Try again</button>}</div>;
}
