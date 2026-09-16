"use client";

import Image from "next/image";
import { usePopularCategories } from "@/features/categories";
import { useCategoryNavigation } from "@/features/search/use-category-navigation";
import { useHydrated } from "@/lib/use-hydrated";

export function PopularCategoriesGrid() {
	const hydrated = useHydrated();
	const openCategory = useCategoryNavigation();
	const { data: categories = [], isPending } = usePopularCategories();

	if (!hydrated || isPending) return <CategoriesGridSkeleton />;
	if (categories.length === 0) return null;

	return (
		<section
			className="mx-auto w-full max-w-5xl pt-3"
			aria-labelledby="popular-categories-title"
		>
			<CategoriesGridTitle />
			<div className="hide-scrollbar flex gap-3 overflow-x-auto bg-surface px-page pb-2 dark:bg-surface-dark">
				{categories.map((category) => (
					<button
						key={category.id}
						type="button"
						onClick={() =>
							openCategory({
								...category,
								label: category.display_name?.trim() || category.label?.trim() || category.name,
							})
						}
					className="group flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-xl py-2 text-center transition-colors hover:bg-surface-secondary active:bg-brand-50 dark:hover:bg-surface-dark-secondary dark:active:bg-brand-950"
					>
						<span className="relative w-full h-24 overflow-hidden rounded-xl bg-gray-100 transition-transform group-hover:scale-105 dark:bg-slate-800">
							<Image
								src={category.image || "/images/default_category.png"}
								alt=""
								fill
								sizes="80px"
								className="object-contain p-1.5"
							/>
						</span>
						<span className="w-full truncate text-xs font-semibold leading-4 text-foreground dark:text-foreground-dark">
							{category.display_name?.trim() || category.label?.trim() || category.name}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}

function CategoriesGridTitle() {
	return (
		<h2
			id="popular-categories-title"
			className="px-page  font-extrabold tracking-tight text-foreground dark:text-foreground-dark"
		>
			Popular Categories
		</h2>
	);
}

function CategoriesGridSkeleton() {
	return (
		<section
			className="mx-auto w-full max-w-5xl py-4"
			aria-label="Loading featured categories"
		>
			<CategoriesGridTitle />
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
