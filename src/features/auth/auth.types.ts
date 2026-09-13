export type AuthRequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type AuthUser = {
	id: string;
	email: string | null;
	phone: string;
	full_name: string | null;
	gender: string | null;
	date_of_birth: string | null;
};

export type SendOtpPayload = {
	identifier: string;
};

export type SendOtpApiResponse = {
	type: "success";
	message?: string;
	reqId?: string;
	req_id?: string;
	otp?: string;
	expiresIn?: number;
};

export type SendOtpResult = {
	requestId: string;
	otp: string | null;
	expiresIn: number | null;
};

export type VerifyOtpPayload = {
	requestId: string;
	otp: string;
};

export type VerifyOtpResponse = {
	type: "success";
	message: string;
	user: AuthUser;
	access_token: string;
	refresh_token: string;
};

export type UpdateProfilePayload = {
	full_name: string;
	email?: string;
};

export type UpdateProfileResponse = {
	message: string;
	user: AuthUser;
};

export type GetCurrentUserResponse = {
	user: AuthUser;
};

export type AuthState = {
	isAuthenticated: boolean;
	user: AuthUser | null;
	requestId: string | null;
	testOtp: string | null;
	requiresProfile: boolean;
	sendOtpStatus: AuthRequestStatus;
	verifyOtpStatus: AuthRequestStatus;
	profileStatus: AuthRequestStatus;
	userStatus: AuthRequestStatus;
	error: string | null;
	completionRevision: number;
};
