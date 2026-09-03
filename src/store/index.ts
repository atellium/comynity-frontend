import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	persistReducer,
	persistStore,
} from "redux-persist";
import { createPersistConfig } from "./storage";
import locationReducer from "@/features/location/location.slice";
import type { LocationState } from "@/features/location/location.types";
import authReducer from "@/features/auth/auth.slice";
import type { AuthState } from "@/features/auth/auth.types";
import categoriesReducer from "@/features/categories/category.slice";
import type { CategoriesState } from "@/features/categories/category.types";
import searchReducer from "@/features/search/search.slice";
import type { SearchState } from "@/features/search/search.types";


// Only selected location fields are stored inside one localStorage entry.
const locationPersistConfig = createPersistConfig<LocationState>(
	"comynity:location",
	["locality", "city", "lat", "lng"],
);

const authPersistConfig = createPersistConfig<AuthState>(
	"comynity:auth",
	["isAuthenticated", "user", "requiresProfile"],
);

const categoriesPersistConfig = createPersistConfig<CategoriesState>(
	"comynity:categories",
	["items"],
);

const searchPersistConfig = createPersistConfig<SearchState>(
	"comynity:search",
	["recentCategories"],
);

const rootReducer = combineReducers({
	auth: persistReducer(authPersistConfig, authReducer),
	location: persistReducer(locationPersistConfig, locationReducer),
	categories: persistReducer(categoriesPersistConfig, categoriesReducer),
	search: persistReducer(searchPersistConfig, searchReducer),
});

export const makeStore = () => {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
			}),
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const startPersistence = (store: AppStore) => persistStore(store);
