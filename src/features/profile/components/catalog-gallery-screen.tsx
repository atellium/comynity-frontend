"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MobileHeader from "@/components/layout/MobileHeader";
import { getProductBySlug } from "@/features/businesses/business.service";
import { getCatalogImages, updateCatalogImages } from "../profile.service";
import { compressImage } from "@/lib/compress-image";

type ExistingItem = { type: "existing"; id: string; image: string };
type NewItem = { type: "new"; file: File; previewUrl: string; clientId: string };
type GalleryItem = ExistingItem | NewItem;

function createClientId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues === "function") {
    const values = crypto.getRandomValues(new Uint32Array(4));
    return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("-");
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function logGalleryPayload(method: "PATCH", formData: FormData) {
  const entries = Array.from(formData.entries()).map(([field, value]) => ({
    field,
    value: value instanceof File
      ? { name: value.name, type: value.type, size: value.size, lastModified: value.lastModified }
      : value,
  }));
  console.log(`[Product gallery] ${method} FormData payload`, entries);
}

export function CatalogGalleryScreen({ businessSlug, catalogSlug }: { businessSlug: string; catalogSlug: string }) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const previewUrls = useRef(new Set<string>());
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["catalog-images", businessSlug, catalogSlug], queryFn: () => getCatalogImages(businessSlug, catalogSlug) });
  const productQuery = useQuery({ queryKey: ["product", catalogSlug], queryFn: () => getProductBySlug(catalogSlug) });

  useEffect(() => {
    if (!query.data || initialized) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const existing = query.data.map((item) => ({ type: "existing" as const, id: item.id, image: item.image }));
      setGallery((current) => [...existing, ...current.filter((item) => item.type === "new")]);
      setInitialized(true);
    });
    return () => { cancelled = true; };
  }, [initialized, query.data]);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  const save = useMutation({
    onMutate: () => { setError(null); setSuccess(null); },
    mutationFn: async () => {
      const formData = new FormData();
      const newIndexByClientId = new Map<string, number>();
      let newIndex = 0;
      for (const item of gallery) {
        if (item.type === "new") { formData.append("images", item.file); newIndexByClientId.set(item.clientId, newIndex); newIndex += 1; }
      }
      for (const item of gallery) {
        const token = item.type === "existing" ? `existing:${item.id}` : `new:${newIndexByClientId.get(item.clientId)}`;
        formData.append("order", token);
      }
      logGalleryPayload("PATCH", formData);
      return updateCatalogImages(businessSlug, catalogSlug, formData);
    },
    onSuccess: async (results) => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url)); previewUrls.current.clear();
      setGallery(results.map((item) => ({ type: "existing", id: item.id, image: item.image })));
      setError(null);
      setSuccess("Product images saved successfully.");
      await queryClient.invalidateQueries({ queryKey: ["product", catalogSlug] });
    },
    onError: (requestError) => {
      const detail = axios.isAxiosError(requestError)
        ? requestError.response?.data?.detail
        : null;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to save gallery. Your changes have been preserved.",
      );
    },
  });

  async function addFiles(files: FileList | File[]) {
    setSuccess(null);
    setError(null);
    try {
      const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
      const compressed = await Promise.all(images.map((file) => compressImage(file, { maxWidth: 1024, quality: 0.95 })));
      const items = compressed.map((file): NewItem => { const previewUrl = URL.createObjectURL(file); previewUrls.current.add(previewUrl); return { type: "new", file, previewUrl, clientId: createClientId() }; });
      setGallery((current) => [...current, ...items]);
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Unable to prepare the selected images.");
    }
  }

  function removeItem(index: number) {
    setSuccess(null);
    setGallery((current) => { const item = current[index]; if (item?.type === "new") { URL.revokeObjectURL(item.previewUrl); previewUrls.current.delete(item.previewUrl); } return current.filter((_, itemIndex) => itemIndex !== index); });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    setSuccess(null);
    setGallery((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  return <div className="min-h-dvh bg-slate-50 pb-10">
    <MobileHeader title="Product Images" subtitle={productQuery.data?.name ?? "Loading product…"} />
    <main className="mx-auto w-full max-w-3xl px-page pt-5">
      {query.isPending && <p className="py-8 text-center text-sm text-foreground-muted">Loading images…</p>}
      {query.isError && <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-danger">Couldn&apos;t load product images. <button type="button" onClick={() => void query.refetch()} className="font-extrabold underline">Try again</button></div>}

      {initialized && <div onDragOver={(event) => event.preventDefault()} onDrop={dropFiles} className="grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.map((item, index) => {
        const source = item.type === "existing" ? item.image : item.previewUrl;
        const key = item.type === "existing" ? `existing-${item.id}` : `new-${item.clientId}`;
        return <article key={key} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 ${index === 0 ? "border-brand" : "border-transparent"}`}>
          {/* Native image rendering reliably supports local blob preview URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={source} alt="" className="absolute inset-0 size-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-extrabold text-white">{index === 0 ? "Primary" : index + 1}</span>
          <button type="button" onClick={() => removeItem(index)} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow"><i className="fa-solid fa-trash" /></button>
          <div className="absolute inset-x-2 bottom-2 flex justify-between"><button type="button" disabled={index === 0} onClick={() => moveItem(index, -1)} aria-label={`Move image ${index + 1} left`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-left" /></button><button type="button" disabled={index === gallery.length - 1} onClick={() => moveItem(index, 1)} aria-label={`Move image ${index + 1} right`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-right" /></button></div>
        </article>;
      })}<label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white p-4 text-center text-brand transition hover:bg-brand-50"><i className="fa-solid fa-plus text-2xl" aria-hidden="true" /><span className="mt-2 text-xs font-extrabold">Select images</span><span className="mt-1 text-[10px] text-foreground-muted">Multiple files allowed</span><input type="file" accept="image/*" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} className="sr-only" /></label></div>}

      {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><i className="fa-solid fa-circle-check mr-2" aria-hidden="true" />{success}</p>}
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{error}</p>}
      <button type="button" disabled={!initialized || save.isPending} onClick={() => save.mutate()} className="mt-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-50">{save.isPending ? "Saving…" : "Save images"}</button>
    </main>
  </div>;
}
