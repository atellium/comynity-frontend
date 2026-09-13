import { createSlice } from "@reduxjs/toolkit";
import {
	confirmOtp,
	fetchCurrentUser,
	requestOtp,
	saveProfile,
} from "./auth.thunks";
import type { AuthState } from "./auth.types";

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	requestId: null,
	testOtp: null,
	requiresProfile: false,
	sendOtpStatus: "idle",
	verifyOtpStatus: "idle",
	profileStatus: "idle",
	userStatus: "idle",
	error: null,
	completionRevision: 0,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		clearAuthError(state) {
			state.error = null;
		},
		resetAuthentication: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCurrentUser.pending, (state) => {
				state.userStatus = "loading";
				state.error = null;
			})
			.addCase(fetchCurrentUser.fulfilled, (state, action) => {
				state.userStatus = "succeeded";
				state.isAuthenticated = true;
				state.user = action.payload.user;
				state.requiresProfile = !action.payload.user.full_name;
			})
			.addCase(fetchCurrentUser.rejected, (state, action) => {
				state.userStatus = "failed";
				state.error = action.payload ?? "Something went wrong.";
			})
			.addCase(requestOtp.pending, (state) => {
				state.sendOtpStatus = "loading";
				state.error = null;
				state.testOtp = null;
			})
			.addCase(requestOtp.fulfilled, (state, action) => {
				state.sendOtpStatus = "succeeded";
				state.requestId = action.payload.requestId;
				state.testOtp = action.payload.otp;
			})
			.addCase(requestOtp.rejected, (state, action) => {
				state.sendOtpStatus = "failed";
				state.error = action.payload ?? "Unable to send OTP.";
			})
			.addCase(confirmOtp.pending, (state) => {
				state.verifyOtpStatus = "loading";
				state.error = null;
			})
			.addCase(confirmOtp.fulfilled, (state, action) => {
				state.verifyOtpStatus = "succeeded";
				state.isAuthenticated = true;
				state.user = action.payload.user;
				state.requiresProfile = !action.payload.user.full_name;

				if (!state.requiresProfile) state.completionRevision += 1;
			})
			.addCase(confirmOtp.rejected, (state, action) => {
				state.verifyOtpStatus = "failed";
				state.error = action.payload ?? "Unable to verify OTP.";
			})
			.addCase(saveProfile.pending, (state) => {
				state.profileStatus = "loading";
				state.error = null;
			})
			.addCase(saveProfile.fulfilled, (state, action) => {
				state.profileStatus = "succeeded";
				state.user = action.payload.user;
				state.requiresProfile = false;
				state.completionRevision += 1;
			})
			.addCase(saveProfile.rejected, (state, action) => {
				state.profileStatus = "failed";
				state.error = action.payload ?? "Unable to update your profile.";
			});
	},
});

export const { clearAuthError, resetAuthentication } = authSlice.actions;
export default authSlice.reducer;
