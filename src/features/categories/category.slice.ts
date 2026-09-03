import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCategories } from "./category.service";
import type { CategoriesState } from "./category.types";

const initialState: CategoriesState = {
	items: [],
	status: "idle",
	error: null,
};

export const fetchCategories = createAsyncThunk<
	Awaited<ReturnType<typeof getCategories>>,
	void,
	{ rejectValue: string; state: { categories: CategoriesState } }
>(
	"categories/fetch",
	async (_, { rejectWithValue }) => {
		try {
			return await getCategories();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.detail
					?? error.response?.data?.message
					?? error.message,
				);
			}

			return rejectWithValue(
				error instanceof Error ? error.message : "Unable to load categories.",
			);
		}
	},
	{
		condition: (_, { getState }) => getState().categories.status !== "loading",
	},
);

const categorySlice = createSlice({
	name: "categories",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCategories.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "succeeded";
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unable to load categories.";
			});
	},
});

export default categorySlice.reducer;
