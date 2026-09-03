"use client";

import Link from "next/link";
import { useFeaturedCategories } from "@/features/categories";
import { useCategoryNavigation } from "@/features/search/use-category-navigation";
import { useHydrated } from "@/lib/use-hydrated";

const categoryStyles = [
	"bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
	"bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
	"bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
	"bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300",
	"bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
	"bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300",
	"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
	"bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
] as const;

export function PopularCategoriesScroller() {
	const hydrated = useHydrated();
	const openCategory = useCategoryNavigation();
	const { data: categories = [], isPending } = useFeaturedCategories();

	if (!hydrated || isPending) return <CategoriesSkeleton />;
	if (categories.length === 0) return null;

	return (
		<section
			className="mx-auto w-full max-w-5xl px-page py-4   "
			aria-label="Featured categories"
		>
			<div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm dark:border-border-dark-subtle dark:bg-surface-dark ">
				<div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain">
					{categories.map((category, index) => (
						<button
							key={category.id}
							type="button"
							onClick={() =>
								openCategory({
									...category,
									label:
										category.label ?? category.display_name ?? category.name,
								})
							}
              className="group flex basis-[19%] shrink-0 snap-start flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-surface-secondary active:bg-brand-50 dark:hover:bg-surface-dark-secondary dark:active:bg-brand-950  "
            >
              <span
                className={`flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-105  ${categoryStyles[index % categoryStyles.length]}`}
              >
                <i
                  className={`${category.icon || "fa-solid fa-grid-2"} text-xl`}
                  aria-hidden="true"
                />
              </span>
							<span className="w-full text-xs leading-4 font-medium text-foreground dark:text-foreground-dark ">
								{category.display_name || category.label}
							</span>
						</button>
					))}
					<Link
						href="/categories"
						className="group flex basis-[19%] shrink-0 snap-start flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-surface-secondary active:bg-brand-50 dark:hover:bg-surface-dark-secondary dark:active:bg-brand-950  "
					>
						<span className="flex size-12 items-center justify-center rounded-full bg-surface-tertiary text-foreground-secondary transition-transform group-hover:scale-105 dark:bg-surface-dark-tertiary dark:text-foreground-dark-secondary ">
							<i
								className="fa-solid fa-arrow-right text-xl "
								aria-hidden="true"
							/>
						</span>
						<span className="w-full text-xs leading-4 font-medium text-foreground dark:text-foreground-dark ">
							View all
						</span>
					</Link>
				</div>
			</div>
		</section>
	);
}

function CategoriesSkeleton() {
	return (
		<section
			className="mx-auto w-full max-w-5xl px-page py-4   "
			aria-label="Loading featured categories"
		>
			<div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm dark:border-border-dark-subtle dark:bg-surface-dark ">
				<div className="flex gap-3">
					{Array.from({ length: 6 }, (_, index) => (
						<div
							key={index}
							className="flex basis-[19%] shrink-0 flex-col items-center gap-2 p-2  "
						>
							<span className="size-12 animate-pulse rounded-full bg-background-muted dark:bg-background-dark-muted " />
							<span className="h-3 w-4/5 animate-pulse rounded bg-background-muted dark:bg-background-dark-muted" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
