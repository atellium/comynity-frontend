"use client";

import { useRouter } from "next/navigation";
import { getCategoryDisplayName, type CategorySearchItem } from "@/features/categories";
import { businessListingPath } from "@/lib/business-listing-url";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRecentCategory } from "./search.slice";

export function useCategoryNavigation() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { city, locality } = useAppSelector((state) => state.location);

	return (category: CategorySearchItem) => {
		if (!city || !locality) return false;
		dispatch(addRecentCategory({ ...category, label: getCategoryDisplayName(category) }));
		router.push(businessListingPath({ city, locality, categorySlug: category.slug }));
		return true;
	};
}
