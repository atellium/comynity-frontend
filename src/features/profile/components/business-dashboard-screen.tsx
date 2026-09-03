"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MobileHeader from "@/components/layout/MobileHeader";
import { BottomSheetModal } from "@/components/modals";
import { getOwnedBusinessInfo } from "../profile.service";

export function BusinessDashboardScreen({ slug }: { slug: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const { data } = useQuery({ queryKey: ["businesses", "mine", slug], queryFn: () => getOwnedBusinessInfo(slug) });

  function openQrCode() {
    setQrUrl(new URL(`/business/${encodeURIComponent(slug)}`, window.location.origin).href);
    setQrOpen(true);
  }

  async function downloadQrCode() {
    if (!qrUrl) return;
    setDownloading(true);
    setQrError(null);
    try {
      const qrImageUrl = qrCodeUrl(qrUrl, 1000);
      const [qrResponse, iconResponse] = await Promise.all([fetch(qrImageUrl), fetch("/app-icons/icon-128X128.png")]);
      if (!qrResponse.ok || !iconResponse.ok) throw new Error("Unable to prepare QR code.");
      const [qrImage, iconImage] = await Promise.all([createImageBitmap(await qrResponse.blob()), createImageBitmap(await iconResponse.blob())]);
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(qrImage, 0, 0, 1000, 1000);
      const iconSize = 170;
      const iconPosition = (canvas.width - iconSize) / 2;
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.roundRect(iconPosition - 14, iconPosition - 14, iconSize + 28, iconSize + 28, 28);
      context.fill();
      context.drawImage(iconImage, iconPosition, iconPosition, iconSize, iconSize);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Unable to create QR image.");
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${slug}-qr-code.png`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      setQrError("Couldn’t download the QR code. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return <div className="min-h-dvh bg-white dark:bg-white">
    <MobileHeader title="Dashboard" subtitle={data?.name ?? "Loading business…"} />
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-page pt-5">
      <Link href={`/business/${encodeURIComponent(slug)}/manage/info`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand" aria-hidden="true"><i className="fa-solid fa-building" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-foreground">Business Information</span><span className="mt-0.5 block truncate text-xs text-foreground-muted">View your business details, contact information and hours.</span></span>
        <i className="fa-solid fa-chevron-right text-xs text-foreground-muted" aria-hidden="true" />
      </Link>
      <Link href={`/business/${encodeURIComponent(slug)}/manage/products`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand" aria-hidden="true"><i className="fa-solid fa-box" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-foreground">Products</span><span className="mt-0.5 block text-xs text-foreground-muted">View and manage your product catalogue.</span></span>
        <i className="fa-solid fa-chevron-right text-xs text-foreground-muted" aria-hidden="true" />
      </Link>
      <Link href={`/business/${encodeURIComponent(slug)}/manage/offers`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand" aria-hidden="true"><i className="fa-solid fa-tags" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-foreground">Offers</span><span className="mt-0.5 block text-xs text-foreground-muted">Create and manage your business offers.</span></span>
        <i className="fa-solid fa-chevron-right text-xs text-foreground-muted" aria-hidden="true" />
      </Link>
      <button type="button" onClick={openQrCode} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand" aria-hidden="true"><i className="fa-solid fa-qrcode" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-foreground">Business QR code</span><span className="mt-0.5 block truncate text-xs text-foreground-muted">Share a scannable link to your business.</span></span>
        <i className="fa-solid fa-chevron-right text-xs text-foreground-muted" aria-hidden="true" />
      </button>
    </main>
    <BottomSheetModal open={qrOpen} onClose={() => setQrOpen(false)} title="Business QR code" closeLabel="Close business QR code">
      <div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 text-center">
        <h2 className="text-xl font-extrabold text-foreground">Business QR code</h2>
        <p className="mt-1 text-sm text-foreground-muted">Scan to open {data?.name ?? "this business"} on Comynity.</p>
        {qrUrl && <div className="relative mx-auto mt-6 aspect-square w-full max-w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          {/* The same-origin route returns a generated bitmap for this business URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl(qrUrl, 600)} alt={`QR code for ${data?.name ?? slug}`} className="size-full" />
          <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-4 border-white bg-white shadow-sm">
            <Image src="/app-icons/icon-128X128.png" alt="" width={48} height={48} className="rounded-lg" />
          </span>
        </div>}
        {qrError && <p role="alert" className="mt-3 text-sm font-semibold text-danger">{qrError}</p>}
        <button type="button" onClick={() => void downloadQrCode()} disabled={downloading || !qrUrl} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-extrabold text-white disabled:opacity-60"><i className={`fa-solid ${downloading ? "fa-circle-notch fa-spin" : "fa-download"}`} aria-hidden="true" />{downloading ? "Preparing…" : "Download QR code"}</button>
      </div>
    </BottomSheetModal>
  </div>;
}

function qrCodeUrl(value: string, size: number) {
  return `/api/business-qr?size=${size}&data=${encodeURIComponent(value)}`;
}
