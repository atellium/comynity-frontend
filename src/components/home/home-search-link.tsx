import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { RotatingSearchPlaceholder } from "./rotating-search-placeholder";

export function HomeSearchLink() {
	return (
		<div className="mx-auto w-full max-w-3xl px-2.5 ">
			<Link
				href="/search"
				className="flex h-16 items-center gap-3 rounded-full border border-border-subtle bg-gray-200 pl-4 pr-2 text-foreground-secondary transition-all hover:border-border-strong hover:shadow-lg dark:border-border-dark-subtle dark:bg-surface-dark dark:text-foreground-dark-secondary dark:hover:border-border-dark-strong"
			>
				<Search
					size={24}
					className="shrink-0 text-foreground-muted dark:text-foreground-dark-muted"
					aria-hidden="true"
				/>
				<RotatingSearchPlaceholder className="min-w-0 flex-1 text-[15px] font-medium" />
				<span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
					<ArrowRight size={18} aria-hidden="true" />
				</span>
			</Link>
		</div>
	);
}
