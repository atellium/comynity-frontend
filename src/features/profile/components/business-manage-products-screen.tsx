"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { BottomSheetModal } from "@/components/modals";
import { getBusinessProducts, type BusinessProduct } from "@/features/businesses";
import { deleteCatalog } from "../profile.service";

export function BusinessManageProductsScreen({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [deleteProduct, setDeleteProduct] = useState<BusinessProduct | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["businesses", slug, "manage-products", page], queryFn: () => getBusinessProducts(slug, { page }) });
  const remove = useMutation({ mutationFn: (catalogSlug: string) => deleteCatalog(slug, catalogSlug), onSuccess: async () => { setDeleteProduct(null); await queryClient.invalidateQueries({ queryKey: ["businesses", slug, "manage-products"] }); } });

  function changePage(nextPage: number) { setPage(nextPage); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="min-h-dvh bg-slate-50 pb-10">
    <MobileHeader title="Products" subtitle={query.data?.business.name ?? "Loading business…"} />
    <main className="mx-auto w-full max-w-3xl px-page pt-5">
      {query.data && <section className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><div><p className="text-xs font-semibold text-foreground-muted">Total products</p><p className="mt-1 text-2xl font-extrabold text-foreground">{query.data.pagination.total_items}</p></div><Link href={`/business/${encodeURIComponent(slug)}/manage/products/add`} className="flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-xs font-extrabold text-white"><i className="fa-solid fa-plus" aria-hidden="true" />Add product</Link></section>}
      {query.isPending && <ProductListSkeleton />}
      {query.isError && <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-danger"><p className="font-semibold">Couldn&apos;t load products.</p><button type="button" onClick={() => void query.refetch()} className="mt-2 font-extrabold underline">Try again</button></div>}
      {query.data?.results.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center"><i className="fa-solid fa-box-open text-2xl text-brand" aria-hidden="true" /><p className="mt-3 text-sm font-extrabold text-foreground">No products found</p></div>}
      {query.data && query.data.results.length > 0 && <><div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">{query.data.results.map((product) => <ProductRow key={product.id} product={product} businessSlug={slug} onDelete={() => setDeleteProduct(product)} />)}</div>{query.data.pagination.total_pages > 1 && <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Product pagination"><button type="button" disabled={!query.data.pagination.has_previous || query.isFetching} onClick={() => changePage(page - 1)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold disabled:opacity-40"><i className="fa-solid fa-chevron-left mr-2" />Previous</button><span className="text-xs font-semibold text-foreground-muted">Page {query.data.pagination.page} of {query.data.pagination.total_pages}</span><button type="button" disabled={!query.data.pagination.has_next || query.isFetching} onClick={() => changePage(page + 1)} className="h-10 rounded-xl bg-brand px-4 text-xs font-extrabold text-white disabled:opacity-40">Next<i className="fa-solid fa-chevron-right ml-2" /></button></nav>}</>}
    </main>
    <DeleteSheet product={deleteProduct} pending={remove.isPending} onClose={() => setDeleteProduct(null)} onConfirm={() => deleteProduct && remove.mutate(deleteProduct.slug)} />
  </div>;
}

function ProductRow({ product, businessSlug, onDelete }: { product: BusinessProduct; businessSlug: string; onDelete: () => void }) {
  const categories = product.categories?.slice(0, 2).map((category) => category.display_name).join(" · ") || "Uncategorized";
  const editHref = `/business/${encodeURIComponent(businessSlug)}/manage/products/${encodeURIComponent(product.slug)}/edit`;
  const imagesHref = `/business/${encodeURIComponent(businessSlug)}/manage/products/${encodeURIComponent(product.slug)}/images`;
  return <article className="border-b border-slate-100 p-4 last:border-b-0"><div className="flex items-center gap-3"><div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100"><Image src={product.primary_image || "/images/default.jpg"} alt="" fill sizes="56px" className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="truncate text-sm font-extrabold text-foreground">{product.name}</h2><p className="shrink-0 text-sm font-extrabold text-brand">{formatPrice(product)}</p></div><p className="mt-1 truncate text-xs font-semibold text-foreground-muted">{categories}</p></div></div><div className="mt-3 grid grid-cols-3 gap-2"><Link href={imagesHref} className="flex h-8 items-center justify-center gap-1 rounded-lg bg-brand-50 text-[10px] font-extrabold text-brand"><i className="fa-solid fa-images" />Edit images</Link><Link href={editHref} className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand-50 text-[11px] font-extrabold text-brand"><i className="fa-solid fa-pen" />Edit</Link><button type="button" onClick={onDelete} className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-red-50 text-[11px] font-extrabold text-danger"><i className="fa-solid fa-trash" />Delete</button></div></article>;
}

function DeleteSheet({ product, pending, onClose, onConfirm }: { product: BusinessProduct | null; pending: boolean; onClose: () => void; onConfirm: () => void }) {
  return <BottomSheetModal open={Boolean(product)} onClose={() => !pending && onClose()} title="Delete product" closeLabel="Close delete confirmation"><div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6"><h2 className="text-lg font-extrabold">Delete product?</h2><p className="mt-2 text-sm text-foreground-muted">{product?.name} will be permanently deleted. This action cannot be undone.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={pending} onClick={onClose} className="h-11 rounded-xl border border-slate-200 text-sm font-extrabold">Cancel</button><button type="button" disabled={pending} onClick={onConfirm} className="h-11 rounded-xl bg-danger text-sm font-extrabold text-white disabled:opacity-60">{pending ? "Deleting…" : "Delete"}</button></div></div></BottomSheetModal>;
}

function formatPrice(product: BusinessProduct) { const price = formatCurrency(product.price); if (product.price_type === "range" && product.max_price) return `${price} – ${formatCurrency(product.max_price)}`; if (product.price_type === "starts_from") return `From ${price}`; if (product.price_type === "ask") return "Ask price"; return price; }
function formatCurrency(value: string) { const amount = Number(value); return Number.isFinite(amount) ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount) : value; }
function ProductListSkeleton() { return <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white" aria-label="Loading products">{[0, 1, 2, 3].map((item) => <div key={item} className="flex animate-pulse justify-between border-b border-slate-100 p-4"><div className="w-2/3"><div className="h-4 w-3/4 rounded bg-slate-100" /><div className="mt-2 h-3 w-1/2 rounded bg-slate-100" /></div><div className="h-4 w-16 rounded bg-slate-100" /></div>)}</div>; }
