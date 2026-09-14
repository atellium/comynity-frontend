"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { FullScreenModal } from "@/components/modals";
import { compressImage } from "@/lib/compress-image";
import { getBusinessUploads, updateBusinessCoverImage, uploadBusinessCoverImage } from "../profile.service";
import type { BusinessUpload, OwnedBusinessInfo } from "../profile.types";

const imageCompressionOptions = { maxWidth: 1024, quality: 0.9 };

export function BusinessThumbnailCard({ business, onSaved }: { business: OwnedBusinessInfo; onSaved: (business: OwnedBusinessInfo) => void }) {
  const [open, setOpen] = useState(false);
  const source = business.media.cover_image ?? business.media.thumbnail;

  return <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-extrabold"><i className="fa-solid fa-image text-brand" />Cover image</h2>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand"><i className="fa-solid fa-pen mr-1" />Edit</button>
    </div>
    <div className="mt-3">
      {source ? <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100"><Image src={source} alt={`${business.name} cover image`} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /></div> : <button type="button" onClick={() => setOpen(true)} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-foreground-muted"><i className="fa-solid fa-image text-2xl" /><span className="mt-2 text-xs font-bold">Select a cover image</span></button>}
    </div>
    {open && <BusinessCoverImagePicker business={business} onClose={() => setOpen(false)} onSaved={onSaved} />}
  </section>;
}

function BusinessCoverImagePicker({ business, onClose, onSaved }: { business: OwnedBusinessInfo; onClose: () => void; onSaved: (business: OwnedBusinessInfo) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const queryKey = ["business-uploads"] as const;
  const query = useQuery({ queryKey, queryFn: getBusinessUploads });
  const [error, setError] = useState<string | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<BusinessUpload | null>(null);
  const [draftImage, setDraftImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<BusinessUpload[]>([]);
  const currentCover = business.media.cover_image ?? null;

  useEffect(() => {
    return () => {
      if (draftImage) URL.revokeObjectURL(draftImage.previewUrl);
    };
  }, [draftImage]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const upload = draftImage ? await uploadBusinessCoverImage(draftImage.file) : selectedUpload;
      if (!upload) throw new Error("Select a cover image.");
      const updated = await updateBusinessCoverImage(business.slug, upload.id);
      return { updated, upload };
    },
    onMutate: () => setError(null),
    onSuccess: async ({ updated, upload }) => {
      if (draftImage) URL.revokeObjectURL(draftImage.previewUrl);
      setUploadedImages((current) => [upload, ...current.filter((item) => item.id !== upload.id)]);
      setDraftImage(null);
      setSelectedUpload(upload);
      await queryClient.invalidateQueries({ queryKey });
      onSaved(updated);
      onClose();
    },
    onError: (saveError) => {
      setError(saveError instanceof Error ? saveError.message : "Unable to update the cover image. Please try again.");
    },
  });

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    const file = files[0];
    if (!file) return;
    if (files.length > 1) setError("Only one cover image can be selected at a time.");
    try {
      setError(null);
      const compressed = await compressImage(file, imageCompressionOptions);
      const previewUrl = URL.createObjectURL(compressed);
      setDraftImage((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return { file: compressed, previewUrl };
      });
      setSelectedUpload(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to prepare the cover image. Please try again.");
    }
  }

  const isSaving = saveMutation.isPending;
  const displayError = error ?? (query.isError ? "Couldn't load your uploads. Please try again." : null);
  const uploads = [...uploadedImages, ...(query.data ?? []).filter((upload) => !uploadedImages.some((item) => item.id === upload.id))];
  const stagedImage = draftImage?.previewUrl ?? selectedUpload?.url ?? currentCover;

  return <FullScreenModal open onClose={() => !isSaving && onClose()} title="Cover image">
    <div className="min-h-dvh bg-slate-50 pb-8">
      <MobileHeader title="Cover Image" subtitle={business.name} onBack={onClose} />
      <main className="mx-auto w-full max-w-3xl px-page pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">Your uploads</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isSaving} className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-xs font-extrabold text-white disabled:opacity-50"><i className="fa-solid fa-plus" />Upload new</button>
          <input ref={inputRef} type="file" accept="image/*" onChange={selectFile} disabled={isSaving} className="sr-only" />
        </div>
        {stagedImage && <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 bg-white p-2"><div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100"><Image src={stagedImage} alt="Selected cover image" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" unoptimized={Boolean(draftImage)} /></div></div>}
        {query.isPending && <p className="py-10 text-center text-sm text-foreground-muted">Loading uploads...</p>}
        {displayError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">{displayError}</p>}
        <button type="button" onClick={() => saveMutation.mutate()} disabled={(!selectedUpload && !draftImage) || isSaving} className="mb-5 h-12 w-full rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-50">{saveMutation.isPending ? "Saving image..." : "Save image"}</button>
        {uploads.length === 0 && !query.isPending && <button type="button" onClick={() => inputRef.current?.click()} disabled={isSaving} className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white text-brand disabled:opacity-50"><i className="fa-solid fa-cloud-arrow-up text-2xl" /><span className="mt-2 text-xs font-extrabold">Upload cover image</span></button>}
        {uploads.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {uploads.map((upload) => {
            const isCurrent = upload.url === currentCover;
            const isSelected = selectedUpload?.id === upload.id;
            return <button key={upload.id} type="button" onClick={() => { setSelectedUpload(upload); setDraftImage((current) => { if (current) URL.revokeObjectURL(current.previewUrl); return null; }); setError(null); }} disabled={isSaving} className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 text-left disabled:cursor-default ${isCurrent || isSelected ? "border-brand" : "border-transparent"}`}>
              <Image src={upload.url} alt={upload.title || "Uploaded image"} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover transition-transform group-enabled:group-hover:scale-[1.02]" />
              {(isCurrent || isSelected) && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-extrabold text-white">{isSelected && !isCurrent ? "Selected" : "Current"}</span>}
            </button>;
          })}
        </div>}
      </main>
    </div>
  </FullScreenModal>;
}
