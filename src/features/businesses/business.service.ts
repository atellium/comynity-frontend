import { publicApiClient } from "@/lib/api";
import type {
  BusinessListResponse,
  BusinessNameDetailResponse,
  ProductDetail,
  ProductDetailApiResponse,
  BusinessProductsListParams,
  BusinessProductsListResponse,
  NearbyOffersResponse,
  ProductVariant,
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
  const { data } = await publicApiClient.get<ProductDetailApiResponse>(
    `/api/products/${encodeURIComponent(slug)}/`,
  );
  if (!data.result) throw new Error("Product not found.");
  return normalizeProductDetail(data.result);
}

export async function getProductById(id: string) {
  const { data } = await publicApiClient.get<ProductDetailApiResponse>(
    `/api/products/${encodeURIComponent(id)}/`,
  );
  if (!data.result) throw new Error("Product not found.");
  return normalizeProductDetail(data.result);
}

function normalizeProductDetail(product: NonNullable<ProductDetailApiResponse["result"]>): ProductDetail {
  const business = product.business;
  return {
    ...product,
    type: product.type ?? "product",
    original_price: product.original_price ?? product.mrp_price ?? null,
    images: (product.images ?? []).map((image, index) => ({
      image: image.upload.url,
      alt_text: image.upload.title || product.name,
      is_primary: index === 0,
      sort_order: image.sort_order ?? index,
    })),
    variants: normalizeProductVariants(product.variants),
    specifications: normalizeProductSpecifications(product.specifications),
    custom_fields: product.custom_fields ?? normalizeSpecificationFields(product.specifications),
    categories: product.categories ?? [],
    business: business ? {
      ...business,
      handle: business.handle ?? business.slug,
      thumbnail: business.thumbnail ?? business.media?.thumbnail ?? null,
      cover_image: business.cover_image ?? business.media?.cover_image ?? null,
    } : {
      id: "",
      name: "",
      handle: "",
      slug: "",
      thumbnail: null,
      cover_image: null,
      locality: "",
      city: { id: 0, name: "", state: "" },
    },
  };
}

function normalizeProductVariants(variants: ProductDetailApiResponse["result"] extends infer Result ? Result extends { variants: infer Variants } ? Variants : never : never): ProductVariant[] {
  if (!variants) return [];
  if (Array.isArray(variants)) return variants;
  return Object.entries(variants).map(([name, values]) => ({
    name,
    type: "text",
    values: values.map((value) => ({ value })),
  }));
}

function normalizeProductSpecifications(specifications: ProductDetailApiResponse["result"] extends infer Result ? Result extends { specifications: infer Specifications } ? Specifications : never : never): ProductDetail["specifications"] {
  if (!specifications) return {};
  if (Array.isArray(specifications)) return Object.fromEntries(specifications.map((item) => [item.label, item.value]));
  return specifications;
}

function normalizeSpecificationFields(specifications: ProductDetailApiResponse["result"] extends infer Result ? Result extends { specifications: infer Specifications } ? Specifications : never : never) {
  return Array.isArray(specifications) ? specifications.map(({ label, value }) => ({ title: label, value })) : [];
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
    `/api/businesses/${encodeURIComponent(businessSlug)}/products/`,
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

export async function getProducts({
  category,
  minPrice,
  maxPrice,
  isFeatured,
  sortBy,
  sortOrder,
  page = 1,
  pageSize = 20,
}: BusinessProductsListParams = {}) {
  const { data } = await publicApiClient.get<BusinessProductsListResponse>(
    "/api/products/",
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

export async function getBusinessDoctors(businessSlug: string, page = 1) {
  const { data } = await publicApiClient.get<BusinessProductsListResponse>(
    `/api/businesses/${encodeURIComponent(businessSlug)}/catalogs/`,
    { params: { type: "doctor", page } },
  );

  return {
    ...data,
    categories: data.categories ?? [],
    results: data.results ?? [],
  };
}
