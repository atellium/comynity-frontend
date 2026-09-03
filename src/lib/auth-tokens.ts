const ACCESS_TOKEN_COOKIE = "comynity_access_token";
const REFRESH_TOKEN_COOKIE = "comynity_refresh_token";
const tokenListeners = new Set<() => void>();

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

function getCookie(name: string) {
	if (typeof document === "undefined") return null;

	const prefix = `${encodeURIComponent(name)}=`;
	const cookie = document.cookie
		.split("; ")
		.find((item) => item.startsWith(prefix));

	return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function notifyTokenListeners() {
	tokenListeners.forEach((listener) => listener());
}

export function setAuthTokens({ accessToken, refreshToken }: AuthTokens) {
	if (typeof document === "undefined") return;

	setCookie(ACCESS_TOKEN_COOKIE, accessToken, 60 * 60 * 24);
	setCookie(REFRESH_TOKEN_COOKIE, refreshToken, 60 * 60 * 24 * 30);
	notifyTokenListeners();
}

export function getAuthTokens(): AuthTokens | null {
	const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
	const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

	return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function hasAuthTokens() {
	return getAuthTokens() !== null;
}

export function clearAuthTokens() {
	if (typeof document === "undefined") return;

	setCookie(ACCESS_TOKEN_COOKIE, "", 0);
	setCookie(REFRESH_TOKEN_COOKIE, "", 0);
	notifyTokenListeners();
}

export function subscribeToAuthTokens(listener: () => void) {
	tokenListeners.add(listener);
	return () => tokenListeners.delete(listener);
}
