import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Handshake } from "lucide-react";
import { SaveButton } from "@/features/saved-items";
import type { BusinessProducts } from "../../business.types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPrice(price: string, priceType: string, maxPrice?: string | null) {
  if (priceType === "ask") return "Ask for price";
  const amount = Number(price);
  const formattedPrice = Number.isFinite(amount) ? currencyFormatter.format(amount) : price;
  if (priceType === "starts_from") return `From ${formattedPrice}`;
  if (priceType === "range" && maxPrice) {
    const maximum = Number(maxPrice);
    return `${formattedPrice} – ${Number.isFinite(maximum) ? currencyFormatter.format(maximum) : maxPrice}`;
  }
  return formattedPrice;
}

export function BusinessProductsSection({ product, businessSlug }: { product: BusinessProducts | null; businessSlug: string }) {
  const categories = product?.categories ?? [];
  const items = (product?.items ?? []).slice(0, 10);

  if (!categories.length && !items.length) return null;

  return (
    <section className="mt-5" aria-labelledby="business-products-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="business-products-heading" className="text-base font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
          Products
        </h2>
        <Link
          href={`/business/${encodeURIComponent(businessSlug)}/products`}
          className="shrink-0 text-xs font-extrabold text-brand hover:text-brand-800 dark:text-brand-300"
        >
          Explore all products
          <i className="fa-solid fa-chevron-right ml-1 text-[9px]" aria-hidden="true" />
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="-mx-page mt-2.5 flex gap-2 overflow-x-auto px-page pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Product categories">
          {categories.map((category) => (
            <Link key={category.id} href={`/business/${encodeURIComponent(businessSlug)}/products/${encodeURIComponent(category.slug)}`} className={`flex shrink-0 items-center gap-2 rounded-full border border-border bg-white py-1.5 pr-3.5 text-xs font-bold dark:border-border-dark dark:bg-surface-dark ${category.image ? "pl-1.5" : "pl-3.5"}`}>
              {category.image && <span className="relative size-6 shrink-0 overflow-hidden rounded-full"><Image src={category.image} alt="" fill sizes="24px" className="object-cover" /></span>}
              {category.display_name || category.label}
            </Link>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5">
            {items.map((item) => (
              <article key={item.id} className="relative min-w-0">
                <SaveButton itemType="product" objectId={item.id} className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm" />
                <Link href={`/product/${encodeURIComponent(item.slug)}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-black/5 bg-surface-tertiary shadow-[0_1px_4px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-surface-dark-tertiary dark:shadow-none">
                    <Image
                      src={item.primary_image || "/images/default.jpg"}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 360px"
                      className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                    />
                    {item.specifications?.is_bestseller === true && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-brand shadow-sm"><BadgeCheck size={11} aria-hidden="true" />Bestseller</span>}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-foreground dark:text-foreground-dark">{item.name}</h3>
                  {item.variants && item.variants.length > 0 && <div className="mt-1 space-y-0.5">{item.variants.map((variant) => <p key={`${variant.name}-${variant.type}`} className="truncate text-[11px] text-foreground-muted dark:text-foreground-dark-muted"><span className="font-bold">{variant.name}:</span> {variant.values.map((option) => `${option.value}${option.unit ? ` ${option.unit}` : ""}`).join(", ")}</p>)}</div>}
                  <p className="mt-1 text-sm font-extrabold text-foreground dark:text-foreground-dark">
                    {formatPrice(item.price, item.price_type, item.max_price)}
                  </p>
                  {item.specifications?.is_bargain === true && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-success-700 dark:text-success-400"><Handshake size={12} aria-hidden="true" />Bargaining available</p>}
                </Link>
              </article>
            ))}
          </div>

          <Link href={`/business/${encodeURIComponent(businessSlug)}/products`} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 active:bg-brand-900">
            View all products
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </>
      )}
    </section>
  );
}
