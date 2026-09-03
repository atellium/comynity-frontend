"use client";

import Image from "next/image";
import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheetModal } from "@/components/modals";
import { SaveButton } from "@/features/saved-items";

export function BusinessDetailImage({ thumbnail, businessName, businessId }: { thumbnail: string | null; businessName: string; businessId: string }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  async function shareBusiness() {
    const url = window.location.href;
    const isInstalledPwa = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    if (isInstalledPwa && navigator.share) {
      try {
        await navigator.share({ title: businessName, text: `Check out ${businessName} on Comynity:\n${url}` });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
      }
      return;
    }

    setShareUrl(url);
    setCopied(false);
    setShareOpen(true);
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

  return <><div className="relative aspect-video w-full bg-slate-50">
    <Image src={thumbnail || "/images/default.jpg"} alt={businessName} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="absolute top-4 left-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"
    >
      <ArrowLeft size={22} strokeWidth={2} aria-hidden="true" />
    </button>
    <div className="absolute right-3 top-4 z-10 flex gap-2">
      <button type="button" onClick={() => void shareBusiness()} aria-label="Share business" className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"><Share2 size={20} aria-hidden="true" /></button>
      <SaveButton itemType="business" objectId={businessId} className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95" />
    </div>
  </div>
  <BottomSheetModal open={shareOpen} onClose={() => setShareOpen(false)} title={`Share ${businessName}`} closeLabel="Close share options">
    <div className="px-page pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <h2 className="text-xl font-extrabold">Share this business</h2>
      <p className="mt-1 text-sm text-foreground-muted dark:text-foreground-dark-muted">Send {businessName} to friends and family.</p>
      <div className="mt-6 flex items-start justify-center gap-10">
        <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${businessName} on Comynity:\n${shareUrl}`)}`} target="_blank" rel="noreferrer" className="group flex w-16 min-w-0 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-950 dark:text-emerald-300"><i className="fa-brands fa-whatsapp" aria-hidden="true" /></span><span className="text-[11px] font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">WhatsApp</span></a>
        <button type="button" onClick={copyShareLink} className="group flex w-16 min-w-0 flex-col items-center gap-2 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-lg text-brand transition-transform group-hover:scale-105 dark:bg-brand-950 dark:text-brand-300"><i className={`fa-solid ${copied ? "fa-check" : "fa-link"}`} aria-hidden="true" /></span><span className="text-[11px] font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">{copied ? "Copied" : "Copy link"}</span></button>
      </div>
    </div>
  </BottomSheetModal></>;
}
