"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	BadgeCheck,
	ChevronLeft,
	Clock,
	X,
} from "lucide-react";
import { businessListingPath } from "@/lib/business-listing-url";
import { useAppSelector } from "@/store/hooks";

export function BusinessListHeader({
	categoryLabel,
	categorySlug,
	verifiedOnly,
	openNowOnly,
	showFilters,
	onVerifiedChange,
	onOpenNowChange,
}: {
	categoryLabel: string;
	categorySlug: string;
	verifiedOnly: boolean;
	openNowOnly: boolean;
	showFilters: boolean;
	onVerifiedChange: (value: boolean) => void;
	onOpenNowChange: (value: boolean) => void;
}) {
	const router = useRouter();
	const { locality, city, selectionRevision } = useAppSelector(
		(state) => state.location,
	);
	const initialRevision = useRef(selectionRevision);
	const filtersSentinelRef = useRef<HTMLDivElement>(null);
	const [areFiltersStuck, setAreFiltersStuck] = useState(false);

	useEffect(() => {
		if (!showFilters) return;

		const sentinel = filtersSentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => setAreFiltersStuck(!entry.isIntersecting),
			{ rootMargin: "-1px 0px 0px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [showFilters]);

	useEffect(() => {
		if (selectionRevision === initialRevision.current || !city || !locality)
			return;
		const filters = new URLSearchParams();
		if (openNowOnly) filters.set("open_now", "true");
		if (verifiedOnly) filters.set("is_verified", "true");
		const filterQuery = filters.size ? `?${filters.toString()}` : "";
		router.replace(
			`${businessListingPath({ city, locality, categorySlug })}${filterQuery}`,
		);
	}, [
		categorySlug,
		city,
		locality,
		openNowOnly,
		router,
		selectionRevision,
		verifiedOnly,
	]);

	const verifiedFilter = (
		<button
			type="button"
			aria-pressed={verifiedOnly}
			onClick={() => onVerifiedChange(!verifiedOnly)}
			className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${verifiedOnly ? "border-brand bg-brand text-white" : "border-border-subtle bg-surface-tertiary/50 text-foreground-secondary hover:border-brand-200 hover:bg-surface-tertiary dark:border-border-dark-subtle dark:bg-surface-dark-tertiary/50 dark:text-foreground-dark-secondary dark:hover:border-brand-800 dark:hover:bg-surface-dark-tertiary"}`}
		>
			<BadgeCheck size={14} aria-hidden="true" />
			Verified
		</button>
	);
	const openNowFilter = (
		<button
			type="button"
			aria-pressed={openNowOnly}
			onClick={() => onOpenNowChange(!openNowOnly)}
			className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${openNowOnly ? "border-brand bg-brand text-white" : "border-border-subtle bg-surface-tertiary/50 text-foreground-secondary hover:border-brand-200 hover:bg-surface-tertiary dark:border-border-dark-subtle dark:bg-surface-dark-tertiary/50 dark:text-foreground-dark-secondary dark:hover:border-brand-800 dark:hover:bg-surface-dark-tertiary"}`}
		>
			<Clock size={14} aria-hidden="true" />
			Open now
		</button>
	);

	return (
		<>
			<header className={`bg-surface px-page pt-2.5 dark:bg-surface-dark ${showFilters ? "pb-0.5" : "pb-3"}`}>
				<div className="flex h-13 items-center rounded-xl border border-border-subtle  shadow transition-colors focus-within:border-brand-300 dark:border-border-dark-subtle dark:bg-surface-dark-secondary">
					<button
						type="button"
						onClick={() => router.back()}
						className="flex size-11 shrink-0 items-center justify-center text-brand dark:text-foreground-dark-secondary"
						aria-label="Go back"
					>
						<ChevronLeft size={34} strokeWidth={1.75} aria-hidden="true" />
					</button>
					<div className="min-w-0 flex-1" role="search">
						<h1 className="truncate text-lg font-bold text-foreground dark:text-foreground-dark">
							{categoryLabel}
						</h1>
					</div>
					<button
						type="button"
						onClick={() => router.push("/search")}
						className="flex size-11 shrink-0 items-center justify-center text-foreground-muted transition-colors hover:text-foreground dark:text-foreground-dark-muted dark:hover:text-foreground-dark"
						aria-label="Clear category and search"
					>
						<X size={19} strokeWidth={2.25} />
					</button>
				</div>
			</header>
			{showFilters && (
				<>
					<div ref={filtersSentinelRef} aria-hidden="true" />
					<div
						className={`sticky top-0 z-30 bg-surface px-page py-3 backdrop-blur-xl transition-shadow dark:bg-surface-dark/80 ${areFiltersStuck ? "shadow-md" : "shadow-none"}`}
					>
						<div className="flex items-center gap-2">
							{openNowFilter}
							{verifiedFilter}
						</div>
					</div>
				</>
			)}
		</>
	);
}
