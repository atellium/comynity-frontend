"use client";

import {
	type ButtonHTMLAttributes,
	type ReactNode,
	useCallback,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import { SiteLoader } from "@/components/loaders";
import { useAuth } from "../use-auth";
import { AuthModal } from "./auth-modal";

export type AuthButtonProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"children"
> & {
	children: ReactNode;
	redirectTo?: string;
	onAuthSuccess?: () => void | Promise<void>;
	showLoader?: boolean;
};

export function AuthButton({
	children,
	redirectTo,
	onAuthSuccess,
	showLoader = true,
	onClick,
	type = "button",
	...buttonProps
}: AuthButtonProps) {
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);

	const runAuthenticatedAction = useCallback(async () => {
		setIsCompleting(true);
		try {
			if (onAuthSuccess) {
				await onAuthSuccess();
			}
			if (redirectTo) {
				router.push(redirectTo);
			}
		} finally {
			setIsCompleting(false);
		}
	}, [onAuthSuccess, redirectTo, router]);

	const completeAuthentication = useCallback(async () => {
		setIsCompleting(true);
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
		});
		await runAuthenticatedAction();
		if (!redirectTo) setIsOpen(false);
	}, [redirectTo, runAuthenticatedAction]);

	return (
		<>
			{isCompleting && showLoader && <SiteLoader label="Signing you in" />}
			<button
				{...buttonProps}
				type={type}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented) return;

					if (isAuthenticated) {
						void runAuthenticatedAction();
						return;
					}

					setIsOpen(true);
				}}
			>
				{children}
			</button>

			<AuthModal
				open={isOpen}
				onClose={() => setIsOpen(false)}
				onComplete={completeAuthentication}
			/>
		</>
	);
}

export default AuthButton;
