import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	detectCurrentLocation,
	initializeSessionLocation,
	searchLocations,
} from "./location.thunks";
import type {
	LocationSearchResult,
	LocationState,
	SelectedLocation,
} from "./location.types";

const initialState: LocationState = {
	locality: null,
	city: null,
	lat: null,
	lng: null,
	searchResults: [],
	activeSearchQuery: null,
	searchStatus: "idle",
	currentLocationStatus: "idle",
	autoDetectionStatus: "idle",
	error: null,
	selectionRevision: 0,
};

function saveLocation(state: LocationState, location: SelectedLocation) {
	state.locality = location.locality;
	state.city = location.city;
	state.lat = location.lat;
	state.lng = location.lng;
	state.error = null;
	state.selectionRevision += 1;
}

const locationSlice = createSlice({
	name: "location",
	initialState,
	reducers: {
		selectSearchResult(state, action: PayloadAction<LocationSearchResult>) {
			const result = action.payload;
			saveLocation(state, {
				locality: result.name,
				city: result.city,
				lat: result.latitude,
				lng: result.longitude,
			});
		},
		clearSearchResults(state) {
			state.searchResults = [];
			state.activeSearchQuery = null;
			state.searchStatus = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(initializeSessionLocation.pending, (state) => {
				state.autoDetectionStatus = "loading";
			})
			.addCase(initializeSessionLocation.fulfilled, (state, action) => {
				state.autoDetectionStatus = "succeeded";
				saveLocation(state, action.payload);
			})
			.addCase(detectCurrentLocation.pending, (state) => {
				state.currentLocationStatus = "loading";
				state.error = null;
			})
			.addCase(detectCurrentLocation.fulfilled, (state, action) => {
				state.currentLocationStatus = "succeeded";
				saveLocation(state, action.payload);
			})
			.addCase(detectCurrentLocation.rejected, (state, action) => {
				state.currentLocationStatus = "failed";
				state.error = action.payload ?? "Unable to get your location.";
			})
			.addCase(searchLocations.pending, (state, action) => {
				state.activeSearchQuery = action.meta.arg;
				state.searchResults = [];
				state.searchStatus = "loading";
				state.error = null;
			})
			.addCase(searchLocations.fulfilled, (state, action) => {
				if (state.activeSearchQuery !== action.meta.arg) return;

				state.searchStatus = "succeeded";
				state.searchResults = action.payload;
			})
			.addCase(searchLocations.rejected, (state, action) => {
				if (state.activeSearchQuery !== action.meta.arg) return;

				state.searchStatus = "failed";
				state.searchResults = [];
				state.error = action.payload ?? "Unable to search locations.";
			});
	},
});

export const { clearSearchResults, selectSearchResult } = locationSlice.actions;
export default locationSlice.reducer;
