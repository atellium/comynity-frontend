import axios from "axios";
import type {
	Coordinates,
	LocationSearchResult,
	NearestLocationResponse,
} from "./location.types";

const locationApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || undefined,
	headers: {
		"Content-Type": "application/json",
	},
});

export async function getNearestLocation({ lat, lng }: Coordinates) {
	const { data } = await locationApi.post<NearestLocationResponse>(
		"/api/locations/nearest/",
		{
			lat: String(lat),
			lng: String(lng),
		},
	);

	return data;
}

export async function searchLocation(query: string) {
	const { data } = await locationApi.get<LocationSearchResult[]>(
		"/api/locations/search/",
		{
			params: { query },
		},
	);

	return data;
}
