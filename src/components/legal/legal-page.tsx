import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
	title: string;
	content: ReactNode;
};

export function LegalPage({
	title,
	intro,
	sections,
}: {
	title: string;
	intro: string;
	sections: LegalSection[];
}) {
	return (
		<main className="min-h-[calc(100dvh-5rem)] bg-background px-page py-8   dark:bg-background-dark">
			<article className="mx-auto max-w-3xl rounded-2xl border border-border-subtle bg-surface px-5 py-7 shadow-xs   dark:border-border-dark-subtle dark:bg-surface-dark">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-brand-800 dark:hover:text-brand-300"
				>
					<i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
					Back to Comynity
				</Link>

				<header className="mt-7 border-b border-border-subtle pb-7 dark:border-border-dark-subtle">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
						Legal
					</p>
					<h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground  dark:text-foreground-dark">
						{title}
					</h1>
					<p className="mt-3 text-xs font-semibold text-foreground-muted dark:text-foreground-dark-muted">
						Effective August 18, 2026
					</p>
					<p className="mt-5 text-sm leading-7 text-foreground-secondary  dark:text-foreground-dark-secondary">
						{intro}
					</p>
				</header>

				<div className="space-y-8 pt-8">
					{sections.map((section, index) => (
						<section key={section.title} aria-labelledby={`legal-section-${index}`}>
							<h2
								id={`legal-section-${index}`}
								className="text-lg font-extrabold text-foreground  dark:text-foreground-dark"
							>
								{section.title}
							</h2>
							<div className="mt-3 space-y-3 text-sm leading-7 text-foreground-secondary  dark:text-foreground-dark-secondary">
								{section.content}
							</div>
						</section>
					))}
				</div>
			</article>
		</main>
	);
}

export function LegalList({ children }: { children: ReactNode }) {
	return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}
