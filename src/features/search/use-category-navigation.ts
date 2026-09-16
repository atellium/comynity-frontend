"use client";

import { useRouter } from "next/navigation";
import { getCategoryDisplayName, type CategorySearchItem } from "@/features/categories";
import { businessListingPath, toPathSegment } from "@/lib/business-listing-url";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRecentCategory } from "./search.slice";
import type { SearchItem } from "./search.types";

export function useCategoryNavigation() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { city, locality } = useAppSelector((state) => state.location);

	return (category: CategorySearchItem) => {
		if (!city || !locality) return false;
		dispatch(addRecentCategory({
			id: category.id,
			type: "business",
			name: category.name,
			label: getCategoryDisplayName(category),
			display_name: getCategoryDisplayName(category),
			slug: category.slug,
			aliases: Array.isArray(category.aliases) ? category.aliases.join(",") : category.aliases ?? "",
		}));
		router.push(businessListingPath({ city, locality, categorySlug: category.slug }));
		return true;
	};
}

export function useSearchItemNavigation() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { city, locality } = useAppSelector((state) => state.location);

	return (item: SearchItem) => {
		if (!city || !locality) return false;
		dispatch(addRecentCategory(item));
		const cityPath = toPathSegment(city);
		const localityPath = toPathSegment(locality);
		if (item.type === "doctor") {
			router.push(`/${cityPath}/${localityPath}/doctors/${encodeURIComponent(item.slug)}`);
			return true;
		}
		if (item.type === "product") {
			router.push(`/${cityPath}/${localityPath}/products/${encodeURIComponent(item.slug)}`);
			return true;
		}
		if (item.type === "business") {
			router.push(businessListingPath({ city, locality, categorySlug: item.slug }));
			return true;
		}
		return false;
	};
}
