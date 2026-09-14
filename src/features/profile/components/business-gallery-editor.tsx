"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { FullScreenModal } from "@/components/modals";
import { compressImage } from "@/lib/compress-image";
import { getBusinessUploads, updateBusinessGallery, uploadBusinessImages } from "../profile.service";
import type { BusinessUpload, OwnedBusinessInfo } from "../profile.types";

const maximumImages = 10;
const maximumImagesPerUpload = 5;
const imageCompressionOptions = { maxWidth: 1024, quality: 0.9 };
type DraftImage = { id: string; file: File; previewUrl: string };

function createDraftId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BusinessGalleryEditor({ business, onClose, onSaved }: { business: OwnedBusinessInfo; onClose: () => void; onSaved: (business: OwnedBusinessInfo) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const draftPreviewUrls = useRef(new Set<string>());
  const queryKey = ["business-uploads"] as const;
  const query = useQuery({ queryKey, queryFn: getBusinessUploads });
  const [savedUploads, setSavedUploads] = useState<BusinessUpload[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploads = useMemo(
    () => [...savedUploads, ...(query.data ?? [])].filter((upload, index, items) => items.findIndex((item) => item.id === upload.id) === index),
    [query.data, savedUploads],
  );

  useEffect(() => {
    const previewUrls = draftPreviewUrls.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (!query.data || initialized) return;
    queueMicrotask(() => {
      const galleryUrls = new Set(business.media.gallery.filter(Boolean));
      setSelectedIds(new Set(query.data.filter((upload) => galleryUrls.has(upload.url)).map((upload) => upload.id)));
      setInitialized(true);
    });
  }, [business.media.gallery, initialized, query.data]);

  const save = useMutation({
    mutationFn: async () => {
      const uploaded = draftImages.length ? await uploadBusinessImages(draftImages.map((image) => image.file)) : [];
      const galleryIds = [...selectedIds, ...uploaded.map((upload) => upload.id)];
      const updated = await updateBusinessGallery(business.slug, galleryIds);
      return { updated, uploaded };
    },
    onMutate: () => setError(null),
    onSuccess: ({ updated, uploaded }) => {
      draftImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      draftPreviewUrls.current.clear();
      setSavedUploads((current) => [...uploaded, ...current.filter((item) => !uploaded.some((newItem) => newItem.id === item.id))]);
      setSelectedIds((current) => new Set([...current, ...uploaded.map((upload) => upload.id)]));
      setDraftImages([]);
      onSaved(updated);
      onClose();
    },
    onError: (requestError) => {
      const detail = axios.isAxiosError(requestError) ? requestError.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : requestError instanceof Error ? requestError.message : "Unable to save gallery. Your changes have been preserved.");
    },
  });

  function toggleUpload(upload: BusinessUpload) {
    setError(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(upload.id)) next.delete(upload.id);
      else if (next.size < maximumImages) next.add(upload.id);
      else setError(`The gallery limit is ${maximumImages} images. Remove an image before adding more.`);
      return next;
    });
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!files.length) return;
    const available = maximumImages - selectedIds.size - draftImages.length;
    if (available <= 0) {
      setError(`The gallery limit is ${maximumImages} images. Remove an image before adding more.`);
      return;
    }
    const allowed = Math.min(available, maximumImagesPerUpload);
    if (files.length > allowed) setError(`Only the first ${allowed} selected image${allowed === 1 ? " was" : "s were"} added. You can upload up to ${maximumImagesPerUpload} images at a time.`);
    void prepareDraftImages(files.slice(0, allowed));
  }

  async function prepareDraftImages(files: File[]) {
    try {
      const compressed = await Promise.all(files.map((file) => compressImage(file, imageCompressionOptions)));
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
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(uploadId);
      return next;
    });
  }

  function removeDraft(draftId: string) {
    setError(null);
    setDraftImages((current) => {
      const draft = current.find((image) => image.id === draftId);
      if (draft) {
        URL.revokeObjectURL(draft.previewUrl);
        draftPreviewUrls.current.delete(draft.previewUrl);
      }
      return current.filter((image) => image.id !== draftId);
    });
  }

  const isBusy = save.isPending;
  const displayError = error ?? (query.isError ? "Couldn't load your uploads. Please try again." : null);
  const selectedUploads = uploads.filter((upload) => selectedIds.has(upload.id));
  const availableUploads = uploads.filter((upload) => !selectedIds.has(upload.id));
  const selectedCount = selectedIds.size + draftImages.length;

  return <FullScreenModal open onClose={() => !isBusy && onClose()} title="Business gallery">
    <div className="min-h-dvh bg-slate-50 pb-8">
      <MobileHeader title="Business Gallery" subtitle={business.name} onBack={onClose} />
      <main className="mx-auto w-full max-w-3xl px-page pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">{selectedCount} of {maximumImages} selected</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy || selectedCount >= maximumImages} className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-xs font-extrabold text-white disabled:opacity-50"><i className="fa-solid fa-plus" />Upload new</button>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={addFiles} disabled={isBusy} className="sr-only" />
        </div>
        {query.isPending && <p className="py-10 text-center text-sm text-foreground-muted">Loading uploads...</p>}
        {displayError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{displayError}</p>}
        <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-brand">Selected gallery images</h2>
            <span className="text-[11px] font-bold text-foreground-muted">{selectedCount} selected</span>
          </div>
          {(selectedUploads.length > 0 || draftImages.length > 0) ? <div className="grid grid-cols-3 gap-2">{selectedUploads.map((upload, index) => <div key={upload.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-brand-100"><Image src={upload.url} alt="" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover" /><button type="button" onClick={() => removeSelected(upload.id)} disabled={isBusy} aria-label={`Remove selected image ${index + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow disabled:opacity-50"><i className="fa-solid fa-trash" /></button></div>)}{draftImages.map((draft, index) => <div key={draft.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-brand-100"><Image src={draft.previewUrl} alt="" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover" unoptimized /><button type="button" onClick={() => removeDraft(draft.id)} disabled={isBusy} aria-label={`Remove new image ${index + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow disabled:opacity-50"><i className="fa-solid fa-trash" /></button></div>)}</div> : <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white text-brand disabled:opacity-50"><i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="mt-2 text-xs font-extrabold">Select gallery images</span></button>}
        </section>
        <button type="button" disabled={!initialized || isBusy} onClick={() => save.mutate()} className="my-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(59,130,246,0.18)] disabled:opacity-50">{save.isPending ? "Saving gallery..." : "Save gallery"}</button>
        <section className="border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground-muted">All uploaded images</h2>
            <span className="text-[11px] font-bold text-foreground-muted">{availableUploads.length} available</span>
          </div>
          {!query.isPending && uploads.length === 0 && <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-brand disabled:opacity-50"><i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="mt-2 text-xs font-extrabold">Upload gallery images</span></button>}
          {availableUploads.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{availableUploads.map((upload) => {
          return <button key={upload.id} type="button" onClick={() => toggleUpload(upload)} disabled={isBusy} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-transparent bg-slate-100 text-left disabled:cursor-default">
            <Image src={upload.url} alt={upload.title || "Uploaded image"} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover transition-transform group-enabled:group-hover:scale-[1.02]" />
          </button>;
        })}</div>}
        </section>
      </main>
    </div>
  </FullScreenModal>;
}
