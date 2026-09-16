"use client";

import { useQuery } from "@tanstack/react-query";
import { searchItems } from "./search.service";
import type { SearchItem } from "./search.types";

function searchLabel(item: SearchItem) {
	return item.display_name || item.label || item.name;
}

function searchableText(item: SearchItem) {
	return [item.display_name, item.label, item.name, item.slug, item.aliases]
		.filter(Boolean)
		.join(" ")
		.toLocaleLowerCase();
}

function filterSearchResults(results: SearchItem[], query: string) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	if (!normalizedQuery) return [];
	return results.filter((item) => searchableText(item).includes(normalizedQuery));
}

function rankSearchResults(results: SearchItem[], query: string) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	if (!normalizedQuery) return results;
	return results
		.map((item, index) => ({ item, index }))
		.sort((left, right) => {
			const leftStartsWith = searchLabel(left.item).toLocaleLowerCase().startsWith(normalizedQuery);
			const rightStartsWith = searchLabel(right.item).toLocaleLowerCase().startsWith(normalizedQuery);
			if (leftStartsWith !== rightStartsWith) return leftStartsWith ? -1 : 1;
			return left.index - right.index;
		})
		.map(({ item }) => item);
}

export function useCategorySearch(query: string) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const canSearch = normalizedQuery.length >= 2;
	const queryResult = useQuery({
		queryKey: ["search", "items"],
		queryFn: searchItems,
		enabled: canSearch,
		staleTime: Infinity,
		gcTime: 30 * 60 * 1000,
	});
	const filteredResults = filterSearchResults(queryResult.data ?? [], normalizedQuery);

	return {
		results: rankSearchResults(filteredResults, normalizedQuery),
		canSearch,
		status: queryResult.isPending ? "loading" as const : queryResult.isError ? "failed" as const : "succeeded" as const,
		error: queryResult.error instanceof Error ? queryResult.error.message : null,
		retry: () => void queryResult.refetch(),
	};
}
