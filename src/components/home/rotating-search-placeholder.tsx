"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SEARCH_PLACEHOLDERS } from "@/features/search/search.constants";

export function RotatingSearchPlaceholder({
  className = "",
}: {
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <span className={`relative block h-6 overflow-hidden ${className}`}>
      <span className="sr-only">Search local categories</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={index}
          aria-hidden="true"
          initial={reduceMotion ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-0 truncate"
        >
          {SEARCH_PLACEHOLDERS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
