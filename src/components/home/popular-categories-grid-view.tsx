"use client";

import Image from "next/image";
import { useFeaturedCategories } from "@/features/categories";
import { useCategoryNavigation } from "@/features/search/use-category-navigation";
import { useHydrated } from "@/lib/use-hydrated";

const MAX_VISIBLE_CATEGORIES = 12;

export function PopularCategoriesGrid() {
	const hydrated = useHydrated();
	const openCategory = useCategoryNavigation();
	const { data: categories = [], isPending } = useFeaturedCategories();

	if (!hydrated || isPending) return <CategoriesGridSkeleton />;
	if (categories.length === 0) return null;

	return (
		<section
			className="mx-auto w-full max-w-5xl pb-4 pt-4"
			aria-labelledby="popular-categories-title"
		>
			<CategoriesGridTitle />
			<div className="grid grid-cols-4 gap-2 bg-surface pb-2 pl-page pr-page dark:border-border-dark-subtle dark:bg-surface-dark">
				{categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
					<button
						key={category.id}
						type="button"
						onClick={() =>
							openCategory({
								...category,
								label: category.display_name?.trim() || category.name,
							})
						}
					className="group flex min-w-0 flex-col items-center gap-1.5 rounded-xl py-2 text-center transition-colors hover:bg-surface-secondary active:bg-brand-50 dark:hover:bg-surface-dark-secondary dark:active:bg-brand-950 "
					>
						<span className="relative h-[4.5rem] w-full overflow-hidden rounded-xl bg-gray-100 transition-transform group-hover:scale-105 dark:bg-slate-800">
							<Image
								src={category.image || "/images/default_category.png"}
								alt=""
								fill
								sizes="80px"
								className="object-contain p-1.5"
							/>
						</span>
						<span className="w-full truncate text-xs leading-4 font-semibold text-foreground dark:text-foreground-dark">
							{category.display_name?.trim() || category.name}
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
			className="mb-2 px-page text-lg font-extrabold tracking-tight text-foreground dark:text-foreground-dark"
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
			<div className="grid grid-cols-4 gap-2 border-y border-border-subtle bg-surface py-3 pl-page pr-page shadow-sm dark:border-border-dark-subtle dark:bg-surface-dark">
				{Array.from({ length: 12 }, (_, index) => (
					<div key={index} className="flex flex-col items-center gap-2 p-2 ">
						<span className="h-[4.5rem] w-full animate-pulse rounded-xl bg-background-muted dark:bg-background-dark-muted" />
						<span className="h-3 w-4/5 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
					</div>
				))}
			</div>
		</section>
	);
}
