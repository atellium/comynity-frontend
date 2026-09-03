const whatsappNumber = (
	process.env.NEXT_PUBLIC_COMYNITY_WHATSAPP_NUMBER ?? "919876543210"
).replace(/\D/g, "");

const listBusinessMessage = encodeURIComponent(
	"Hi Comynity, I'd like to list my business on the platform.",
);

export function ListBusinessCta() {
	return (
		<section className="mx-auto w-full max-w-5xl px-page pb-4">
			<a
				href={`https://wa.me/${whatsappNumber}?text=${listBusinessMessage}`}
				target="_blank"
				rel="noreferrer"
				className="group relative block overflow-hidden rounded-2xl border border-brand-700 bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-5 text-white transition-all hover:-translate-y-0.5"
			>
				<span className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full border-2 border-white/15" aria-hidden="true" />
				<span className="pointer-events-none absolute -right-2 -top-4 size-16 rounded-full border border-white/20" aria-hidden="true" />
				<span className="relative flex items-center gap-4">
					<span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition-colors group-hover:bg-white/20">
						<i className="fa-solid fa-store text-xl" aria-hidden="true" />
					</span>
					<span className="min-w-0 flex-1">
						<span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75">
							Grow your reach
						</span>
						<span className="block text-base font-extrabold leading-tight">
							List your business
						</span>
						<span className="mt-1 block whitespace-nowrap text-[11px] font-medium leading-relaxed text-white/80">
							Reach more customers in your community
						</span>
					</span>
				</span>
				<span className="relative mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-brand-800 transition-colors group-hover:bg-brand-50">
					Get Started
					<i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
				</span>
			</a>
		</section>
	);
}
