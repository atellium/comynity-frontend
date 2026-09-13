import axios, {
	AxiosError,
	type InternalAxiosRequestConfig,
} from "axios";
import {
	clearAuthTokens,
	getAuthTokens,
	setAuthTokens,
} from "@/lib/auth-tokens";

const apiConfig = {
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || undefined,
	headers: { "Content-Type": "application/json" },
};

/** Use for endpoints that do not require an access token. */
export const publicApiClient = axios.create(apiConfig);

/** Use for endpoints that require authentication. */
export const protectedApiClient = axios.create(apiConfig);

type RetryableRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

type RefreshTokenResponse = {
	access_token: string;
	refresh_token: string;
};

let refreshRequest: Promise<RefreshTokenResponse> | null = null;

function refreshAccessToken(refreshToken: string) {
	if (!refreshRequest) {
		refreshRequest = publicApiClient
			.post<RefreshTokenResponse>("/api/auth/token/refresh/", {
				refresh_token: refreshToken,
			})
			.then(({ data }) => {
				setAuthTokens({
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
				});
				return data;
			})
			.finally(() => {
				refreshRequest = null;
			});
	}

	return refreshRequest;
}

protectedApiClient.interceptors.request.use((config) => {
	const accessToken = getAuthTokens()?.accessToken;
	if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
	if (typeof FormData !== "undefined" && config.data instanceof FormData) {
		// Let the browser add multipart/form-data with its generated boundary.
		config.headers.delete("Content-Type");
	}
	return config;
});

protectedApiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const request = error.config as RetryableRequestConfig | undefined;

		if (error.response?.status !== 401 || !request || request._retry) {
			return Promise.reject(error);
		}

		const refreshToken = getAuthTokens()?.refreshToken;
		if (!refreshToken) {
			clearAuthTokens();
			return Promise.reject(error);
		}

		request._retry = true;

		try {
			const tokens = await refreshAccessToken(refreshToken);
			request.headers.set("Authorization", `Bearer ${tokens.access_token}`);
			return protectedApiClient(request);
		} catch (refreshError) {
			clearAuthTokens();
			return Promise.reject(refreshError);
		}
	},
);
