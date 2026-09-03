"use client";

import { useRouter } from "next/navigation";
import { getCategoryDisplayName, type CategorySearchItem } from "@/features/categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRecentCategory } from "./search.slice";

function toPathSegment(value: string) {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function useCategoryNavigation() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { city, locality } = useAppSelector((state) => state.location);

	return (category: CategorySearchItem) => {
		if (!city || !locality) return false;
		dispatch(addRecentCategory({ ...category, label: getCategoryDisplayName(category) }));
		router.push(
			`/${toPathSegment(city)}/${toPathSegment(locality)}/${encodeURIComponent(category.slug)}`,
		);
		return true;
	};
}
