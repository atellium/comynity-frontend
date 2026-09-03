"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface MobileHeaderProps {
	/** The text to display in the header. */
	title: string;
	/** Optional supporting text displayed below the title. */
	subtitle?: string;
	/** Where the title should be positioned. Defaults to the iOS-style center. */
	alignTitle?: "center" | "left";
	/** Custom JSX elements to render on the right side of the header. */
	rightActions?: ReactNode;
	/** Optional custom back-button logic. Defaults to router.back(). */
	onBack?: () => void;
	/** Background color utility class. */
	backgroundColor?: string;
	/** Optional container classes. */
	className?: string;
}

export function MobileHeader({
	title,
	subtitle,
	alignTitle = "left",
	rightActions,
	onBack,
	backgroundColor = "bg-surface dark:bg-surface-dark",
	className = "",
}: MobileHeaderProps) {
	const router = useRouter();
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 0);

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleBack = () => {
		if (onBack) onBack();
		else router.back();
	};

	return (
		<header
			className={`sticky top-0 z-50 px-4 py-1 transition-shadow ${backgroundColor} ${isScrolled ? "shadow-sm" : "shadow-none"} ${className}`}
		>
			<div className="relative mx-auto flex min-h-10 max-w-5xl items-center justify-between gap-2">
				<div className="flex min-w-0 flex-1 items-center">
					<button
						type="button"
						onClick={handleBack}
						aria-label="Go back"
						className="relative z-10 -ml-3 flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors active:scale-95 active:bg-surface-secondary dark:text-foreground-dark dark:active:bg-surface-dark-secondary"
					>
						<ArrowLeft size={24} strokeWidth={1.75} className="mt-0.5" />
					</button>

					{alignTitle === "left" && (
						<div className="min-w-0">
							<h1 className="truncate text-xl font-extrabold tracking-tight text-foreground dark:text-foreground-dark">{title}</h1>
							{subtitle && <p className="mt-0.5 truncate text-[11px] font-medium text-foreground-muted dark:text-foreground-dark-muted">{subtitle}</p>}
						</div>
					)}
				</div>

				{alignTitle === "center" && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16">
					<h1 className="truncate text-xl font-extrabold tracking-tight text-foreground dark:text-foreground-dark">
							{title}
						</h1>
					</div>
				)}

				<div className="relative z-10 -mr-2 flex shrink-0 items-center justify-end gap-1">
					{rightActions}
				</div>
			</div>
		</header>
	);
}

export default MobileHeader;
