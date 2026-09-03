"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getBusinesses } from "./business.service";

const LISTING_RADIUS_KM = 5;

export function useBusinessList({
  category,
  lat,
  lng,
  isVerified,
  openNow,
  isFeatured,
}: {
  category?: string;
  lat: number | null;
  lng: number | null;
  isVerified: boolean;
  openNow: boolean;
  isFeatured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["businesses", category ?? "all", lat, lng, isVerified, openNow, isFeatured ?? false, LISTING_RADIUS_KM],
    queryFn: ({ pageParam }) =>
      getBusinesses({
        category,
        lat: lat!,
        lng: lng!,
        page: pageParam,
        isVerified: isVerified || undefined,
        openNow: openNow || undefined,
        isFeatured: isFeatured || undefined,
        radiusKm: LISTING_RADIUS_KM,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    enabled: lat !== null && lng !== null,
  });
}
