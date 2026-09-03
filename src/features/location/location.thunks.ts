import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
	DEFAULT_LOCATION,
	LOCATION_CHANGE_THRESHOLD_METERS,
	LOCATION_INITIALIZATION_TIMEOUT_MS,
} from "./location.constants";
import { getNearestLocation, searchLocation } from "./location.service";
import type {
	LocationSearchResult,
	LocationState,
	NearestLocationResponse,
	SelectedLocation,
} from "./location.types";
import { getBrowserCoordinates, getDistanceInMeters } from "./location.utils";

function getErrorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		return (
			error.response?.data?.detail
			?? error.response?.data?.message
			?? error.message
		);
	}

	return error instanceof Error ? error.message : "Something went wrong.";
}

function getSavedLocationOrDefault(location: LocationState): SelectedLocation {
	if (
		location.locality !== null
		&& location.city !== null
		&& location.lat !== null
		&& location.lng !== null
	) {
		return {
			locality: location.locality,
			city: location.city,
			lat: location.lat,
			lng: location.lng,
		};
	}

	return DEFAULT_LOCATION;
}

function selectNearestLocation(
	location: NearestLocationResponse,
): SelectedLocation {
	return {
		locality: location.name,
		city: location.city,
		lat: location.latitude,
		lng: location.longitude,
	};
}

export const detectCurrentLocation = createAsyncThunk<
	SelectedLocation,
	void,
	{ rejectValue: string }
>("location/detectCurrent", async (_, { rejectWithValue }) => {
	try {
		const coordinates = await getBrowserCoordinates();
		const nearestLocation = await getNearestLocation(coordinates);

		return selectNearestLocation(nearestLocation);
	} catch (error) {
		return rejectWithValue(getErrorMessage(error));
	}
});

export const initializeSessionLocation = createAsyncThunk<
	SelectedLocation,
	void,
	{ state: { location: LocationState } }
>("location/initializeSession", async (_, { getState }) => {
	const initialLocation = getState().location;
	const initialSelectionRevision = initialLocation.selectionRevision;
	const fallbackLocation = getSavedLocationOrDefault(initialLocation);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	try {
		const detectedLocation = (async () => {
			const detectedCoordinates = await getBrowserCoordinates(
				LOCATION_INITIALIZATION_TIMEOUT_MS,
			);

			if (fallbackLocation !== DEFAULT_LOCATION) {
				const distance = getDistanceInMeters(
					{ lat: fallbackLocation.lat, lng: fallbackLocation.lng },
					detectedCoordinates,
				);

				if (distance <= LOCATION_CHANGE_THRESHOLD_METERS) {
					return {
						...detectedCoordinates,
						locality: fallbackLocation.locality,
						city: fallbackLocation.city,
					};
				}
			}

			const nearestLocation = await getNearestLocation(detectedCoordinates);
			return selectNearestLocation(nearestLocation);
		})();
		const timeoutFallback = new Promise<SelectedLocation>((resolve) => {
			timeoutId = setTimeout(
				() => resolve(fallbackLocation),
				LOCATION_INITIALIZATION_TIMEOUT_MS,
			);
		});
		const resolvedLocation = await Promise.race([
			detectedLocation,
			timeoutFallback,
		]);
		const currentLocation = getState().location;

		if (currentLocation.selectionRevision !== initialSelectionRevision) {
			return getSavedLocationOrDefault(currentLocation);
		}

		return resolvedLocation;
	} catch {
		return fallbackLocation;
	} finally {
		if (timeoutId !== undefined) clearTimeout(timeoutId);
	}
});

export const searchLocations = createAsyncThunk<
	LocationSearchResult[],
	string,
	{ rejectValue: string }
>("location/search", async (query, { rejectWithValue }) => {
	try {
		return await searchLocation(query);
	} catch (error) {
		return rejectWithValue(getErrorMessage(error));
	}
});
