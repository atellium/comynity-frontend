"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getFeaturedCategories,
	getPopularCategories,
} from "./category.service";
import type { FeaturedCategory, PopularCategory } from "./category.types";

const CATEGORY_COLLECTION_CACHE_TIME = 30 * 60 * 1000;

function isVisible(category: FeaturedCategory) {
	return category.is_active;
}

function isPopularVisible(category: PopularCategory) {
	return category.is_active && !category.is_hidden;
}

export function useFeaturedCategories() {
	return useQuery({
		queryKey: ["categories", "featured"],
		queryFn: ({ signal }) => getFeaturedCategories(signal),
		select: (categories) =>
			categories.filter((category) => isVisible(category) && category.is_featured),
		staleTime: CATEGORY_COLLECTION_CACHE_TIME,
		gcTime: CATEGORY_COLLECTION_CACHE_TIME,
	});
}

export function usePopularCategories() {
	return useQuery({
		queryKey: ["categories", "popular"],
		queryFn: ({ signal }) => getPopularCategories(signal),
		select: (categories) =>
			categories.filter(
				(category) => isPopularVisible(category) && category.is_popular,
			),
		staleTime: CATEGORY_COLLECTION_CACHE_TIME,
		gcTime: CATEGORY_COLLECTION_CACHE_TIME,
	});
}
