"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const banners = [
  "/images/banner/banner_1.png",
  "/images/banner/banner_2.png",
  "/images/banner/banner_3.png",
  "/images/banner/banner_4.png",
];

const slides = [...banners, banners[0]];

export function HomeBannerSlider() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef(0);
  const loopResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToSlide(index: number, behavior: ScrollBehavior = "smooth") {
    const scroller = scrollerRef.current;
    const slide = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !slide) return;
    scroller.scrollTo({ left: slide.offsetLeft, behavior });
  }

  function updateActiveBanner() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const children = Array.from(scroller.children) as HTMLElement[];
    const rawIndex = children.reduce((closest, child, index) =>
      Math.abs(child.offsetLeft - scroller.scrollLeft) < Math.abs(children[closest].offsetLeft - scroller.scrollLeft) ? index : closest, 0);

    activeSlideRef.current = rawIndex;
    setActiveIndex(rawIndex % banners.length);

    if (rawIndex === banners.length && !loopResetRef.current) {
      loopResetRef.current = setTimeout(() => {
        scrollToSlide(0, "instant");
        activeSlideRef.current = 0;
        loopResetRef.current = null;
      }, 500);
    }
  }

  useEffect(() => {
    const autoplay = window.setInterval(() => {
      scrollToSlide(activeSlideRef.current + 1);
    }, 5000);

    return () => {
      window.clearInterval(autoplay);
      if (loopResetRef.current) clearTimeout(loopResetRef.current);
    };
  }, []);

  function goToBanner(index: number) {
    activeSlideRef.current = index;
    setActiveIndex(index);
    scrollToSlide(index);
  }

  return (
    <section className="mx-auto w-full max-w-3xl pb-4 pt-4" aria-label="Featured banners">
      <div
        ref={scrollerRef}
        onScroll={updateActiveBanner}
        className="flex touch-pan-x snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((banner, index) => (
          <div key={`${banner}-${index}`} className="w-full shrink-0 snap-center px-2.5">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-tertiary shadow-sm dark:bg-surface-dark-tertiary">
              <Image
                src={banner}
                alt={index === banners.length ? "" : `Featured promotion ${index + 1}`}
                fill
                sizes="(max-width: 768px) calc(100vw - 1.25rem), 748px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5" aria-label="Banner pagination">
        {banners.map((banner, index) => (
          <button
            key={banner}
            type="button"
            onClick={() => goToBanner(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-5 bg-brand" : "w-2 bg-foreground-subtle/40 hover:bg-foreground-subtle/70 dark:bg-foreground-dark-subtle/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
