import { publicApiClient } from "@/lib/api";
import type {
	CategorySearchItem,
	FeaturedCategoriesResponse,
	PopularCategoriesResponse,
} from "./category.types";

export async function getCategories() {
	const { data } = await publicApiClient.get<CategorySearchItem[]>(
		"/api/categories/search/",
	);

	return data;
}

export async function getFeaturedCategories(signal?: AbortSignal) {
	const { data } = await publicApiClient.get<FeaturedCategoriesResponse>(
		"/api/categories/business/",
		{ params: { is_featured: true }, signal },
	);

	return data.results;
}

export async function getPopularCategories(signal?: AbortSignal) {
	const { data } = await publicApiClient.get<PopularCategoriesResponse>(
		"/api/categories/",
		{ params: { is_popular: true }, signal },
	);

	return data.results;
}
