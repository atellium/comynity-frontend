"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/layout/MobileHeader";
import { BottomSheetModal } from "@/components/modals";
import { getProductBySlug } from "@/features/businesses/business.service";
import { createCatalog, deleteCatalog, searchCatalogCategories, updateCatalog } from "../profile.service";
import type { CatalogCategory, CatalogPayload, CatalogPriceType, EditableProduct } from "../catalog.types";

type VariantDraft = { name: string; values: string[] };
type FieldDraft = { title: string; value: string };
const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-foreground outline-none focus:border-brand";

export function CatalogEditorScreen({ businessSlug, catalogSlug }: { businessSlug: string; catalogSlug?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = Boolean(catalogSlug);
  const detail = useQuery({ queryKey: ["product", catalogSlug], queryFn: () => getProductBySlug(catalogSlug!), enabled: editing });
  const [initialized, setInitialized] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState<CatalogPriceType>("fixed");
  const [price, setPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [customFields, setCustomFields] = useState<FieldDraft[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isBargain, setIsBargain] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!detail.data || initialized) return;
    const product = detail.data as EditableProduct;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setName(product.name); setDescription(product.description ?? ""); setPriceType(product.price_type as CatalogPriceType);
      setPrice(product.price ?? ""); setMaxPrice(product.max_price ?? ""); setOriginalPrice(product.original_price ?? "");
      setVariants((product.variants ?? []).map((variant) => ({ name: variant.name, values: variant.values.map((item) => String(item.value)) })));
      setCustomFields((product.custom_fields ?? []).map(({ title, value }) => ({ title, value })));
      setCategories((product.categories ?? []) as CatalogCategory[]);
      setIsBargain(product.specifications?.is_bargain === true); setIsAvailable(product.specifications?.is_available !== false); setIsBestseller(product.specifications?.is_bestseller === true);
      setIsFeatured(product.is_featured); setIsActive(product.is_active !== false); setInitialized(true);
    });
    return () => { cancelled = true; };
  }, [detail.data, initialized]);

  const save = useMutation({
    mutationFn: (payload: CatalogPayload) => editing ? updateCatalog(businessSlug, catalogSlug!, payload) : createCatalog(businessSlug, payload),
    onSuccess: async () => { setIsRedirecting(true); await queryClient.invalidateQueries({ queryKey: ["businesses", businessSlug, "manage-products"] }); router.replace(`/business/${encodeURIComponent(businessSlug)}/manage/products`); },
    onError: () => setIsRedirecting(false),
  });
  const remove = useMutation({ mutationFn: () => deleteCatalog(businessSlug, catalogSlug!), onSuccess: async () => { setIsRedirecting(true); await queryClient.invalidateQueries({ queryKey: ["businesses", businessSlug, "manage-products"] }); router.replace(`/business/${encodeURIComponent(businessSlug)}/manage/products`); }, onError: () => setIsRedirecting(false) });
  const isBusy = save.isPending || remove.isPending || isRedirecting;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (isBusy) return;
    if (!name.trim()) return setError("Product name is required.");
    if (priceType !== "ask" && !price) return setError("Price is required for this price type.");
    if (priceType === "range" && !maxPrice) return setError("Maximum price is required for a range.");
    setError(null);
    const payload: CatalogPayload = { name: name.trim(), type: "product", description: description.trim(), price_type: priceType,
      ...(priceType !== "ask" ? { price } : {}),
      ...(priceType === "fixed" && originalPrice ? { original_price: originalPrice } : {}),
      ...(priceType === "range" ? { max_price: maxPrice } : {}),
      variants: variants.filter((item) => item.name.trim() && item.values.some((value) => value.trim())).map((item) => ({ name: item.name.trim(), type: "text", values: item.values.map((value) => ({ value: value.trim() })).filter((item) => item.value) })),
      specifications: { is_bargain: priceType === "ask" ? false : isBargain, is_available: isAvailable, is_bestseller: isBestseller }, custom_fields: customFields.filter((item) => item.title.trim() && item.value.trim()), categories: categories.map((item) => item.id), is_featured: isFeatured, is_active: isActive };
    save.mutate(payload, { onError: () => setError(`Unable to ${editing ? "update" : "create"} product.`) });
  }

  if (editing && detail.isPending) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Product" /><p className="p-6 text-center text-sm text-foreground-muted">Loading product…</p></div>;
  if (editing && detail.isError) return <div className="min-h-dvh bg-slate-50"><MobileHeader title="Edit Product" /><p className="p-6 text-center text-sm text-danger">Couldn&apos;t load this product.</p></div>;

  return <div className="min-h-dvh bg-slate-50 pb-10"><MobileHeader title={editing ? "Edit Product" : "Add Product"} /><form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-4 px-page pt-5">
    <FormCard title="Product details"><Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className={inputClass} /></Field><Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product" rows={4} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></Field></FormCard>
    <CategoryPicker selected={categories} onChange={setCategories} />
    <FormCard title="Pricing"><Field label="Price type"><select value={priceType} onChange={(e) => setPriceType(e.target.value as CatalogPriceType)} className={inputClass}><option value="fixed">Fixed</option><option value="starts_from">Starts From</option><option value="ask">Ask for price</option><option value="range">Range</option></select></Field>{priceType !== "ask" && <><Field label={priceType === "range" ? "Minimum price" : "Price"}><input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={priceType === "range" ? "Enter minimum price" : "Enter price"} className={inputClass} /></Field>{priceType === "range" && <Field label="Maximum price"><input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Enter maximum price" className={inputClass} /></Field>}{priceType === "fixed" && <Field label="MRP price"><input type="number" min="0" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Enter MRP price" className={inputClass} /></Field>}<Toggle label="Bargaining available" checked={isBargain} onChange={setIsBargain} /></>}</FormCard>
    <VariantEditor rows={variants} setRows={setVariants} />
    <DynamicRows title="Custom fields" addLabel="Add field" rows={customFields} setRows={setCustomFields} first="Title" second="Value" />
    <FormCard title="Settings"><Toggle label="Available" checked={isAvailable} onChange={setIsAvailable} /><Toggle label="Featured" checked={isFeatured} onChange={setIsFeatured} /><Toggle label="Bestseller" checked={isBestseller} onChange={setIsBestseller} /><Toggle label="Active" checked={isActive} onChange={setIsActive} /></FormCard>
    {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
    <button type="submit" disabled={isBusy} className="h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Saving..." : editing ? "Save changes" : "Add product"}</button>
    {editing && <button type="button" disabled={isBusy} onClick={() => setDeleteOpen(true)} className="h-12 w-full rounded-xl border border-red-200 bg-white text-sm font-extrabold text-danger disabled:opacity-60">Delete product</button>}
  </form><BottomSheetModal open={deleteOpen} onClose={() => !isBusy && setDeleteOpen(false)} title="Delete product"><div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6"><h2 className="text-lg font-extrabold">Delete product?</h2><p className="mt-2 text-sm text-foreground-muted">This product will be permanently deleted. This action cannot be undone.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={isBusy} onClick={() => setDeleteOpen(false)} className="h-11 rounded-xl border border-slate-200 text-sm font-extrabold disabled:opacity-60">Cancel</button><button type="button" disabled={isBusy} onClick={() => remove.mutate()} className="h-11 rounded-xl bg-danger text-sm font-extrabold text-white disabled:opacity-60">{isBusy ? "Deleting..." : "Delete"}</button></div></div></BottomSheetModal></div>;
}

function CategoryPicker({ selected, onChange }: { selected: CatalogCategory[]; onChange: (items: CatalogCategory[]) => void }) {
  const [search, setSearch] = useState(""); const [term, setTerm] = useState("");
  useEffect(() => { const timeout = window.setTimeout(() => setTerm(search.trim()), 300); return () => window.clearTimeout(timeout); }, [search]);
  const query = useQuery({ queryKey: ["catalog-categories", "product", term], queryFn: () => searchCatalogCategories(term, "product"), enabled: term.length > 0 });
  return <FormCard title="Categories"><div className="flex flex-wrap gap-2">{selected.map((item) => <button key={item.id} type="button" onClick={() => onChange(selected.filter((category) => category.id !== item.id))} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand">{item.display_name} <i className="fa-solid fa-xmark ml-1" /></button>)}</div><div className="relative"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories" className={`${inputClass} pr-11`} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear category search" className="absolute right-1 top-1 flex size-9 items-center justify-center text-foreground-muted"><i className="fa-solid fa-xmark" /></button>}</div>{term && <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100">{query.isFetching && <p className="p-3 text-xs text-foreground-muted">Searching…</p>}{query.data?.map((item) => { const chosen = selected.some((category) => category.id === item.id); return <label key={item.id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-sm font-semibold last:border-0 ${chosen ? "bg-slate-50" : "hover:bg-slate-50"}`}><input type="checkbox" checked={chosen} onChange={() => onChange(chosen ? selected.filter((category) => category.id !== item.id) : [...selected, item])} className="size-4 shrink-0 accent-brand" /><span>{item.display_name}</span></label>; })}{query.data?.length === 0 && <p className="p-3 text-xs text-foreground-muted">No categories found.</p>}</div>}</FormCard>;
}

function VariantEditor({ rows, setRows }: { rows: VariantDraft[]; setRows: (rows: VariantDraft[]) => void }) {
  const canAddVariant = rows.every((row) => row.name.trim() && row.values.length > 0 && row.values.every((value) => value.trim()));
  return <FormCard title="Variants">{rows.map((row, rowIndex) => <div key={rowIndex} className="rounded-xl border border-slate-100 p-3"><div className="flex gap-2"><input aria-label="Variant name" placeholder="Variant name, e.g. Color" value={row.name} onChange={(e) => setRows(rows.map((item, index) => index === rowIndex ? { ...item, name: e.target.value } : item))} className={inputClass} /><button type="button" aria-label="Remove variant" onClick={() => setRows(rows.filter((_, index) => index !== rowIndex))} className="size-11 shrink-0 rounded-xl bg-red-50 text-danger"><i className="fa-solid fa-trash" /></button></div><div className="mt-3 space-y-2">{row.values.map((value, valueIndex) => <div key={valueIndex} className="flex gap-2"><input aria-label="Variant value" placeholder="Value" value={value} onChange={(e) => setRows(rows.map((item, index) => index === rowIndex ? { ...item, values: item.values.map((current, i) => i === valueIndex ? e.target.value : current) } : item))} className={inputClass} /><button type="button" aria-label="Remove variant value" onClick={() => setRows(rows.map((item, index) => index === rowIndex ? { ...item, values: item.values.filter((_, i) => i !== valueIndex) } : item))} className="size-11 shrink-0 rounded-xl bg-slate-50 text-foreground-muted"><i className="fa-solid fa-xmark" /></button></div>)}<button type="button" disabled={row.values.some((value) => !value.trim())} onClick={() => setRows(rows.map((item, index) => index === rowIndex ? { ...item, values: [...item.values, ""] } : item))} className="text-xs font-extrabold text-brand disabled:opacity-40"><i className="fa-solid fa-plus mr-1" />Add value</button></div></div>)}<button type="button" disabled={!canAddVariant} onClick={() => setRows([...rows, { name: "", values: [""] }])} className="text-xs font-extrabold text-brand disabled:opacity-40"><i className="fa-solid fa-plus mr-1" />Add variant</button></FormCard>;
}

function DynamicRows<T extends { [key: string]: string }>({ title, addLabel, rows, setRows, first, second }: { title: string; addLabel: string; rows: T[]; setRows: (rows: T[]) => void; first: string; second: string }) {
  const keys = (title === "Variants" ? ["name", "values"] : ["title", "value"]) as Array<keyof T>;
  const canAdd = rows.every((row) => String(row[keys[0]]).trim() && String(row[keys[1]]).trim());
  return <FormCard title={title}>{rows.map((row, index) => <div key={index} className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-2"><input aria-label={first} placeholder={first} value={row[keys[0]]} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, [keys[0]]: e.target.value } : item))} className={inputClass} /><input aria-label={second} placeholder={second} value={row[keys[1]]} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, [keys[1]]: e.target.value } : item))} className={inputClass} /><button type="button" aria-label={`Remove ${title.toLowerCase()} row`} onClick={() => setRows(rows.filter((_, i) => i !== index))} className="size-11 rounded-xl bg-red-50 text-danger"><i className="fa-solid fa-trash" /></button></div>)}<button type="button" disabled={!canAdd} onClick={() => setRows([...rows, Object.fromEntries(keys.map((key) => [key, ""])) as T])} className="text-xs font-extrabold text-brand disabled:opacity-40"><i className="fa-solid fa-plus mr-1" />{addLabel}</button></FormCard>;
}
function FormCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><h2 className="mb-4 text-sm font-extrabold text-foreground">{title}</h2><div className="space-y-4">{children}</div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-foreground"><span className="mb-1.5 block">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between gap-3 text-sm font-bold"><span>{label}</span><span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-brand" : "bg-slate-200"}`}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" /><span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} /></span></label>; }
