"use client";

import { useEffect, useRef } from "react";
import { SiteLoader } from "@/components/loaders";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LOCATION_SESSION_KEY } from "../location.constants";
import { initializeSessionLocation } from "../location.thunks";

export function LocationSessionInitializer() {
  const dispatch = useAppDispatch();
  const initializationStarted = useRef(false);
  const rehydrated = useAppSelector(
    (state) => state.location._persist?.rehydrated ?? false,
  );
  const status = useAppSelector((state) => state.location.autoDetectionStatus);

  useEffect(() => {
    if (!rehydrated || initializationStarted.current) return;

    initializationStarted.current = true;
    if (window.sessionStorage.getItem(LOCATION_SESSION_KEY)) return;

    window.sessionStorage.setItem(LOCATION_SESSION_KEY, "true");
    dispatch(initializeSessionLocation());
  }, [dispatch, rehydrated]);

  return status === "loading" ? (
    <SiteLoader label="Finding your location" />
  ) : null;
}
