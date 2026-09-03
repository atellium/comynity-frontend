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
	const aliases = Array.isArray(category.aliases)
		? category.aliases
		: category.aliases?.split(",") ?? [];
	const values = [category.name, category.label, ...aliases];

	return values.some((value) => {
		const normalizedValue = normalize(value);
		return normalizedValue.length > 0
			&& normalizedValue.split(/\s+/).some((word) => word.startsWith(query));
	});
}
