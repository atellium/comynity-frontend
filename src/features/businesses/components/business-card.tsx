"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { BottomSheetModal } from "@/components/modals";
import { SaveButton } from "@/features/saved-items";
import type { BusinessListItem } from "../business.types";
import { getBusinessCityName } from "../business.utils";

function digits(value: string) {
	return value.replace(/\D/g, "");
}

function formatClosingTime(value: string) {
	const match = value.match(/T(\d{2}):(\d{2})/);
	if (!match) return value;
	const hour = Number(match[1]);
	const minute = match[2];
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 || 12;
	return `${displayHour}${minute === "00" ? "" : `:${minute}`} ${period}`;
}

const hoursStatus = {
	open: { label: "Open", className: "text-emerald-600 dark:text-emerald-400" },
	closing_soon: {
		label: "Closing soon",
		className: "text-amber-600 dark:text-amber-400",
	},
	closed: { label: "Closed", className: "text-rose-600 dark:text-rose-400" },
} as const;

export function BusinessCard({ business }: { business: BusinessListItem }) {
	const [shareOpen, setShareOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState("");
	const [copied, setCopied] = useState(false);
	const categoryText = (business.categories ?? [])
		.map((category) => category.display_name)
		.join(" · ");
	const cityName = getBusinessCityName(business.location.city);
	const addressParts = business.location.display_full_address === false
		? [business.location.locality, cityName]
		: [
			business.location.address,
			business.location.locality,
			cityName,
		];
	const address = addressParts
		.filter(Boolean)
		.join(", ");
	const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.location.coordinates.latitude},${business.location.coordinates.longitude}`;
	const businessHours = business.hours;
	const currentHours = businessHours ? hoursStatus[businessHours.status] : null;
	const shareMessage = `Check out this business on Comynity, ${business.name}, View details, contact, services, timings & more:\n${shareUrl}`;

	async function share() {
		const url = new URL(`/business/${encodeURIComponent(business.slug)}`, window.location.origin).href;
		const isMobile = window.matchMedia("(max-width: 767px)").matches;

		if (!isMobile || !navigator.share) {
			setShareUrl(url);
			setCopied(false);
			setShareOpen(true);
			return;
		}

		try {
			await navigator.share({
				title: business.name,
				text: `Check out this business on Comynity, ${business.name}, View details, contact, services, timings & more:\n${url}`,
			});
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
		}
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

	return (
		<>
		<article className="relative -mx-page border-b-4 border-background-muted bg-surface px-page py-4 first:border-t-4 first:pt-3 dark:border-background-dark-muted dark:bg-surface-dark">
			<SaveButton itemType="business" objectId={business.id} className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-brand shadow-sm dark:bg-surface-dark/90" />
			<Link href={`/business/${encodeURIComponent(business.slug)}`} className="flex items-center gap-2.5" aria-label={`View ${business.name}`}>
				<div className="relative h-30 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary  dark:bg-surface-dark-tertiary">
					<Image
						src={business.media.thumbnail || "/images/default.jpg"}
						alt=""
						fill
						sizes="112px"
						className="object-cover"
					/>
				</div>
				<div className="min-w-0 flex-1 py-0.5 pr-10">
					{business.is_verified && (
						<span
							className="mb-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand dark:bg-brand-950 dark:text-brand-300"
							title="Verified business"
						>
							<i className="fa-solid fa-badge-check" aria-hidden="true" />
							Verified
						</span>
					)}
					<h2 className="truncate text-base font-extrabold text-foreground transition-colors group-hover/details:text-brand dark:text-foreground-dark">
						{business.name}
					</h2>
					<p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
						{categoryText}
					</p>
					<p className="mt-1.5 flex min-w-0 items-center gap-1 text-sm text-foreground-secondary dark:text-foreground-dark-secondary">
						<MapPin
							size={14}
							className="shrink-0 text-foreground-muted"
							aria-hidden="true"
						/>
						<span className="min-w-0 truncate">{address}</span>
					</p>
					{businessHours && currentHours && (
						<p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-foreground-muted dark:text-foreground-dark-muted">
							<Clock
								size={12}
								className={currentHours.className}
								aria-hidden="true"
							/>
							<span className={currentHours.className}>
								{" "}
								{currentHours.label}
							</span>
							{businessHours.next_closing_time && (
								<>
									· 
									<span className="font-medium">
										{" "}
										 {formatClosingTime(businessHours.next_closing_time)}
									</span>
								</>
							)}
							{businessHours.remark && (
								<>
									· <span className="font-medium">  {businessHours.remark}</span>
								</>
							)}
						</p>
					)}
				</div>
			</Link>

			<div className="mt-2.5 flex gap-1.5">
				<Action
					href={
						business.contact.phone ? `tel:${business.contact.phone}` : undefined
					}
					icon="fa-phone"
					label="Call"
				/>
				{business.contact.whatsapp && (
					<Action
						href={`https://wa.me/${digits(business.contact.whatsapp)}`}
						icon="fa-whatsapp"
						label="WhatsApp"
						external
					/>
				)}
				{business.location.display_full_address !== false &&
					business.location.address && (
					<Action
						href={directionsUrl}
						icon="fa-diamond-turn-right"
						label="Direction"
						external
					/>
					)}
				<Action onClick={share} icon="fa-share-nodes" label="Share" />
			</div>
		</article>
		<BottomSheetModal
			open={shareOpen}
			onClose={() => setShareOpen(false)}
			title={`Share ${business.name}`}
			closeLabel="Close share options"
		>
			<div className="px-page pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] ">
				<h2 className="text-xl font-extrabold">Share this business</h2>
				<p className="mt-1 text-sm text-foreground-muted dark:text-foreground-dark-muted">
					Send {business.name} to friends and family.
				</p>
				<div className="mt-6 flex justify-center">
					<a
						href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
						target="_blank"
						rel="noreferrer"
						className="group flex min-w-0 flex-col items-center gap-2 text-center"
					>
						<span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-950 dark:text-emerald-300">
							<i className="fa-brands fa-whatsapp" aria-hidden="true" />
						</span>
						<span className="text-[11px] font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">WhatsApp</span>
					</a>
				</div>
				<div className="mt-6 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-secondary p-2 dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
					<span className="min-w-0 flex-1 truncate px-2 text-sm text-foreground-secondary dark:text-foreground-dark-secondary">{shareUrl}</span>
					<button type="button" onClick={copyShareLink} className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800">
						{copied ? "Copied" : "Copy link"}
					</button>
				</div>
			</div>
		</BottomSheetModal>
		</>
	);
}

function Action({
	href,
	icon,
	label,
	external = false,
	onClick,
}: {
	href?: string;
	icon: string;
	label: string;
	external?: boolean;
	onClick?: () => void;
}) {
	const classes =
		"group flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2 text-[10px] font-bold text-foreground-secondary transition-all hover:border-brand hover:bg-brand-100 hover:text-brand active:scale-[0.98] dark:border-brand-800 dark:bg-brand-950/50 dark:text-foreground-dark-secondary dark:hover:border-brand-500 dark:hover:bg-brand-900/60 dark:hover:text-brand-300";
	const content = (
		<>
			<span className="flex shrink-0 items-center justify-center text-brand dark:text-brand-300">
				<i
					className={`${icon === "fa-whatsapp" ? "fa-brands" : "fa-solid"} ${icon} text-xs`}
				/>
			</span>
			<span className="truncate">{label}</span>
			{external && <ExternalLink className="sr-only" />}
		</>
	);
	if (onClick)
		return (
			<button type="button" onClick={onClick} className={classes}>
				{content}
			</button>
		);
	if (!href)
		return (
			<span
				className={`${classes} cursor-not-allowed opacity-40`}
				aria-disabled="true"
			>
				{content}
			</span>
		);
	return (
		<a
			href={href}
			target={external ? "_blank" : undefined}
			rel={external ? "noreferrer" : undefined}
			className={classes}
		>
			{content}
		</a>
	);
}
