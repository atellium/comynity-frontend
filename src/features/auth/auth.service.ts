import { protectedApiClient, publicApiClient } from "@/lib/api";
import type {
	SendOtpApiResponse,
	SendOtpPayload,
	UpdateProfilePayload,
	UpdateProfileResponse,
	VerifyOtpPayload,
	VerifyOtpResponse,
	GetCurrentUserResponse,
} from "./auth.types";

export async function sendOtp(payload: SendOtpPayload) {
	const { data } = await publicApiClient.post<SendOtpApiResponse>(
		"/api/auth/otp/send/",
		payload,
	);
	return data;
}

export async function verifyOtp({ requestId, otp }: VerifyOtpPayload) {
	const { data } = await publicApiClient.post<VerifyOtpResponse>(
		"/api/auth/otp/verify/",
		{ req_id: requestId, otp },
	);
	return data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
	const { data } = await protectedApiClient.patch<UpdateProfileResponse>(
		"/api/auth/users/me/",
		payload,
	);
	return data;
}

export async function getCurrentUser() {
	const { data } = await protectedApiClient.get<GetCurrentUserResponse>(
		"/api/auth/users/me/",
	);
	return data;
}
