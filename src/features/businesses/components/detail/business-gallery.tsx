"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BusinessNameDetail } from "../../business.types";

export function BusinessGallery({ business }: { business: BusinessNameDetail }) {
	const images = Array.from(new Set((business.media.gallery ?? []).filter(Boolean)));
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const touchStart = useRef<number | null>(null);

	useEffect(() => {
		if (!lightboxOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") setLightboxOpen(false);
			if (event.key === "ArrowLeft") setActiveIndex((index) => Math.max(0, index - 1));
			if (event.key === "ArrowRight") setActiveIndex((index) => Math.min(images.length - 1, index + 1));
		}
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [images.length, lightboxOpen]);

	if (images.length === 0) return null;

	const directionHref = business.location.display_full_address
		&& Number.isFinite(business.location.coordinates.latitude)
		&& Number.isFinite(business.location.coordinates.longitude)
		? `https://www.google.com/maps/dir/?api=1&destination=${business.location.coordinates.latitude},${business.location.coordinates.longitude}`
		: undefined;

	function openLightbox(index: number) {
		setActiveIndex(index);
		setLightboxOpen(true);
	}

	function finishSwipe(clientX: number) {
		if (touchStart.current === null) return;
		const distance = clientX - touchStart.current;
		if (Math.abs(distance) > 45) {
			setActiveIndex((index) => Math.max(0, Math.min(images.length - 1, index + (distance > 0 ? -1 : 1))));
		}
		touchStart.current = null;
	}

	return (
		<section className="mt-6" aria-labelledby="business-gallery-heading">
			<h2 id="business-gallery-heading" className="text-base font-extrabold tracking-tight text-foreground dark:text-foreground-dark">Gallery</h2>
			<div className="-mx-page hide-scrollbar mt-2.5 flex gap-3 overflow-x-auto px-page pb-2">
				{images.slice(0, 6).map((image, index) => (
					<button key={`${image}-${index}`} type="button" onClick={() => openLightbox(index)} className="group relative h-32 w-40 shrink-0 overflow-hidden rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary" aria-label={index === 5 ? `View all ${images.length} gallery images` : `Open gallery image ${index + 1}`}>
						<Image src={image} alt={`${business.name} gallery image ${index + 1}`} fill sizes="160px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
						{index === 5 && <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white backdrop-blur-[1px]"><i className="fa-solid fa-images mb-1.5 text-xl" aria-hidden="true" /><span className="text-xs font-extrabold">View all</span><span className="mt-0.5 text-[10px] font-semibold text-white/80">{images.length} photos</span></span>}
					</button>
				))}
			</div>

			{lightboxOpen && (
				<div className="fixed inset-0 z-10000 flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`${business.name} image gallery`}>
					<div className="flex h-14 shrink-0 items-center justify-between px-3 text-white">
						<span className="text-sm font-bold">{activeIndex + 1} / {images.length}</span>
						<button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image gallery" className="flex size-10 items-center justify-center rounded-full bg-white/10"><X size={22} aria-hidden="true" /></button>
					</div>
					<div className="relative min-h-0 flex-1 overflow-hidden" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}>
						<div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
							{images.map((image, index) => <div key={`${image}-lightbox-${index}`} className="relative h-full w-full shrink-0"><Image src={image} alt={`${business.name} gallery image ${index + 1}`} fill sizes="100vw" className="object-contain" priority={index === activeIndex} /></div>)}
						</div>
						{images.length > 1 && <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-label={`Image ${activeIndex + 1} of ${images.length}`}>{images.map((_, index) => <span key={index} className={`block rounded-full transition-all ${index === activeIndex ? "h-1.5 w-5 bg-white" : "size-1.5 bg-white/45"}`} />)}</div>}
					</div>
					<div className="shrink-0 border-t border-white/15 bg-black px-page pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 text-white">
						<div className="mx-auto flex max-w-160 items-center gap-3">
							<p className="min-w-0 flex-1 truncate text-sm font-extrabold">{business.name}</p>
							<div className="flex shrink-0 gap-2">
								<GalleryAction href={business.contact.phone ? `tel:${business.contact.phone}` : undefined} icon="fa-phone" label="Call now" variant="brand" />
								<GalleryAction href={business.contact.whatsapp ? `https://wa.me/${business.contact.whatsapp.replace(/\D/g, "")}` : undefined} icon="fa-whatsapp" label="WhatsApp" variant="whatsapp" external brandIcon />
								<GalleryAction href={directionHref} icon="fa-diamond-turn-right" label="Direction" variant="outline" external />
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}

function GalleryAction({ href, icon, label, variant, external = false, brandIcon = false }: { href?: string; icon: string; label: string; variant: "brand" | "whatsapp" | "outline"; external?: boolean; brandIcon?: boolean }) {
	const variants = { brand: "border-brand bg-brand text-white", whatsapp: "border-[#25D366] bg-[#25D366] text-white", outline: "border-white/60 bg-white text-brand" };
	const className = `flex size-10 shrink-0 items-center justify-center rounded-full border ${variants[variant]}`;
	const content = <i className={`${brandIcon ? "fa-brands" : "fa-solid"} ${icon} text-base`} aria-hidden="true" />;
	if (!href) return <span className={`${className} opacity-40`} aria-disabled="true" aria-label={`${label} unavailable`}>{content}</span>;
	return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className} aria-label={label}>{content}</a>;
}
