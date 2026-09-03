"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomSheetModal } from "@/components/modals";
import { getBusinessNameBySlug, getNearbyOffers } from "@/features/businesses/business.service";
import type { BusinessNameDetail, NearbyOffer } from "@/features/businesses/business.types";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppSelector } from "@/store/hooks";

const HOMEPAGE_OFFER_LIMIT = 6;

export function NearbyOffers() {
	const hydrated = useHydrated();
	const { lat, lng, locality, city } = useAppSelector((state) => state.location);
	const [selectedOffer, setSelectedOffer] = useState<NearbyOffer | null>(null);
	const query = useQuery({
		queryKey: ["nearby-offers", "home", lat, lng],
		queryFn: () => getNearbyOffers({ lat: lat!, lng: lng! }),
		enabled: hydrated && lat !== null && lng !== null,
	});

	if (!hydrated || lat === null || lng === null) return null;
	if (query.isPending) return <NearbyOffersSkeleton />;
	if (query.isError || !query.data.results.length) return null;

	const offers = query.data.results.slice(0, HOMEPAGE_OFFER_LIMIT);

	return (
		<section
			className="mx-auto w-full max-w-5xl pb-4"
			aria-labelledby="nearby-offers-title"
		>
			<div className="mb-4 flex items-end justify-between gap-4 px-page">
				<div className="min-w-0">
					<h2
						id="nearby-offers-title"
						className="text-lg font-extrabold tracking-tight text-foreground dark:text-foreground-dark"
					>
						Offers Nearby
					</h2>
					<p className="mt-1 truncate text-xs font-medium text-foreground-muted dark:text-foreground-dark-muted">
						{locality && city
							? `Fresh deals around ${locality}, ${city}`
							: "Fresh deals from businesses near you"}
					</p>
				</div>
				<Link
					href="/offers"
					className="shrink-0 text-xs font-extrabold text-brand hover:text-brand-800"
				>
					Explore all
					<i className="fa-solid fa-chevron-right ml-1 text-[9px]" aria-hidden="true" />
				</Link>
			</div>

			<div
				className="hide-scrollbar flex gap-3 overflow-x-auto px-page pb-3"
				aria-label="Nearby offer list"
			>
				{offers.map((offer) => (
					<NearbyOfferCard
						key={offer.id}
						offer={offer}
						onReadMore={() => setSelectedOffer(offer)}
					/>
				))}
			</div>

			<OfferDetailsSheet
				offer={selectedOffer}
				onClose={() => setSelectedOffer(null)}
			/>
		</section>
	);
}

function NearbyOfferCard({
	offer,
	onReadMore,
}: {
	offer: NearbyOffer;
	onReadMore: () => void;
}) {
	const image = offer.image || offer.business.thumbnail;

	return (
		<article className="flex w-[82vw] max-w-80 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-200 dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
			<div className="relative flex w-28 shrink-0 items-center justify-center overflow-hidden bg-brand-50 text-brand dark:bg-brand-950">
				{image ? (
					// The API can return offer images from multiple media paths, so use the browser image loader.
					// eslint-disable-next-line @next/next/no-img-element
					<img src={image} alt="" className="absolute inset-0 size-full object-cover" />
				) : (
					<i className="fa-solid fa-tags text-3xl" aria-hidden="true" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col p-3">
				<h3 className="truncate text-sm font-extrabold text-foreground dark:text-foreground-dark">
					{offer.title}
				</h3>
				<p className="mt-1 truncate text-xs font-semibold text-brand dark:text-brand-300">
					{offer.business.name}
				</p>
				<p className="mt-2 line-clamp-2 text-xs leading-4 font-medium text-foreground-muted dark:text-foreground-dark-muted">
					{offer.description}
				</p>
				<a
					href={`/offers#offer-${offer.id}`}
					onClick={(event) => {
						event.preventDefault();
						onReadMore();
					}}
					className="mt-3 inline-flex items-center gap-1 self-start text-xs font-extrabold text-brand underline-offset-4 hover:underline dark:text-brand-300"
				>
					Read more
					<i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
				</a>
			</div>
		</article>
	);
}

function OfferDetailsSheet({
	offer,
	onClose,
}: {
	offer: NearbyOffer | null;
	onClose: () => void;
}) {
	const image = offer?.image || offer?.business.thumbnail;
	const businessQuery = useQuery({
		queryKey: ["business", "offer-details", offer?.business.slug],
		queryFn: () => getBusinessNameBySlug(offer!.business.slug),
		enabled: Boolean(offer),
	});

	return (
		<BottomSheetModal
			open={Boolean(offer)}
			onClose={onClose}
			title="Offer details"
			closeLabel="Close offer details"
		>
			{offer && <div className="px-page pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
				{image && (
					<div className="mb-5 h-44 overflow-hidden rounded-2xl bg-brand-50">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={image} alt="" className="size-full object-cover" />
					</div>
				)}
				<h3 className="text-xl font-extrabold text-foreground dark:text-foreground-dark">
					{offer.title}
				</h3>
				<p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground-muted dark:text-foreground-dark-muted">
					{offer.description}
				</p>

				<div className="mt-4 space-y-1.5 text-sm">
					<p className="flex items-center gap-2 text-foreground dark:text-foreground-dark">
						<i className="fa-solid fa-calendar-day w-4 text-center text-brand" aria-hidden="true" />
						<span className="font-extrabold">Valid from:</span>
						<span className="font-semibold">{formatDate(offer.starts_at)}</span>
					</p>
					<p className="flex items-center gap-2 text-foreground dark:text-foreground-dark">
						<i className="fa-solid fa-calendar-check w-4 text-center text-brand" aria-hidden="true" />
						<span className="font-extrabold">Valid until:</span>
						<span className="font-semibold">{formatDate(offer.expires_at)}</span>
					</p>
				</div>

				{offer.terms.length > 0 && (
					<div className="mt-5">
						<h4 className="text-sm font-extrabold text-foreground dark:text-foreground-dark">
							Terms and conditions
						</h4>
						<ul className="mt-3 space-y-2">
							{offer.terms.map((term, index) => (
								<li key={index} className="flex gap-2 text-sm text-foreground-muted dark:text-foreground-dark-muted">
									<i className="fa-solid fa-check mt-1 text-[10px] text-brand" aria-hidden="true" />
									<span>{term}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				<OfferBusinessCard
					offer={offer}
					business={businessQuery.data}
					loading={businessQuery.isPending}
					onViewBusiness={onClose}
				/>
			</div>}
		</BottomSheetModal>
	);
}

function OfferBusinessCard({
	offer,
	business,
	loading,
	onViewBusiness,
}: {
	offer: NearbyOffer;
	business?: BusinessNameDetail;
	loading: boolean;
	onViewBusiness: () => void;
}) {
	const businessHref = `/business/${encodeURIComponent(offer.business.slug)}`;
	const thumbnail = business?.media.thumbnail || offer.business.thumbnail;
	const category = business?.categories?.[0]?.display_name ?? "Local business";
	const address = business
		? (business.location.display_full_address
			? [business.location.address, business.location.landmark, business.location.locality, business.location.city.name, business.location.postal_code]
			: [business.location.locality, business.location.city.name]
		).filter(Boolean).join(", ")
		: `${offer.business.locality}, ${offer.business.city.name}`;
	const coordinates = business?.location.coordinates;
	const directionsHref = coordinates && Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude)
		? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`
		: undefined;

	return (
		<section className="mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
			<Link href={businessHref} onClick={onViewBusiness} className="flex items-center gap-3 p-4">
				<span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand dark:bg-brand-950">
					{thumbnail ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
					) : (
						<i className="fa-solid fa-store text-xl" aria-hidden="true" />
					)}
				</span>
				<span className="min-w-0 flex-1">
					<span className="flex items-center gap-1.5">
						<span className="truncate text-sm font-extrabold text-foreground dark:text-foreground-dark">{offer.business.name}</span>
						{business?.is_verified && <i className="fa-solid fa-badge-check shrink-0 text-xs text-brand" aria-label="Verified business" />}
					</span>
					<span className="mt-1 block truncate text-[11px] font-bold text-brand">{category}</span>
					<span className="mt-1.5 flex items-center gap-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">
						<i className="fa-solid fa-location-dot shrink-0 text-brand" aria-hidden="true" />
						<span className="truncate">{address}</span>
					</span>
				</span>
				<i className="fa-solid fa-chevron-right shrink-0 text-xs text-foreground-subtle" aria-hidden="true" />
			</Link>

			<div className="grid grid-cols-4 gap-2 border-t border-border-subtle p-3 dark:border-border-dark-subtle">
				<BusinessCardAction href={business?.contact.phone ? `tel:${business.contact.phone}` : undefined} icon="fa-phone" label="Call" loading={loading} />
				<BusinessCardAction href={business?.contact.whatsapp ? `https://wa.me/${business.contact.whatsapp.replace(/\D/g, "")}` : undefined} icon="fa-whatsapp" label="WhatsApp" brand external loading={loading} />
				<BusinessCardAction href={directionsHref} icon="fa-diamond-turn-right" label="Directions" external loading={loading} />
				<BusinessCardAction href={businessHref} icon="fa-store" label="View business" onClick={onViewBusiness} />
			</div>
		</section>
	);
}

function BusinessCardAction({ href, icon, label, brand = false, external = false, loading = false, onClick }: { href?: string; icon: string; label: string; brand?: boolean; external?: boolean; loading?: boolean; onClick?: () => void }) {
	const className = "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-brand-200 bg-surface px-1 text-center text-[10px] font-extrabold text-brand transition-colors hover:bg-brand-50 dark:border-brand-800 dark:bg-surface-dark dark:hover:bg-brand-950";
	const content = <><i className={`${brand ? "fa-brands" : "fa-solid"} ${icon} text-sm`} aria-hidden="true" /><span className="w-full truncate">{label}</span></>;
	return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onClick={onClick} className={className}>{content}</a> : <span aria-disabled="true" className={`${className} ${loading ? "animate-pulse" : "cursor-not-allowed opacity-40"}`}>{content}</span>;
}

function formatDate(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? value
		: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function NearbyOffersSkeleton() {
	return (
		<section className="mx-auto w-full max-w-5xl pb-2" aria-label="Loading nearby offers">
			<div className="mb-4 flex items-center justify-between px-page">
				<div className="h-5 w-32 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
				<div className="h-4 w-16 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
			</div>
			<div className="flex gap-3 overflow-hidden px-page">
				{Array.from({ length: 3 }, (_, index) => (
					<div
						key={index}
						className="h-40 w-[82vw] max-w-80 shrink-0 animate-pulse rounded-2xl bg-background-muted dark:bg-background-dark-muted"
					/>
				))}
			</div>
		</section>
	);
}
