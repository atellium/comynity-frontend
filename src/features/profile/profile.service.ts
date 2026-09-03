import { protectedApiClient } from "@/lib/api";
import type { BusinessCategoryOption, BusinessCityOption, BusinessGalleryResponse, BusinessHoursUpdatePayload, BusinessUpdatePayload, OwnedBusinessInfoResponse, OwnedBusinessesResponse } from "./profile.types";
import type { CatalogCategorySearchResponse, CatalogGalleryResponse, CatalogPayload } from "./catalog.types";
import type { BusinessOfferResponse, BusinessOffersResponse } from "./offer.types";

export async function getOwnedBusinesses() {
  const { data } = await protectedApiClient.get<OwnedBusinessesResponse>(
    "/api/businesses/mine/",
  );

  return {
    ...data,
    results: (data.results ?? []).filter(
      (business): business is NonNullable<typeof business> => business !== null,
    ),
  };
}

export async function searchCatalogCategories(search: string) {
  const { data } = await protectedApiClient.get<CatalogCategorySearchResponse>("/api/catalogs/categories/", { params: { search } });
  return (data.results ?? []).map((category) => ({
    ...category,
    display_name: category.name,
  }));
}

export async function createCatalog(businessSlug: string, payload: CatalogPayload) {
  const { data } = await protectedApiClient.post(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/`, payload);
  return data;
}

export async function updateCatalog(businessSlug: string, catalogSlug: string, payload: CatalogPayload) {
  const { data } = await protectedApiClient.patch(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/`, payload);
  return data;
}

export async function deleteCatalog(businessSlug: string, catalogSlug: string) {
  await protectedApiClient.delete(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/`);
}

function catalogImagesUrl(businessSlug: string, catalogSlug: string) {
  return `/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/images/`;
}

export async function getCatalogImages(businessSlug: string, catalogSlug: string) {
  const { data } = await protectedApiClient.get<CatalogGalleryResponse>(catalogImagesUrl(businessSlug, catalogSlug));
  return [...(data.results ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function createCatalogImages(businessSlug: string, catalogSlug: string, formData: FormData) {
  const { data } = await protectedApiClient.post<CatalogGalleryResponse>(catalogImagesUrl(businessSlug, catalogSlug), formData);
  return data.results ?? [];
}

export async function updateCatalogImages(businessSlug: string, catalogSlug: string, formData: FormData) {
  const { data } = await protectedApiClient.patch<CatalogGalleryResponse>(catalogImagesUrl(businessSlug, catalogSlug), formData);
  return data.results ?? [];
}

export async function getOwnedBusinessInfo(slug: string) {
  const { data } = await protectedApiClient.get<OwnedBusinessInfoResponse>(
    `/api/businesses/mine/${encodeURIComponent(slug)}/`,
  );
  if (!data.result) throw new Error("Business not found.");
  return data.result;
}

export async function updateOwnedBusiness(slug: string, payload: BusinessUpdatePayload | FormData) {
  const { data } = await protectedApiClient.patch<OwnedBusinessInfoResponse>(`/api/businesses/mine/${encodeURIComponent(slug)}/`, payload);
  if (!data.result) throw new Error("Business update returned no result.");
  return data.result;
}

export async function updateBusinessHours(slug: string, payload: BusinessHoursUpdatePayload) {
  await protectedApiClient.patch(
    `/api/businesses/${encodeURIComponent(slug)}/hours/`,
    payload,
  );
}

function businessGalleryUrl(slug: string) {
  return `/api/businesses/mine/${encodeURIComponent(slug)}/gallery/`;
}

export async function getBusinessGallery(slug: string) {
  const { data } = await protectedApiClient.get<BusinessGalleryResponse>(businessGalleryUrl(slug));
  return data.results ?? [];
}

export async function updateBusinessGallery(slug: string, payload: FormData) {
  const { data } = await protectedApiClient.patch<BusinessGalleryResponse>(businessGalleryUrl(slug), payload);
  return data.results ?? [];
}

function businessOffersUrl(slug: string) {
  return `/api/businesses/mine/${encodeURIComponent(slug)}/offers/`;
}

export async function getBusinessOffers(slug: string) {
  const { data } = await protectedApiClient.get<BusinessOffersResponse>(businessOffersUrl(slug));
  return data.results ?? [];
}

export async function createBusinessOffer(slug: string, payload: FormData) {
  const { data } = await protectedApiClient.post<BusinessOfferResponse>(businessOffersUrl(slug), payload);
  if (!data.result) throw new Error("Offer creation returned no result.");
  return data.result;
}

export async function updateBusinessOffer(slug: string, offerId: string, payload: FormData) {
  const { data } = await protectedApiClient.patch<BusinessOfferResponse>(`${businessOffersUrl(slug)}${encodeURIComponent(offerId)}/`, payload);
  if (!data.result) throw new Error("Offer update returned no result.");
  return data.result;
}

export async function deleteBusinessOffer(slug: string, offerId: string) {
  await protectedApiClient.delete(`${businessOffersUrl(slug)}${encodeURIComponent(offerId)}/`);
}

export async function searchBusinessCategories(search: string) {
  const { data } = await protectedApiClient.get<{ results: BusinessCategoryOption[] | null }>("/api/categories/business/", { params: { search } });
  return (data.results ?? []).map((category) => ({
    ...category,
    display_name: category.name,
  }));
}

export async function searchBusinessCities(search: string) {
  const { data } = await protectedApiClient.get<BusinessCityOption[]>("/api/locations/cities/", { params: { search } });
  return data;
}
