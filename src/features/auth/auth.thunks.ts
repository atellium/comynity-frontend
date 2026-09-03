import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setAuthTokens } from "@/lib/auth-tokens";
import * as authService from "./auth.service";
import type {
	SendOtpPayload,
	SendOtpResult,
	UpdateProfilePayload,
	UpdateProfileResponse,
	VerifyOtpPayload,
	VerifyOtpResponse,
	GetCurrentUserResponse,
} from "./auth.types";

function getAuthErrorMessage(error: unknown) {
	if (axios.isAxiosError(error) && error.response?.data !== undefined) {
		const response = error.response.data as unknown;

		if (typeof response === "string") return response;

		if (response && typeof response === "object") {
			const data = response as Record<string, unknown>;
			if (typeof data.detail === "string") return data.detail;
			if (typeof data.message === "string") return data.message;

			try {
				return JSON.stringify(response);
			} catch {
				return "Something went wrong.";
			}
		}
	}

	return "Something went wrong.";
}

export const requestOtp = createAsyncThunk<
	SendOtpResult,
	SendOtpPayload,
	{ rejectValue: string }
>("auth/sendOtp", async (payload, { rejectWithValue }) => {
	try {
		const response = await authService.sendOtp(payload);
		const requestId = response.reqId ?? response.req_id;

		if (!requestId) return rejectWithValue("The OTP request ID is missing.");

		return {
			requestId,
			otp: response.otp ?? null,
			expiresIn: response.expiresIn ?? null,
		};
	} catch (error) {
		return rejectWithValue(getAuthErrorMessage(error));
	}
});

export const confirmOtp = createAsyncThunk<
	VerifyOtpResponse,
	VerifyOtpPayload,
	{ rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
	try {
		const response = await authService.verifyOtp(payload);
		setAuthTokens({
			accessToken: response.access_token,
			refreshToken: response.refresh_token,
		});
		return response;
	} catch (error) {
		return rejectWithValue(getAuthErrorMessage(error));
	}
});

export const fetchCurrentUser = createAsyncThunk<
	GetCurrentUserResponse,
	void,
	{ rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
	try {
		return await authService.getCurrentUser();
	} catch (error) {
		return rejectWithValue(getAuthErrorMessage(error));
	}
});

export const saveProfile = createAsyncThunk<
	UpdateProfileResponse,
	UpdateProfilePayload,
	{ rejectValue: string }
>("auth/updateProfile", async (payload, { rejectWithValue }) => {
	try {
		return await authService.updateProfile(payload);
	} catch (error) {
		return rejectWithValue(getAuthErrorMessage(error));
	}
});
