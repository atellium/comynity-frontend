"use client";

import { useEffect, useState } from "react";
import { SiteLoader } from "./site-loader";

const MINIMUM_DISPLAY_TIME_MS = 300;

export function SiteStartupLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(false),
      MINIMUM_DISPLAY_TIME_MS,
    );

    return () => window.clearTimeout(timer);
  }, []);

  return visible ? <SiteLoader label="Loading Cominity" /> : null;
}
