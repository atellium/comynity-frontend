"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SiteLoader } from "@/components/loaders";
import { hasAuthTokens } from "@/lib/auth-tokens";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetAuthentication } from "../auth.slice";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const redirectStarted = useRef(false);
  const { isAuthenticated, user, userStatus } = useAppSelector(
    (state) => state.auth,
  );
  const rehydrated = useAppSelector(
    (state) => state.auth._persist?.rehydrated ?? false,
  );

  useEffect(() => {
    if (!rehydrated) return;

    const tokensAvailable = hasAuthTokens();
    const sessionUnavailable = !tokensAvailable || userStatus === "failed";
    if (sessionUnavailable) {
      if (redirectStarted.current) return;

      redirectStarted.current = true;
      dispatch(resetAuthentication());
      router.replace("/");
    }
  }, [dispatch, isAuthenticated, rehydrated, router, user, userStatus]);

  if (!rehydrated || !isAuthenticated || !user) {
    return <SiteLoader label="Loading your profile" />;
  }

  return children;
}

export default AuthGuard;
