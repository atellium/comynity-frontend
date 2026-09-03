"use client";

import { useEffect, useRef } from "react";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "./category.slice";
import {
	getFeaturedCategories,
	getPopularCategories,
} from "./category.service";

export function CategoryCacheRefresher() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();
	const isQueryCacheRestoring = useIsRestoring();
	const isCategoryCacheRehydrated = useAppSelector(
		(state) => state.categories._persist?.rehydrated ?? false,
	);
	const refreshed = useRef(false);

	useEffect(() => {
		if (
			refreshed.current ||
			isQueryCacheRestoring ||
			!isCategoryCacheRehydrated
		) {
			return;
		}

		refreshed.current = true;
		void Promise.allSettled([
			dispatch(fetchCategories()),
			queryClient.fetchQuery({
				queryKey: ["categories", "featured"],
				queryFn: ({ signal }) => getFeaturedCategories(signal),
				staleTime: 0,
			}),
			queryClient.fetchQuery({
				queryKey: ["categories", "popular"],
				queryFn: ({ signal }) => getPopularCategories(signal),
				staleTime: 0,
			}),
		]);
	}, [
		dispatch,
		isCategoryCacheRehydrated,
		isQueryCacheRestoring,
		queryClient,
	]);

	return null;
}
