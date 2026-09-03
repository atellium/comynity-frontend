"use client";

import { useSyncExternalStore } from "react";
import { hasAuthTokens, subscribeToAuthTokens } from "@/lib/auth-tokens";
import { useAppSelector } from "@/store/hooks";

const getServerTokenSnapshot = () => false;

export function useAuth() {
	const reduxAuthenticated = useAppSelector(
		(state) => state.auth.isAuthenticated,
	);
	const tokensAvailable = useSyncExternalStore(
		subscribeToAuthTokens,
		hasAuthTokens,
		getServerTokenSnapshot,
	);
	return {
		isAuthenticated: reduxAuthenticated && tokensAvailable,
	};
}
