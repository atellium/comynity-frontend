"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { LocationButton } from "@/features/location";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppSelector } from "@/store/hooks";
import { AuthButton } from "@/features/auth";

export function MobileHomeHeader() {
	const { locality, city } = useAppSelector((state) => state.location);
	const hydrated = useHydrated();
	const locationLabel = hydrated && locality && city
		? `${locality}, ${city}`
		: "Choose location";

	return (
		<header className="w-full bg-surface pt-safe-top  dark:bg-surface-dark">
			<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-page pt-1 pb-3">
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<h2 className="select-none text-2xl font-extrabold tracking-tight text-brand">
						Comynity
					</h2>

					<LocationButton
						aria-label="Change location"
						className="group flex min-w-0 items-center gap-1 text-left transition-colors"
					>
						<MapPin
							size={14}
							strokeWidth={2.5}
							className="shrink-0 text-brand"
						/>
						<span className="truncate text-sm font-semibold text-foreground-secondary dark:text-foreground-dark-secondary">
							{locationLabel}
						</span>
						<ChevronDown
							size={14}
							strokeWidth={2.5}
							className="shrink-0 text-foreground-muted transition-colors group-hover:text-foreground-secondary dark:text-foreground-dark-muted dark:group-hover:text-foreground-dark-secondary"
						/>
					</LocationButton>
				</div>

				<AuthButton
					aria-label="Open profile"
					redirectTo="/profile"
					className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-foreground-secondary shadow-xs transition-colors hover:bg-surface-tertiary dark:bg-surface-dark-secondary dark:text-foreground-dark-secondary dark:hover:bg-surface-dark-tertiary"
				>
					<i className="fa-solid fa-user text-lg text-foreground dark:text-foreground-dark" />
				</AuthButton>
			</div>
		</header>
	);
}

export default MobileHomeHeader;
