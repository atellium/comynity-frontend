"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	authOtpSchema,
	authPhoneSchema,
	authProfileSchema,
	type AuthOtpFormValues,
	type AuthPhoneFormValues,
	type AuthProfileFormValues,
} from "../auth.schemas";
import { confirmOtp, requestOtp, saveProfile } from "../auth.thunks";
import { resetAuthentication } from "../auth.slice";
import { FullScreenModal } from "@/components/modals"; // Adjust path as needed
import { SiteLoader } from "@/components/loaders";
import { clearAuthTokens } from "@/lib/auth-tokens";

// Premium Input Styling
const inputClassName =
	"h-14 w-full rounded-xl bg-white border border-slate-200 bg-slate-50 px-4 text-[14px] font-bold text-slate-900 outline-none transition-all focus:border-brand focus:bg-white placeholder:font-medium placeholder:text-slate-400";

// Polished Error Message
function FieldError({ message }: { message?: string }) {
	return message ? (
		<span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-red-500">
			<i
				className="fa-solid fa-circle-exclamation text-[10px]"
				aria-hidden="true"
			/>
			{message}
		</span>
	) : null;
}

const OTP_LENGTH = 4;

type OtpInputProps = {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	invalid?: boolean;
};

function OtpInput({
	value,
	onChange,
	disabled = false,
	invalid = false,
}: OtpInputProps) {
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	useEffect(() => {
		inputRefs.current[0]?.focus();
	}, []);

	const focusCell = (index: number) => {
		inputRefs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]?.focus();
	};
	const focusCellAfterUpdate = (index: number) => {
		requestAnimationFrame(() => focusCell(index));
	};

	const setDigitsFrom = (index: number, input: string) => {
		const digits = input.replace(/\D/g, "");
		if (!digits) return;
		const cells = Array.from(
			{ length: OTP_LENGTH },
			(_, cellIndex) => value[cellIndex] ?? "",
		);
		digits
			.slice(0, OTP_LENGTH - index)
			.split("")
			.forEach((digit, offset) => {
				cells[index + offset] = digit;
			});
		onChange(cells.join("").slice(0, OTP_LENGTH));
		focusCellAfterUpdate(Math.min(index + digits.length, OTP_LENGTH - 1));
	};

	return (
		<div
			className="flex w-full justify-center gap-2.5"
			role="group"
			aria-label="Four digit secure code"
		>
			{Array.from({ length: OTP_LENGTH }, (_, index) => (
				<input
					key={index}
					ref={(element) => {
						inputRefs.current[index] = element;
					}}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					maxLength={1}
					autoComplete={index === 0 ? "one-time-code" : "off"}
					enterKeyHint={index === OTP_LENGTH - 1 ? "done" : "next"}
					aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
					aria-invalid={invalid}
					data-otp-input
					disabled={disabled}
					value={value[index] ?? ""}
					onFocus={(event) => {
						if (index > value.length) {
							focusCell(value.length);
							return;
						}
						event.currentTarget.select();
					}}
					onChange={(event) => {
						const input = event.currentTarget.value;
						if (input) setDigitsFrom(index, input);
					}}
					onPaste={(event) => {
						event.preventDefault();
						const digits = event.clipboardData
							.getData("text")
							.replace(/\D/g, "")
							.slice(0, OTP_LENGTH);
						if (!digits) return;
						onChange(digits);
						focusCellAfterUpdate(Math.min(digits.length, OTP_LENGTH - 1));
					}}
					onKeyDown={(event) => {
						if (event.key === "Backspace") {
							event.preventDefault();
							const targetIndex = value[index] ? index : Math.max(0, index - 1);
							const cells = value.split("");
							cells.splice(targetIndex, 1);
							onChange(cells.join(""));
							focusCell(targetIndex);
						} else if (event.key === "ArrowLeft") {
							event.preventDefault();
							focusCell(index - 1);
						} else if (event.key === "ArrowRight") {
							event.preventDefault();
							focusCell(index + 1);
						} else if (event.key === "Home") {
							event.preventDefault();
							focusCell(0);
						} else if (event.key === "End") {
							event.preventDefault();
							focusCell(OTP_LENGTH - 1);
						} else if (event.key.length === 1 && !/\d/.test(event.key)) {
							event.preventDefault();
						}
					}}
					className={`size-12 rounded-xl border bg-slate-50 text-center text-[20px] font-black text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-brand/10 disabled:cursor-wait disabled:opacity-60 ${invalid ? "border-red-400" : "border-slate-200 focus:border-brand"}`}
				/>
			))}
		</div>
	);
}

export type AuthModalProps = {
	open: boolean;
	onClose: () => void;
	onComplete: () => void;
};

export function AuthModal({ open, onClose, onComplete }: AuthModalProps) {
	const dispatch = useAppDispatch();
	const {
		requestId,
		testOtp,
		requiresProfile,
		sendOtpStatus,
		verifyOtpStatus,
		profileStatus,
		error,
	} = useAppSelector((state) => state.auth);

	const phoneForm = useForm<AuthPhoneFormValues>({
		resolver: zodResolver(authPhoneSchema),
		defaultValues: { phone: "" },
	});

	const otpForm = useForm<AuthOtpFormValues>({
		resolver: zodResolver(authOtpSchema),
		defaultValues: { otp: "" },
	});

	const profileForm = useForm<AuthProfileFormValues>({
		resolver: zodResolver(authProfileSchema),
		defaultValues: { fullName: "", email: "" },
	});

	const submittedPhone = phoneForm.getValues("phone");
	const otpValue = useWatch({ control: otpForm.control, name: "otp" });
	const autoSubmittedOtp = useRef("");

	const keepFieldVisible = (target: EventTarget | null) => {
		const field = target;
		if (
			!(
				field instanceof HTMLInputElement ||
				field instanceof HTMLTextAreaElement
			)
		)
			return;
		if (
			field instanceof HTMLInputElement &&
			field.hasAttribute("data-otp-input")
		)
			return;

		const revealField = () => {
			field.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		};

		requestAnimationFrame(revealField);
		window.setTimeout(revealField, 300);
	};

	useEffect(() => {
		if (otpValue.length !== OTP_LENGTH) {
			autoSubmittedOtp.current = "";
			return;
		}
		if (
			!requestId ||
			verifyOtpStatus === "loading" ||
			autoSubmittedOtp.current === otpValue
		)
			return;

		autoSubmittedOtp.current = otpValue;
		void otpForm.trigger("otp").then(async (valid) => {
			if (!valid) return;

			try {
				const response = await dispatch(
					confirmOtp({ requestId, otp: otpValue }),
				).unwrap();
				if (response.user.full_name) onComplete();
			} catch {
				// The thunk stores the API error for the message below.
			}
		});
	}, [dispatch, onComplete, otpForm, otpValue, requestId, verifyOtpStatus]);

	const resetAuthForms = () => {
		phoneForm.reset();
		otpForm.reset();
		profileForm.reset();
		autoSubmittedOtp.current = "";
	};

	const handleClose = () => {
		if (requiresProfile) {
			clearAuthTokens();
			dispatch(resetAuthentication());
			resetAuthForms();
		} else if (requestId) {
			dispatch(resetAuthentication());
			resetAuthForms();
		}

		onClose();
	};

	return (
		<>
			{open && verifyOtpStatus === "succeeded" && !requiresProfile && (
				<SiteLoader label="Signing you in" />
			)}
			{open && profileStatus === "succeeded" && (
				<SiteLoader label="Completing your profile" />
			)}
			<FullScreenModal open={open} onClose={handleClose}>
				<div
					className="flex min-h-full flex-col px-page pt-6 pb-[max(3rem,30dvh)]"
					onFocusCapture={(event) => keepFieldVisible(event.target)}
					onClickCapture={(event) => keepFieldVisible(event.target)}
				>
					{/* --------------------------------------------------------- */}
					{/* 1. PHONE NUMBER STEP                                      */}
					{/* --------------------------------------------------------- */}
					{!requestId && (
						<form
							onSubmit={phoneForm.handleSubmit(({ phone }) => {
								dispatch(requestOtp({ identifier: `+91${phone}` }));
							})}
							className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500"
						>
							{/* Header (Top/Left Aligned) */}
							<div className="flex flex-col text-left">
								<div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-surface-tertiary text-foreground-secondary shadow-xs dark:bg-surface-dark-tertiary dark:text-foreground-dark-secondary">
									<i
										className="fa-solid fa-mobile-screen-button text-[20px]"
										aria-hidden="true"
									/>
								</div>
								<h2 className="text-[24px] font-black tracking-tight text-slate-900">
									Welcome to Comynity
								</h2>
								<p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-500 pr-4">
									Enter your mobile number to sign in or create a new account.
								</p>
							</div>

							{/* Input Field */}
							<div className="flex flex-col">
								<label className="mb-2 pl-1 text-[12px] font-bold uppercase tracking-wider text-slate-500">
									Mobile Number
								</label>
								<div className="group flex h-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-brand focus-within:bg-white">
									<span className="flex items-center justify-center pl-4 pr-3 text-[14px] font-bold text-slate-500">
										🇮🇳 <span className="ml-1.5 text-slate-900">+91</span>
									</span>
									<div className="my-3 w-px bg-slate-200" />
									<input
										{...phoneForm.register("phone")}
										inputMode="numeric"
										autoComplete="tel-national"
										autoFocus
										maxLength={10}
										placeholder="98765 43210"
										className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-extrabold tracking-wide text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
									/>
								</div>
								<FieldError
									message={phoneForm.formState.errors.phone?.message}
								/>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={sendOtpStatus === "loading"}
								className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-brand-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
							>
								{sendOtpStatus === "loading" ? (
									<i
										className="fa-solid fa-circle-notch animate-spin text-[18px]"
										aria-hidden="true"
									/>
								) : (
									"Continue"
								)}
							</button>
						</form>
					)}

					{/* --------------------------------------------------------- */}
					{/* 2. OTP VERIFICATION STEP                                  */}
					{/* --------------------------------------------------------- */}
					{requestId && !requiresProfile && profileStatus !== "succeeded" && (
						<form
							onSubmit={otpForm.handleSubmit(async ({ otp }) => {
								try {
									const response = await dispatch(
										confirmOtp({ requestId, otp }),
									).unwrap();
									if (response.user.full_name) onComplete();
								} catch {
									// The thunk stores the API error for the message below.
								}
							})}
							className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500"
						>
							{/* Header */}
							<div className="flex flex-col text-left">
								<div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-surface-tertiary text-foreground-secondary shadow-xs dark:bg-surface-dark-tertiary dark:text-foreground-dark-secondary">
									<i
										className="fa-solid fa-shield-halved text-[20px]"
										aria-hidden="true"
									/>
								</div>
								<h2 className="text-[24px] font-black tracking-tight text-slate-900">
									Verify your number
								</h2>
								<p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-500 pr-4">
									Enter the 4-digit secure code we sent to <br />
									<strong className="font-bold text-slate-900">
										+91 {submittedPhone}
									</strong>
								</p>
							</div>

							{/* Input Field */}
							<div className="flex flex-col">
								<input type="hidden" {...otpForm.register("otp")} />
								<OtpInput
									value={otpValue}
									disabled={verifyOtpStatus === "loading"}
									invalid={Boolean(otpForm.formState.errors.otp)}
									onChange={(otp) =>
										otpForm.setValue("otp", otp, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: otp.length === OTP_LENGTH,
										})
									}
								/>
								<FieldError message={otpForm.formState.errors.otp?.message} />
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={verifyOtpStatus === "loading"}
								className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-brand-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
							>
								{verifyOtpStatus === "loading" ? (
									<i
										className="fa-solid fa-circle-notch animate-spin text-[18px]"
										aria-hidden="true"
									/>
								) : (
									"Verify & Proceed"
								)}
							</button>

							{testOtp && (
								<div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
									<i
										className="fa-solid fa-flask text-[14px] text-amber-500"
										aria-hidden="true"
									/>
									<span>
										Testing OTP:{" "}
										<strong className="font-extrabold tracking-wider">
											{testOtp}
										</strong>
									</span>
								</div>
							)}
						</form>
					)}

					{/* --------------------------------------------------------- */}
					{/* 3. PROFILE CREATION STEP                                  */}
					{/* --------------------------------------------------------- */}
					{requiresProfile && (
						<form
							onSubmit={profileForm.handleSubmit(
								async ({ fullName, email }) => {
									try {
										await dispatch(
											saveProfile({
												full_name: fullName,
												...(email ? { email } : {}),
											}),
										).unwrap();
										onComplete();
									} catch {
										// The thunk stores the API error for the message below.
									}
								},
							)}
							className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500"
						>
							{/* Header */}
							<div className="flex flex-col text-left">
								<div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-surface-tertiary text-foreground-secondary shadow-xs dark:bg-surface-dark-tertiary dark:text-foreground-dark-secondary">
									<i
										className="fa-regular fa-id-badge text-[20px]"
										aria-hidden="true"
									/>
								</div>
								<h2 className="text-[24px] font-black tracking-tight text-slate-900">
									Almost there!
								</h2>
								<p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-500 pr-4">
									Tell us a little bit about yourself to complete your account
									setup.
								</p>
							</div>

							<div className="flex flex-col gap-4">
								{/* Name Input */}
								<div className="flex flex-col">
									<label className="mb-2 pl-1 text-[12px] font-bold uppercase tracking-wider text-slate-500">
										Full Name
									</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
											<i className="fa-regular fa-user" aria-hidden="true" />
										</div>
										<input
											{...profileForm.register("fullName")}
											autoComplete="name"
											placeholder="e.g. John Doe"
											className={`${inputClassName} pl-11`}
										/>
									</div>
									<FieldError
										message={profileForm.formState.errors.fullName?.message}
									/>
								</div>

								{/* Email Input */}
								<div className="flex flex-col">
									<label className="mb-2 pl-1 text-[12px] font-bold uppercase tracking-wider text-slate-500">
										Email Address{" "}
										<span className="ml-1 text-[10px] font-medium normal-case tracking-normal text-slate-400">
											(Optional)
										</span>
									</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
											<i
												className="fa-regular fa-envelope"
												aria-hidden="true"
											/>
										</div>
										<input
											{...profileForm.register("email")}
											type="email"
											autoComplete="email"
											placeholder="john@example.com"
											className={`${inputClassName} pl-11`}
										/>
									</div>
									<FieldError
										message={profileForm.formState.errors.email?.message}
									/>
								</div>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={profileStatus === "loading"}
								className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-bold text-white shadow-md shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
							>
								{profileStatus === "loading" ? (
									<i
										className="fa-solid fa-circle-notch animate-spin text-[18px]"
										aria-hidden="true"
									/>
								) : (
									"Continue"
								)}
							</button>
						</form>
					)}

					{/* --------------------------------------------------------- */}
					{/* 4. GLOBAL ERROR STATE                                     */}
					{/* --------------------------------------------------------- */}
					{error && (
						<div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 shadow-xs animate-in fade-in slide-in-from-bottom-2">
							<i
								className="fa-solid fa-circle-exclamation mt-0.5 text-[16px] text-red-500"
								aria-hidden="true"
							/>
							<p
								role="alert"
								className="flex-1 wrap-break-word text-[13px] font-bold leading-snug text-red-700"
							>
								{error}
							</p>
						</div>
					)}
				</div>
			</FullScreenModal>
		</>
	);
}

export default AuthModal;
