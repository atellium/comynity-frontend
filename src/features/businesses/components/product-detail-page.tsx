"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Handshake, MapPin, Phone, Share2, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheetModal } from "@/components/modals";
import { SaveButton } from "@/features/saved-items";
import { getBusinessNameBySlug, getBusinessProducts, getProductBySlug } from "../business.service";
import { getDemoBusinessProductsPage, getDemoProductBySlug } from "../demo-products";
import { ProductImageGallery } from "./product-image-gallery";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

function displayPrice(price: string, maxPrice: string | null, priceType: string) {
  if (priceType === "ask") return "Ask for price";
  const number = Number(price);
  const value = Number.isFinite(number) ? money.format(number) : price;
  if (priceType === "starts_from") return `From ${value}`;
  if (priceType === "range" && maxPrice) {
    const maximum = Number(maxPrice);
    return `${value} – ${Number.isFinite(maximum) ? money.format(maximum) : maxPrice}`;
  }
  return value;
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const isDemoProduct = slug.startsWith("demo-");
  const query = useQuery({
    queryKey: ["product", "detail", slug],
    queryFn: async () => {
      if (isDemoProduct) {
        const demoProduct = getDemoProductBySlug(slug);
        if (demoProduct) return demoProduct;
      }
      try {
        return await getProductBySlug(slug);
      } catch (error) {
        const demoProduct = getDemoProductBySlug(slug);
        if (!demoProduct || !axios.isAxiosError(error) || error.response?.status !== 404) throw error;
        return demoProduct;
      }
    },
  });
  const similarCategory = query.data?.categories[0];
  const similarProductsQuery = useQuery({
    queryKey: ["business", query.data?.business.slug, "products", "similar", similarCategory?.slug],
    queryFn: () => getBusinessProducts(query.data?.business.slug ?? "", { category: similarCategory?.slug, pageSize: 6 }),
    enabled: Boolean(!isDemoProduct && query.data?.business.slug && similarCategory?.slug),
    select: (data) => data.results.filter((item) => item.slug !== slug).slice(0, 4),
  });
  const businessContactQuery = useQuery({
    queryKey: ["business", "detail", query.data?.business.slug],
    queryFn: () => getBusinessNameBySlug(query.data?.business.slug ?? ""),
    enabled: Boolean(!isDemoProduct && query.data?.business.slug),
  });
  const error = axios.isAxiosError(query.error) ? String(query.error.response?.data?.detail ?? query.error.message) : query.error instanceof Error ? query.error.message : "Unable to load this product.";

  if (query.isPending) return <ProductDetailSkeleton />;
  if (query.isError) return <div className="min-h-dvh bg-white"><button type="button" onClick={() => router.back()} className="m-3 flex size-10 items-center justify-center text-brand" aria-label="Go back"><ArrowLeft size={25} /></button><div className="px-page py-20 text-center"><Store className="mx-auto text-foreground-subtle" size={42} /><h1 className="mt-4 text-lg font-extrabold">Couldn’t load product</h1><p className="mt-2 text-sm text-foreground-muted">{error}</p><button type="button" onClick={() => void query.refetch()} className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Try again</button></div></div>;

  const product = query.data;
  const price = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const discount = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const isBargainAvailable = product.specifications.is_bargain === true;
  const highlightedFields = product.custom_fields;
  const demoSimilarProducts = businessContactQuery.data && slug.startsWith("demo-")
    ? (getDemoBusinessProductsPage(businessContactQuery.data, similarCategory?.slug)?.results ?? []).filter((item) => item.slug !== slug).slice(0, 4)
    : [];
  const similarProducts = similarProductsQuery.data?.length ? similarProductsQuery.data : demoSimilarProducts;
  const whatsappNumber = businessContactQuery.data?.contact.whatsapp?.replace(/\D/g, "") ?? "";
  const phoneNumber = businessContactQuery.data?.contact.phone?.replace(/\D/g, "") ?? "";
  const businessLocation = businessContactQuery.data?.location;
  const businessAddress = businessLocation
    ? [businessLocation.address, businessLocation.landmark, businessLocation.locality, businessLocation.city.name, businessLocation.city.state, businessLocation.postal_code]
        .filter((part): part is string => Boolean(part?.trim()))
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(", ")
    : [product.business.locality, product.business.city.name].filter(Boolean).join(", ");
  const coordinates = businessLocation?.coordinates;
  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`
    : "";
  const contactLabel = product.price_type === "ask" ? "Ask for price" : "More info";

  function contactBusiness() {
    if (whatsappNumber) {
      const message = `Hello, can I get more info on this product\n\n${window.location.href}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (phoneNumber) window.location.href = `tel:${phoneNumber}`;
  }

  async function shareProduct() {
    const url = window.location.href;
    const text = `Check out ${product.name} on Comynity:\n${url}`;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobile || !navigator.share) {
      setShareUrl(url);
      setCopied(false);
      setShareOpen(true);
      return;
    }

    try {
      await navigator.share({ title: product.name, text });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
    }
  }

  async function copyShareLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = shareUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const didCopy = document.execCommand("copy");
        input.remove();
        if (!didCopy) return;
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return <div className="min-h-dvh bg-white dark:bg-surface-dark">
    <main className="mx-auto max-w-3xl pb-32">
      <div className="relative"><button type="button" onClick={() => router.back()} className="absolute left-3 top-[calc(env(safe-area-inset-top)+12px)] z-30 flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur" aria-label="Go back"><ArrowLeft size={22} /></button><div className="absolute right-3 top-[calc(env(safe-area-inset-top)+12px)] z-30 flex gap-2"><button type="button" onClick={() => void shareProduct()} aria-label="Share product" className="flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur"><Share2 size={20} aria-hidden="true" /></button><SaveButton itemType="product" objectId={product.id} className="flex size-10 items-center justify-center rounded-full bg-white/90 text-brand shadow-md backdrop-blur" /></div><ProductImageGallery images={product.images} productName={product.name} highlights={highlightedFields} /></div>
      {product.variants.length > 0 && <section className="px-page py-1" aria-label="Product variants"><div className="space-y-1">{product.variants.map((variant) => <div key={`${variant.name}-${variant.type}`} className="flex items-baseline gap-2 text-xs leading-5"><h2 className="shrink-0 font-bold text-foreground-muted dark:text-foreground-dark-muted">{variant.name}:</h2><p className="text-sm text-foreground-secondary dark:text-foreground-dark-secondary">{variant.values.map((option) => `${option.value}${option.unit ? ` ${option.unit}` : ""}`).join(", ")}</p></div>)}</div></section>}
      <div className={`px-page ${product.images.length <= 1 ? "pt-3" : ""}`}>
        <h1 className="text-xl font-extrabold leading-snug text-foreground dark:text-foreground-dark">{product.name}</h1>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2"><span className="text-lg font-extrabold text-brand">{displayPrice(product.price, product.max_price, product.price_type)}</span>{product.price_type === "fixed" && originalPrice && Number.isFinite(originalPrice) && <span className="text-xs font-semibold text-foreground-muted line-through">{money.format(originalPrice)}</span>}{product.price_type === "fixed" && discount > 0 && <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-extrabold text-success-700">{discount}% off</span>}</div>
        {isBargainAvailable && <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-success-700 dark:text-success-400"><Handshake size={14} aria-hidden="true" />Bargaining available</p>}
      </div>

      {(product.description || product.custom_fields.length > 0) && <section className="mt-3"><div className="mx-page border-t border-border-subtle dark:border-border-dark-subtle" /><div className="px-page pt-3"><h2 className="text-base font-extrabold">Product details</h2>{product.description && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground-secondary dark:text-foreground-dark-secondary">{product.description}</p>}{product.custom_fields.length > 0 && <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">{product.custom_fields.map((field, index) => <div key={`${field.title}-${index}`}><dt className="text-xs text-foreground-muted dark:text-foreground-dark-muted">{field.title}</dt><dd className="mt-1 text-sm font-semibold text-foreground dark:text-foreground-dark">{field.value}</dd></div>)}</dl>}</div></section>}
      <section className="mx-page mt-6 overflow-hidden rounded-xl border border-border-subtle bg-surface dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
        <Link href={`/business/${encodeURIComponent(product.business.slug)}`} className="flex min-w-0 items-center gap-3 p-3 transition-colors hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary">{product.business.thumbnail ? <Image src={product.business.thumbnail} alt="" fill sizes="44px" className="object-cover" /> : <Store className="m-3 text-foreground-muted" size={20} />}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{product.business.name}</p><p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-foreground-muted"><MapPin size={12} className="shrink-0" aria-hidden="true" /><span className="min-w-0 truncate">{businessAddress}</span></p></div>
          <i className="fa-solid fa-chevron-right shrink-0 text-xs text-foreground-subtle" aria-hidden="true" />
        </Link>
        <div className="grid grid-cols-3 border-t border-border-subtle dark:border-border-dark-subtle">
          <BusinessShortcut href={phoneNumber ? `tel:${phoneNumber}` : undefined} icon="fa-phone" label="Call" />
          <BusinessShortcut href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined} icon="fa-whatsapp" label="WhatsApp" external brandIcon />
          <BusinessShortcut href={directionsUrl || undefined} icon="fa-diamond-turn-right" label="Direction" external />
        </div>
      </section>
      {similarProducts.length > 0 && <section className="mt-6"><h2 className="px-page text-base font-extrabold">Similar products</h2><div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 px-page">{similarProducts.map((item) => <article key={item.id} className="min-w-0"><Link href={`/product/${encodeURIComponent(item.slug)}`} className="block"><div className="relative aspect-square overflow-hidden rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary"><Image src={item.primary_image || "/images/default.jpg"} alt={item.name} fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover transition-transform duration-200 hover:scale-[1.02]" />{item.specifications?.is_bestseller === true && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-brand shadow-sm"><BadgeCheck size={11} aria-hidden="true" />Bestseller</span>}</div><h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-foreground dark:text-foreground-dark">{item.name}</h3>{item.variants && item.variants.length > 0 && <div className="mt-1 space-y-0.5">{item.variants.map((variant) => <p key={`${variant.name}-${variant.type}`} className="truncate text-[11px] text-foreground-muted dark:text-foreground-dark-muted"><span className="font-bold">{variant.name}:</span> {variant.values.map((option) => `${option.value}${option.unit ? ` ${option.unit}` : ""}`).join(", ")}</p>)}</div>}<p className="mt-1 text-sm font-extrabold text-foreground dark:text-foreground-dark">{displayPrice(item.price, item.max_price, item.price_type)}</p>{item.specifications?.is_bargain === true && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-success-700 dark:text-success-400"><Handshake size={12} aria-hidden="true" />Bargaining available</p>}</Link></article>)}</div></section>}
    </main>
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-white/95 px-page pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur dark:border-border-dark-subtle dark:bg-surface-dark/95"><div className="mx-auto grid max-w-3xl grid-cols-2 gap-3"><Link href={`/business/${encodeURIComponent(product.business.slug)}`} className="flex h-12 items-center justify-center rounded-xl border border-brand text-sm font-bold text-brand">Visit store</Link><button type="button" onClick={contactBusiness} disabled={!whatsappNumber && !phoneNumber} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{whatsappNumber ? <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" /> : <Phone size={18} aria-hidden="true" />}{contactLabel}</button></div></div>
    <BottomSheetModal open={shareOpen} onClose={() => setShareOpen(false)} title={`Share ${product.name}`} closeLabel="Close share options">
      <div className="px-page pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <h2 className="text-xl font-extrabold">Share this product</h2>
        <p className="mt-1 text-sm text-foreground-muted dark:text-foreground-dark-muted">Send {product.name} to friends and family.</p>
        <div className="mt-6 flex items-start justify-center gap-10">
          <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on Comynity:\n${shareUrl}`)}`} target="_blank" rel="noreferrer" className="group flex w-16 min-w-0 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-950 dark:text-emerald-300"><i className="fa-brands fa-whatsapp" aria-hidden="true" /></span><span className="text-[11px] font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">WhatsApp</span></a>
          <button type="button" onClick={copyShareLink} className="group flex w-16 min-w-0 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-lg text-brand transition-transform group-hover:scale-105 dark:bg-brand-950 dark:text-brand-300"><i className={`fa-solid ${copied ? "fa-check" : "fa-link"}`} aria-hidden="true" /></span><span className="text-[11px] font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">{copied ? "Copied" : "Copy link"}</span></button>
        </div>
      </div>
    </BottomSheetModal>
  </div>;
}

function BusinessShortcut({ href, icon, label, external = false, brandIcon = false }: { href?: string; icon: string; label: string; external?: boolean; brandIcon?: boolean }) {
  const className = "flex h-10 items-center justify-center gap-1.5 border-r border-border-subtle text-xs font-bold text-foreground-secondary transition-colors last:border-r-0 hover:bg-brand-50 hover:text-brand dark:border-border-dark-subtle dark:text-foreground-dark-secondary dark:hover:bg-brand-950/40 dark:hover:text-brand-300";
  if (!href) return <span className={`${className} cursor-not-allowed opacity-40`} aria-disabled="true"><i className={`${brandIcon ? "fa-brands" : "fa-solid"} ${icon}`} aria-hidden="true" />{label}</span>;
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className}><i className={`${brandIcon ? "fa-brands" : "fa-solid"} ${icon}`} aria-hidden="true" />{label}</a>;
}

function ProductDetailSkeleton() {
  return <div className="min-h-dvh animate-pulse bg-white"><div className="h-14 border-b border-border-subtle" /><div className="mx-auto max-w-3xl"><div className="aspect-square bg-surface-tertiary" /><div className="flex gap-2 px-page py-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="size-16 rounded-lg bg-surface-tertiary" />)}</div><div className="px-page"><div className="mt-3 h-7 w-4/5 rounded bg-surface-tertiary" /><div className="mt-3 h-6 w-2/5 rounded bg-surface-tertiary" /><div className="mt-4 h-16 rounded bg-surface-tertiary" /></div></div></div>;
}
