"use client";

import { useEffect, useRef } from "react";
import { clearAuthTokens, hasAuthTokens } from "@/lib/auth-tokens";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetAuthentication } from "../auth.slice";
import { fetchCurrentUser } from "../auth.thunks";

export function AuthSessionInitializer() {
  const dispatch = useAppDispatch();
  const initializationStarted = useRef(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const rehydrated = useAppSelector(
    (state) => state.auth._persist?.rehydrated ?? false,
  );

  useEffect(() => {
    if (!rehydrated || initializationStarted.current) return;
    initializationStarted.current = true;

    if (!hasAuthTokens()) {
      if (isAuthenticated || user) dispatch(resetAuthentication());
      return;
    }

    // A complete persisted session needs no network validation on reload.
    if (isAuthenticated && user) return;

    dispatch(fetchCurrentUser())
      .unwrap()
      .catch(() => {
        clearAuthTokens();
        dispatch(resetAuthentication());
      });
  }, [dispatch, isAuthenticated, rehydrated, user]);

  return null;
}
