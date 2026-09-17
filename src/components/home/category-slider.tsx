"use client";

import Image from "next/image";
import { useBusinessCategoriesByParent } from "@/features/categories";
import { useCategoryNavigation } from "@/features/search/use-category-navigation";
import { useHydrated } from "@/lib/use-hydrated";

export function CategorySlider({ title, categorySlug }: { title: string; categorySlug: string }) {
	const hydrated = useHydrated();
	const openCategory = useCategoryNavigation();
	const { data: categories = [], isPending } = useBusinessCategoriesByParent(categorySlug);
	const titleId = `category-slider-${categorySlug}`;

	if (!hydrated || isPending) return <CategorySliderSkeleton title={title} titleId={titleId} />;
	if (categories.length === 0) return null;

	return (
		<section className="mx-auto w-full max-w-5xl pt-2" aria-labelledby={titleId}>
			<CategorySliderTitle title={title} titleId={titleId} />
			<div className="hide-scrollbar flex gap-3 overflow-x-auto bg-surface px-page pb-2 dark:bg-surface-dark">
				{categories.map((category) => {
					const label = category.display_name?.trim() || category.label?.trim() || category.name;
					return (
						<button
							key={category.id}
							type="button"
							onClick={() => openCategory({ ...category, label })}
							className="group flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-xl py-2 text-center transition-colors hover:bg-surface-secondary active:bg-brand-50 dark:hover:bg-surface-dark-secondary dark:active:bg-brand-950"
						>
							<span className="relative h-24 w-full overflow-hidden rounded-xl bg-gray-100 transition-transform group-hover:scale-105 dark:bg-slate-800">
								<Image
									src={category.image || "/images/default_category.png"}
									alt=""
									fill
									sizes="96px"
									className="object-contain p-1.5"
								/>
							</span>
							<span className="w-full truncate text-xs font-semibold leading-4 text-foreground dark:text-foreground-dark">
								{label}
							</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}

function CategorySliderTitle({ title, titleId }: { title: string; titleId: string }) {
	return (
		<h2 id={titleId} className="px-page font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
			{title}
		</h2>
	);
}

function CategorySliderSkeleton({ title, titleId }: { title: string; titleId: string }) {
	return (
		<section className="mx-auto w-full max-w-5xl py-4" aria-label={`Loading ${title}`}>
			<div className="px-page">
				<span
					id={titleId}
					className="block h-5 w-36 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted"
				/>
			</div>
			<div className="hide-scrollbar flex gap-3 overflow-x-auto bg-surface px-page py-3 dark:bg-surface-dark">
				{Array.from({ length: 6 }, (_, index) => (
					<div key={index} className="flex w-24 shrink-0 flex-col items-center gap-2 p-2">
						<span className="size-20 animate-pulse rounded-xl bg-background-muted dark:bg-background-dark-muted" />
						<span className="h-3 w-4/5 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
					</div>
				))}
			</div>
		</section>
	);
}
