import type { PersistConfig } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
	getItem: async () => null,
	setItem: async () => undefined,
	removeItem: async () => undefined,
});

const storage =
	typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export const createPersistConfig = <State>(
	key: string,
	whitelist: Array<keyof State>,
): PersistConfig<State> => ({
	key,
	keyPrefix: "",
	version: 1,
	storage,
	whitelist: whitelist as string[],
});
