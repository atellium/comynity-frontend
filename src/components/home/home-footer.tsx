import Link from "next/link";

const supportNumber = (
	process.env.NEXT_PUBLIC_COMYNITY_WHATSAPP_NUMBER ?? "917872843381"
).replace(/\D/g, "");
const supportMessage = encodeURIComponent("Hi Comynity, I need some help.");

export function HomeFooter() {
	return (
		<footer>
			<div className="px-page pt-10 pb-6 ">
				<p className="text-[32px] font-black text-slate-300/60 leading-tight">
					Community <br /> Meets Commerce
				</p>
				<nav
					className="mt-5 flex items-center justify-center gap-4 text-[11px] font-semibold text-foreground-muted"
					aria-label="Legal links"
				>
					<Link href="/privacy" className="text-gray-400 hover:text-brand">
						Privacy
					</Link>
					<span className="text-gray-300" aria-hidden="true">
						•
					</span>
					<Link href="/terms" className="text-gray-400 hover:text-brand">
						Terms
					</Link>
					<span className="text-gray-300" aria-hidden="true">
						•
					</span>
					<a
						href={`https://wa.me/${supportNumber}?text=${supportMessage}`}
						target="_blank"
						rel="noreferrer"
						className="text-gray-400 hover:text-brand"
					>
						Support
					</a>
				</nav>
				{/* <p className="mt-3 text-center text-[11px] font-semibold text-foreground-subtle">
					Crafted with love ❤️ in India
				</p> */}
			</div>
		</footer>
	);
}
