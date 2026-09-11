export { default as categoriesReducer, fetchCategories } from "./category.slice";
export { CategoryCacheRefresher } from "./category-cache-refresher";
export { getFeaturedCategories, getPopularCategories } from "./category.service";
export {
	useFeaturedCategories,
	usePopularCategories,
} from "./use-category-collections";
export type {
	CategoriesState,
	CategorySearchItem,
	FeaturedCategory,
} from "./category.types";

import type { CategorySearchItem } from "./category.types";

export function getCategoryDisplayName(category: Pick<CategorySearchItem, "label" | "name">) {
	return category.label?.trim() || category.name.trim() || "Unnamed category";
}

function normalize(value: unknown) {
	return typeof value === "string"
		? value.trim().toLocaleLowerCase()
		: "";
}

export function matchesCategoryPrefix(
	category: CategorySearchItem,
	query: string,
) {
	const queryParts = normalize(query).split(/\s+/).filter(Boolean);
	if (queryParts.length === 0) return false;

	const aliases = Array.isArray(category.aliases)
		? category.aliases
		: category.aliases?.split(",") ?? [];
	const values = [category.name, category.label, ...aliases];

	return values.some((value) => matchesValuePrefix(value, queryParts));
}

function matchesValuePrefix(value: unknown, queryParts: string[]) {
	const normalizedValue = normalize(value);
	if (!normalizedValue) return false;
	if (normalizedValue.startsWith(queryParts.join(" "))) return true;

	const words = normalizedValue.split(/\s+/);
	return queryParts.every((part) => words.some((word) => word.startsWith(part)));
}
