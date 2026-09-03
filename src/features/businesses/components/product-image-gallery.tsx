"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProductCustomField, ProductDetailImage } from "../business.types";

export function ProductImageGallery({ images, productName, highlights = [] }: { images: ProductDetailImage[]; productName: string; highlights?: ProductCustomField[] }) {
  const orderedImages = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  const gallery = orderedImages.length ? orderedImages : [{ image: "/images/default.jpg", alt_text: "", is_primary: true, sort_order: 0 }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lightboxThumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") setActiveIndex((index) => Math.max(0, index - 1));
      if (event.key === "ArrowRight") setActiveIndex((index) => Math.min(gallery.length - 1, index + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [gallery.length, lightboxOpen]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    lightboxThumbnailRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  function move(direction: number) {
    setActiveIndex((index) => Math.max(0, Math.min(gallery.length - 1, index + direction)));
  }

  function finishSwipe(clientX: number) {
    if (touchStart.current === null) return;
    const distance = clientX - touchStart.current;
    didSwipe.current = Math.abs(distance) > 45;
    if (didSwipe.current) move(distance > 0 ? -1 : 1);
    touchStart.current = null;
  }

  const slider = (lightbox: boolean) => <div className={`relative overflow-hidden ${lightbox ? "h-[calc(100dvh-112px)] w-full" : "aspect-square w-full cursor-zoom-in bg-surface-tertiary dark:bg-surface-dark-tertiary"}`} onClick={lightbox ? undefined : () => { if (!didSwipe.current) setLightboxOpen(true); didSwipe.current = false; }} onTouchStart={(event) => { didSwipe.current = false; touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}>
    <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
      {gallery.map((item, index) => <div key={`${item.image}-${index}`} className="relative h-full w-full shrink-0"><Image src={item.image} alt={item.alt_text || `${productName} image ${index + 1}`} fill priority={index === 0} sizes={lightbox ? "100vw" : "(max-width: 768px) 100vw, 768px"} className={lightbox ? "object-contain" : "object-cover"} />{index === 1 && highlights.length > 0 && <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/70 to-transparent text-white"><dl className="w-3/4 max-w-sm space-y-4 px-page pt-[calc(env(safe-area-inset-top)+64px)]">{highlights.map((field, fieldIndex) => <div key={`${field.title}-${fieldIndex}`}><dt className="text-xs font-medium text-white/75">{field.title}</dt><dd className="mt-1 text-lg font-extrabold leading-snug text-white">{field.value}</dd></div>)}</dl></div>}</div>)}
    </div>
    {gallery.length > 1 && <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-label={`Image ${activeIndex + 1} of ${gallery.length}`}>{gallery.map((_, index) => <span key={index} className={`block rounded-full transition-all ${index === activeIndex ? `h-1.5 w-5 ${lightbox ? "bg-white" : "bg-brand"}` : `size-1.5 ${lightbox ? "bg-white/45" : "bg-white/80 shadow"}`}`} />)}</div>}
  </div>;

  return <>
    {slider(false)}
    {gallery.length > 1 && <div className="hide-scrollbar flex gap-2 overflow-x-auto px-page pb-1 pt-2">{gallery.map((item, index) => <button ref={(element) => { thumbnailRefs.current[index] = element; }} type="button" key={`${item.image}-thumb`} onClick={() => setActiveIndex(index)} aria-label={`Show image ${index + 1}`} aria-current={index === activeIndex} className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === activeIndex ? "border-brand" : "border-transparent opacity-70"}`}><Image src={item.image} alt="" fill sizes="64px" className="object-cover" /></button>)}</div>}
    {lightboxOpen && <div className="fixed inset-0 z-10000 flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`${productName} image gallery`}><div className="flex h-14 shrink-0 items-center justify-between px-3 text-white"><span className="text-sm font-bold">{productName}</span><button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image gallery" className="flex size-10 items-center justify-center rounded-full bg-white/10"><X size={22} /></button></div>{slider(true)}<div className="hide-scrollbar flex h-14 items-center justify-center gap-2 overflow-x-auto px-3">{gallery.map((item, index) => <button ref={(element) => { lightboxThumbnailRefs.current[index] = element; }} type="button" key={`${item.image}-lightbox-thumb`} onClick={() => setActiveIndex(index)} className={`relative size-10 shrink-0 overflow-hidden rounded-md border ${index === activeIndex ? "border-white" : "border-transparent opacity-50"}`} aria-label={`Show image ${index + 1}`}><Image src={item.image} alt="" fill sizes="40px" className="object-cover" /></button>)}</div></div>}
  </>;
}
