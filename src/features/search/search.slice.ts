import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SearchItem, SearchState } from "./search.types";

const MAX_RECENT_SEARCHES = 5;

const initialState: SearchState = {
	recentCategories: [],
};

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		addRecentCategory(state, action: PayloadAction<SearchItem>) {
			state.recentCategories = [
				action.payload,
				...state.recentCategories.filter(
					(category) => `${category.type}:${category.slug}` !== `${action.payload.type}:${action.payload.slug}`,
				),
			].slice(0, MAX_RECENT_SEARCHES);
		},
		clearRecentCategories(state) {
			state.recentCategories = [];
		},
	},
});

export const { addRecentCategory, clearRecentCategories } = searchSlice.actions;
export default searchSlice.reducer;
