import type { SelectedLocation } from "./location.types";

export const LOCATION_SESSION_KEY = "comynity:location:auto-detected";
export const LOCATION_CHANGE_THRESHOLD_METERS = 200;
export const LOCATION_INITIALIZATION_TIMEOUT_MS = 30_000;

export const DEFAULT_LOCATION: SelectedLocation = {
	locality: "Garia",
	city: "Kolkata",
	lat: 22.46401,
	lng: 88.379443,
};
