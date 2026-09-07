"use client";

import { useState } from "react";
import { BottomSheetModal } from "@/components/modals";
import type { BusinessDetailOffer } from "../../business.types";

export function BusinessOffersSection({ offers }: { offers: BusinessDetailOffer[] | null; businessThumbnail: string | null }) {
  const [selectedOffer, setSelectedOffer] = useState<BusinessDetailOffer | null>(null);

  if (!offers?.length) return null;

  return (
    <section className="mt-4" aria-label="Business offers">
      <div className="hide-scrollbar -mx-page flex gap-3 overflow-x-auto px-page pb-2">
        {offers.map((offer) => (
            <article
              key={offer.id}
              className={`${offers.length === 1 ? "w-full" : "w-[76vw] max-w-72"} flex min-h-32 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-xs dark:border-border-dark-subtle dark:bg-surface-dark-secondary`}
            >
              <div className="flex w-16 shrink-0 items-center justify-center bg-brand-50 text-brand dark:bg-brand-950">
                <span className="flex size-9 items-center justify-center rounded-full bg-surface text-brand shadow-xs dark:bg-surface-dark">
                  <i className="fa-solid fa-tag text-sm" aria-hidden="true" />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-3">
                <h3 className="truncate text-sm font-extrabold text-foreground dark:text-foreground-dark">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-foreground-muted dark:text-foreground-dark-muted">
                    {offer.description}
                  </p>
                )}
                <p className="mt-2 text-[11px] font-bold text-brand dark:text-brand-300">
                  <i className="fa-solid fa-clock mr-1.5" aria-hidden="true" />
                  Ends {formatOfferDate(offer.expires_at)}
                </p>
                <button type="button" onClick={() => setSelectedOffer(offer)} className="mt-auto inline-flex items-center gap-1 self-end text-xs font-extrabold text-brand underline-offset-4 hover:underline dark:text-brand-300">
                  Read more
                  <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
      </div>
      <BusinessOfferDetailsSheet offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
    </section>
  );
}

function BusinessOfferDetailsSheet({ offer, onClose }: { offer: BusinessDetailOffer | null; onClose: () => void }) {
  return (
    <BottomSheetModal open={Boolean(offer)} onClose={onClose} title="Offer details" closeLabel="Close offer details">
      {offer && <div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand dark:bg-brand-950">
            <i className="fa-solid fa-tag" aria-hidden="true" />
          </span>
          <h3 className="min-w-0 flex-1 text-xl font-extrabold text-foreground dark:text-foreground-dark">{offer.title}</h3>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground-muted dark:text-foreground-dark-muted">{offer.description}</p>
        <div className="mt-4 space-y-1.5 text-sm">
          <p className="flex items-center gap-2 text-foreground dark:text-foreground-dark"><i className="fa-solid fa-calendar-day w-4 text-center text-brand" aria-hidden="true" /><span className="font-extrabold">Valid from:</span><span className="font-semibold">{formatOfferDate(offer.starts_at)}</span></p>
          <p className="flex items-center gap-2 text-foreground dark:text-foreground-dark"><i className="fa-solid fa-calendar-check w-4 text-center text-brand" aria-hidden="true" /><span className="font-extrabold">Valid until:</span><span className="font-semibold">{formatOfferDate(offer.expires_at)}</span></p>
        </div>
        {offer.terms.length > 0 && <div className="mt-5">
          <h4 className="text-sm font-extrabold text-foreground dark:text-foreground-dark">Terms and conditions</h4>
          <ul className="mt-3 space-y-2">{offer.terms.map((term, index) => <li key={index} className="flex gap-2 text-sm text-foreground-muted dark:text-foreground-dark-muted"><i className="fa-solid fa-check mt-1 text-[10px] text-brand" aria-hidden="true" /><span>{term}</span></li>)}</ul>
        </div>}
      </div>}
    </BottomSheetModal>
  );
}

function formatOfferDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}
