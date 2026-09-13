import { z } from "zod";

export const authPhoneSchema = z.object({
	phone: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Enter a valid 10 digit phone number."),
});

export const authOtpSchema = z.object({
	otp: z
		.string()
		.trim()
		.regex(/^\d{4}$/, "Enter the 4-digit OTP."),
});

export const authProfileSchema = z.object({
	fullName: z.string().trim().min(2, "Enter your full name."),
	email: z.string().trim().pipe(
		z.union([
			z.literal(""),
			z.string().email("Enter a valid email address."),
		]),
	),
});

export type AuthPhoneFormValues = z.infer<typeof authPhoneSchema>;
export type AuthOtpFormValues = z.infer<typeof authOtpSchema>;
export type AuthProfileFormValues = z.infer<typeof authProfileSchema>;
