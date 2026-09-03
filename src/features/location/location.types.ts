export type Coordinates = {
	lat: number;
	lng: number;
};

export type NearestLocationResponse = {
	id: number;
	name: string;
	slug: string;
	city: string;
	latitude: number;
	longitude: number;
	state: string;
	distance_km: number;
};

export type LocationSearchResult = {
	id: number;
	name: string;
	slug: string;
	city: string;
	latitude: number;
	longitude: number;
};

export type SelectedLocation = Coordinates & {
	locality: string;
	city: string;
};

export type LocationRequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type LocationState = {
	locality: string | null;
	city: string | null;
	lat: number | null;
	lng: number | null;
	searchResults: LocationSearchResult[];
	activeSearchQuery: string | null;
	searchStatus: LocationRequestStatus;
	currentLocationStatus: LocationRequestStatus;
	autoDetectionStatus: LocationRequestStatus;
	error: string | null;
	selectionRevision: number;
};
