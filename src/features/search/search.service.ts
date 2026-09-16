import { publicApiClient } from "@/lib/api";
import type { SearchItem } from "./search.types";

export async function searchItems() {
	const { data } = await publicApiClient.get<SearchItem[]>("/api/search/", {
	});
	return data.filter((item) => item.type === "business" || item.type === "doctor" || item.type === "product");
}
