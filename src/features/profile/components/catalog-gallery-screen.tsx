"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { compressImage } from "@/lib/compress-image";
import { getBusinessUploads, getOwnedProduct, updateProductImages, uploadBusinessImages } from "../profile.service";
import type { BusinessUpload } from "../profile.types";

const maximumImages = 20;
const maximumImagesPerUpload = 5;
type DraftImage = { id: string; file: File; previewUrl: string };

function createDraftId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function moveArrayItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function CatalogGalleryScreen({ businessSlug, catalogSlug }: { businessSlug: string; catalogSlug: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const draftPreviewUrls = useRef(new Set<string>());
  const queryClient = useQueryClient();
  const productQueryKey = ["businesses", "mine", businessSlug, "product", catalogSlug] as const;
  const uploadsQueryKey = ["business-uploads"] as const;
  const productQuery = useQuery({ queryKey: productQueryKey, queryFn: () => getOwnedProduct(businessSlug, catalogSlug) });
  const uploadsQuery = useQuery({ queryKey: uploadsQueryKey, queryFn: getBusinessUploads });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedUploads, setSavedUploads] = useState<BusinessUpload[]>([]);
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const productUploads = useMemo(
    () => (productQuery.data?.images ?? []).map((image) => image.upload).filter((upload) => upload?.url),
    [productQuery.data?.images],
  );
  const uploads = useMemo(
    () => [...savedUploads, ...productUploads, ...(uploadsQuery.data ?? [])].filter((upload, index, items) => items.findIndex((item) => item.id === upload.id) === index),
    [productUploads, savedUploads, uploadsQuery.data],
  );

  useEffect(() => {
    const previewUrls = draftPreviewUrls.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (!productQuery.data || initialized) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const orderedIds = [...(productQuery.data.images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((image) => image.upload.id);
      setSelectedIds(orderedIds);
      setInitialized(true);
    });
    return () => { cancelled = true; };
  }, [initialized, productQuery.data]);

  const save = useMutation({
    mutationFn: async () => {
      const uploaded = draftImages.length ? await uploadBusinessImages(draftImages.map((image) => image.file)) : [];
      const imageIds = [...selectedIds, ...uploaded.map((upload) => upload.id)];
      const updated = await updateProductImages(businessSlug, catalogSlug, imageIds);
      return { imageIds, updated, uploaded };
    },
    onMutate: () => { setError(null); setSuccess(null); },
    onSuccess: async ({ imageIds, uploaded }) => {
      draftImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      draftPreviewUrls.current.clear();
      setSavedUploads((current) => [...uploaded, ...current.filter((item) => !uploaded.some((newItem) => newItem.id === item.id))]);
      setSelectedIds(imageIds);
      setDraftImages([]);
      setSuccess("Product images saved successfully.");
      await queryClient.invalidateQueries({ queryKey: productQueryKey });
      await queryClient.invalidateQueries({ queryKey: uploadsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["businesses", businessSlug, "manage-products"] });
    },
    onError: (requestError) => {
      const detail = axios.isAxiosError(requestError) ? requestError.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : requestError instanceof Error ? requestError.message : "Unable to save product images. Your changes have been preserved.");
    },
  });

  function toggleUpload(upload: BusinessUpload) {
    setError(null);
    setSuccess(null);
    setSelectedIds((current) => {
      if (current.includes(upload.id)) return current.filter((id) => id !== upload.id);
      if (current.length + draftImages.length < maximumImages) return [...current, upload.id];
      else setError(`The product image limit is ${maximumImages}. Remove an image before adding more.`);
      return current;
    });
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!files.length) return;
    const available = maximumImages - selectedIds.length - draftImages.length;
    if (available <= 0) {
      setError(`The product image limit is ${maximumImages}. Remove an image before adding more.`);
      return;
    }
    const allowed = Math.min(available, maximumImagesPerUpload);
    if (files.length > allowed) setError(`Only the first ${allowed} selected image${allowed === 1 ? " was" : "s were"} added. You can upload up to ${maximumImagesPerUpload} images at a time.`);
    setSuccess(null);
    void prepareDraftImages(files.slice(0, allowed));
  }

  async function prepareDraftImages(files: File[]) {
    try {
      const compressed = await Promise.all(files.map((file) => compressImage(file, { maxWidth: 1024, quality: 0.9 })));
      setDraftImages((current) => [...current, ...compressed.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        draftPreviewUrls.current.add(previewUrl);
        return { id: createDraftId(), file, previewUrl };
      })]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to prepare images. Please try again.");
    }
  }

  function removeSelected(uploadId: string) {
    setError(null);
    setSuccess(null);
    setSelectedIds((current) => current.filter((id) => id !== uploadId));
  }

  function removeDraft(draftId: string) {
    setError(null);
    setSuccess(null);
    setDraftImages((current) => {
      const draft = current.find((image) => image.id === draftId);
      if (draft) {
        URL.revokeObjectURL(draft.previewUrl);
        draftPreviewUrls.current.delete(draft.previewUrl);
      }
      return current.filter((image) => image.id !== draftId);
    });
  }

  function moveSelectedUpload(index: number, direction: -1 | 1) {
    setSuccess(null);
    setSelectedIds((current) => moveArrayItem(current, index, direction));
  }

  function moveDraft(index: number, direction: -1 | 1) {
    setSuccess(null);
    setDraftImages((current) => moveArrayItem(current, index, direction));
  }

  const isBusy = save.isPending;
  const displayError = error ?? (productQuery.isError ? "Couldn't load this product." : uploadsQuery.isError ? "Couldn't load your uploads. Please try again." : null);
  const selectedUploads = selectedIds.map((id) => uploads.find((upload) => upload.id === id)).filter((upload): upload is BusinessUpload => Boolean(upload));
  const availableUploads = uploads.filter((upload) => !selectedIds.includes(upload.id));
  const selectedCount = selectedIds.length + draftImages.length;

  return <div className="min-h-dvh bg-slate-50 pb-10">
    <MobileHeader title="Product Images" subtitle={productQuery.data?.name ?? "Loading product..."} />
    <main className="mx-auto w-full max-w-3xl px-page pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{selectedCount} of {maximumImages} selected</p>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy || selectedCount >= maximumImages} className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-xs font-extrabold text-white disabled:opacity-50"><i className="fa-solid fa-plus" />Upload new</button>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={addFiles} disabled={isBusy} className="sr-only" />
      </div>
      {(productQuery.isPending || uploadsQuery.isPending) && <p className="py-10 text-center text-sm text-foreground-muted">Loading images...</p>}
      {displayError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{displayError}</p>}
      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-brand">Selected product images</h2>
          <span className="text-[11px] font-bold text-foreground-muted">{selectedCount} selected</span>
        </div>
        {(selectedUploads.length > 0 || draftImages.length > 0) ? <div className="grid grid-cols-3 gap-2">{selectedUploads.map((upload, index) => <div key={upload.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-brand-100"><Image src={upload.url} alt="" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover" />{index === 0 && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-extrabold text-white">Primary</span>}<button type="button" onClick={() => removeSelected(upload.id)} disabled={isBusy} aria-label={`Remove selected image ${index + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow disabled:opacity-50"><i className="fa-solid fa-trash" /></button><div className="absolute inset-x-2 bottom-2 flex justify-between"><button type="button" onClick={() => moveSelectedUpload(index, -1)} disabled={isBusy || index === 0} aria-label={`Move selected image ${index + 1} left`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-left" /></button><button type="button" onClick={() => moveSelectedUpload(index, 1)} disabled={isBusy || index === selectedUploads.length - 1} aria-label={`Move selected image ${index + 1} right`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-right" /></button></div></div>)}{draftImages.map((draft, draftIndex) => <div key={draft.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-brand-100"><Image src={draft.previewUrl} alt="" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover" unoptimized />{selectedUploads.length === 0 && draftIndex === 0 && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-extrabold text-white">Primary</span>}<button type="button" onClick={() => removeDraft(draft.id)} disabled={isBusy} aria-label={`Remove new image ${draftIndex + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow disabled:opacity-50"><i className="fa-solid fa-trash" /></button><div className="absolute inset-x-2 bottom-2 flex justify-between"><button type="button" onClick={() => moveDraft(draftIndex, -1)} disabled={isBusy || draftIndex === 0} aria-label={`Move new image ${draftIndex + 1} left`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-left" /></button><button type="button" onClick={() => moveDraft(draftIndex, 1)} disabled={isBusy || draftIndex === draftImages.length - 1} aria-label={`Move new image ${draftIndex + 1} right`} className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow disabled:invisible"><i className="fa-solid fa-arrow-right" /></button></div></div>)}</div> : <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white text-brand disabled:opacity-50"><i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="mt-2 text-xs font-extrabold">Select product images</span></button>}
      </section>
      {success && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><i className="fa-solid fa-circle-check mr-2" aria-hidden="true" />{success}</p>}
      <button type="button" disabled={!initialized || isBusy} onClick={() => save.mutate()} className="my-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(59,130,246,0.18)] disabled:opacity-50">{save.isPending ? "Saving images..." : "Save images"}</button>
      <section className="border-t border-slate-200 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground-muted">All uploaded images</h2>
          <span className="text-[11px] font-bold text-foreground-muted">{availableUploads.length} available</span>
        </div>
        {!productQuery.isPending && !uploadsQuery.isPending && uploads.length === 0 && <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-brand disabled:opacity-50"><i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="mt-2 text-xs font-extrabold">Upload product images</span></button>}
        {availableUploads.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{availableUploads.map((upload) => {
        return <article key={upload.id} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-transparent bg-slate-100 text-left">
          <button type="button" onClick={() => toggleUpload(upload)} disabled={isBusy} className="absolute inset-0 disabled:cursor-default" aria-label={`Select ${upload.title || "uploaded image"}`}>
            <Image src={upload.url} alt={upload.title || "Uploaded image"} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover transition-transform group-enabled:group-hover:scale-[1.02]" />
          </button>
        </article>;
      })}</div>}
      </section>
    </main>
  </div>;
}
