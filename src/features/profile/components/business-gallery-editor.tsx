"use client";

import axios from "axios";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { FullScreenModal } from "@/components/modals";
import { getBusinessGallery, updateBusinessGallery } from "../profile.service";
import type { BusinessGalleryImage } from "../profile.types";
import { compressImage } from "@/lib/compress-image";

type PendingImage = { id: string; file: File; previewUrl: string };
const maximumImages = 20;

function clientId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BusinessGalleryEditor({ businessSlug, businessName, onClose, onSaved }: { businessSlug: string; businessName: string; onClose: () => void; onSaved: () => void }) {
  const [existing, setExisting] = useState<BusinessGalleryImage[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrls = useRef(new Set<string>());
  const queryClient = useQueryClient();
  const queryKey = ["business-gallery", businessSlug] as const;
  const query = useQuery({ queryKey, queryFn: () => getBusinessGallery(businessSlug) });

  useEffect(() => {
    if (!query.data || initialized) return;
    queueMicrotask(() => {
      setExisting(query.data);
      setInitialized(true);
    });
  }, [initialized, query.data]);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  const retained = existing.filter((item) => !deletedIds.has(item.id));
  const activeCount = retained.length + pending.length;
  const save = useMutation({
    mutationFn: () => {
      const payload = new FormData();
      retained.forEach((item) => payload.append("existing_ids", item.id));
      pending.forEach((item) => payload.append("images", item.file));
      return updateBusinessGallery(businessSlug, payload);
    },
    onMutate: () => setError(null),
    onSuccess: async (results) => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
      setExisting(results);
      setPending([]);
      setDeletedIds(new Set());
      queryClient.setQueryData(queryKey, results);
      await onSaved();
      onClose();
    },
    onError: (requestError) => {
      const detail = axios.isAxiosError(requestError) ? requestError.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Unable to save gallery. Your changes have been preserved.");
    },
  });

  async function addFiles(files: FileList) {
    setError(null);
    try {
      const available = maximumImages - activeCount;
      const selected = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (selected.length > available) setError(`You can add only ${available} more image${available === 1 ? "" : "s"}. The gallery limit is ${maximumImages}.`);
      const compressed = await Promise.all(selected.slice(0, Math.max(0, available)).map((file) => compressImage(file, { maxWidth: 1024, quality: 0.95 })));
      const additions = compressed.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);
        return { id: clientId(), file, previewUrl };
      });
      setPending((current) => [...current, ...additions]);
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Unable to prepare the selected images.");
    }
  }

  function removePending(id: string) {
    setPending((current) => current.filter((item) => { if (item.id !== id) return true; URL.revokeObjectURL(item.previewUrl); previewUrls.current.delete(item.previewUrl); return false; }));
  }

  return <FullScreenModal open onClose={() => !save.isPending && onClose()} title="Business gallery"><div className="min-h-dvh bg-slate-50 pb-8"><MobileHeader title="Business Gallery" subtitle={businessName} onBack={onClose} /><main className="mx-auto w-full max-w-3xl px-page pt-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-bold">{activeCount} of {maximumImages} images</p><p className="text-xs text-foreground-muted">Select multiple images</p></div>{query.isPending && <p className="py-10 text-center text-sm text-foreground-muted">Loading images…</p>}{query.isError && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-danger">Couldn&apos;t load the gallery. <button type="button" onClick={() => void query.refetch()} className="font-extrabold underline">Try again</button></div>}{initialized && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{existing.map((item) => { const deleted = deletedIds.has(item.id); return <article key={item.id} className={`relative aspect-square overflow-hidden rounded-xl bg-slate-100 ${deleted ? "opacity-50" : ""}`}><img src={item.image} alt="" className="size-full object-cover" />{deleted && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-extrabold text-white">Will be removed</span>}<button type="button" onClick={() => setDeletedIds((current) => { const next = new Set(current); if (deleted) next.delete(item.id); else next.add(item.id); return next; })} aria-label={deleted ? "Keep image" : "Remove image"} className={`absolute right-2 top-2 rounded-full px-2.5 py-1.5 text-xs font-extrabold shadow ${deleted ? "bg-white text-brand" : "bg-white/90 text-danger"}`}>{deleted ? "Undo" : <i className="fa-solid fa-trash" />}</button></article>; })}{pending.map((item) => <article key={item.id} className="relative aspect-square overflow-hidden rounded-xl border-2 border-brand bg-slate-100"><img src={item.previewUrl} alt="New image preview" className="size-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-extrabold text-white">New</span><button type="button" onClick={() => removePending(item.id)} aria-label="Remove new image" className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger shadow"><i className="fa-solid fa-trash" /></button></article>)}{activeCount < maximumImages && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white p-4 text-center text-brand hover:bg-brand-50"><i className="fa-solid fa-plus text-2xl" /><span className="mt-2 text-xs font-extrabold">Select images</span><input type="file" accept="image/*" multiple className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} /></label>}</div>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}<button type="button" disabled={!initialized || save.isPending} onClick={() => save.mutate()} className="mt-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-50">{save.isPending ? "Saving…" : "Save gallery"}</button></main></div></FullScreenModal>;
}
