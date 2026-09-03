import { publicApiClient } from "@/lib/api";
import type {
  BusinessListResponse,
  BusinessNameDetailResponse,
  BusinessProductsListParams,
  BusinessProductsListResponse,
  ProductDetailResponse,
  NearbyOffersResponse,
} from "./business.types";

export async function getNearbyOffers({ lat, lng, page = 1 }: { lat: number; lng: number; page?: number }) {
  const { data } = await publicApiClient.get<NearbyOffersResponse>("/api/offers/nearby/", { params: { lat, lng, page } });
  return { ...data, results: data.results ?? [] };
}

export async function getBusinesses({
  lat,
  lng,
  category,
  page,
  isVerified,
  openNow,
  isFeatured,
  radiusKm = 5,
}: {
  lat: number;
  lng: number;
  category?: string;
  page: number;
  isVerified?: boolean;
  openNow?: boolean;
  isFeatured?: boolean;
  radiusKm?: number;
}) {
  const { data } = await publicApiClient.get<BusinessListResponse>("/api/businesses/", {
    params: {
      lat,
      lng,
      category,
      page,
      is_verified: isVerified,
      open_now: openNow,
      is_featured: isFeatured,
      radius_km: radiusKm,
    },
  });

  return {
    ...data,
    results: (data.results ?? []).filter(
      (business): business is NonNullable<typeof business> => business !== null,
    ),
  };
}

export async function getProductBySlug(slug: string) {
  const { data } = await publicApiClient.get<ProductDetailResponse>(
    `/api/catalogs/products/${encodeURIComponent(slug)}/`,
  );
  if (!data.result) throw new Error("Product not found.");
  return data.result;
}

export async function getProductById(id: string) {
  const { data } = await publicApiClient.get<ProductDetailResponse>(
    `/api/catalogs/products/${encodeURIComponent(id)}/`,
  );
  if (!data.result) throw new Error("Product not found.");
  return data.result;
}

export async function getBusinessNameBySlug(slug: string) {
  const { data } = await publicApiClient.get<BusinessNameDetailResponse>(
    `/api/businesses/${encodeURIComponent(slug)}/`,
  );
  if (!data.result) throw new Error("Business not found.");
  return data.result;
}

export async function getBusinessById(id: string) {
  const { data } = await publicApiClient.get<BusinessNameDetailResponse>(
    `/api/businesses/${encodeURIComponent(id)}/`,
  );
  if (!data.result) throw new Error("Business not found.");
  return data.result;
}

export async function getBusinessProducts(
  businessSlug: string,
  {
    category,
    minPrice,
    maxPrice,
    isFeatured,
    sortBy,
    sortOrder,
    page = 1,
    pageSize = 20,
  }: BusinessProductsListParams = {},
) {
  const { data } = await publicApiClient.get<BusinessProductsListResponse>(
    `/api/businesses/${encodeURIComponent(businessSlug)}/catalogs/products/`,
    {
      params: {
        category,
        min_price: minPrice,
        max_price: maxPrice,
        is_featured: isFeatured || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      },
    },
  );

  return {
    ...data,
    categories: data.categories ?? [],
    results: data.results ?? [],
  };
}
