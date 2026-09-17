import { protectedApiClient } from "@/lib/api";
import axios, { type AxiosResponse } from "axios";
import type { BusinessCategoryOption, BusinessCityOption, BusinessGalleryImage, BusinessGalleryResponse, BusinessGalleryUpload, BusinessGalleryUploadTicket, BusinessHoursUpdatePayload, BusinessUpdatePayload, BusinessUploadsResponse, BusinessUploadTicketsResponse, OwnedBusinessInfoResponse, OwnedBusinessesResponse } from "./profile.types";
import type { CatalogCategorySearchResponse, CatalogDetailResponse, CatalogGalleryImage, CatalogGalleryResponse, CatalogImageUpload, CatalogImageUploadTicket, CatalogPayload, DoctorPayload, DoctorSpecialtySearchResponse, ManagedDoctor, ManagedDoctorsResponse, OwnedProductResponse, OwnedProductsResponse, ProductCategorySearchResponse, ProductPayload } from "./catalog.types";
import type { BusinessOffer, BusinessOfferPayload, BusinessOfferResponse, BusinessOffersResponse } from "./offer.types";

function normalizeOwnedBusinessInfo(business: NonNullable<OwnedBusinessInfoResponse["result"]>) {
  return {
    ...business,
    seo: business.seo ?? {
      title: null,
      description: null,
      keywords: null,
    },
  };
}

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

export async function searchCatalogCategories(search: string, type?: "product" | "specialty") {
  const { data } = await protectedApiClient.get<CatalogCategorySearchResponse>("/api/catalogs/categories/", { params: { search, type } });
  return (data.results ?? []).map((category) => ({
    ...category,
    display_name: category.name,
  }));
}

export async function searchProductCategories(search: string) {
  const { data } = await protectedApiClient.get<ProductCategorySearchResponse>("/api/products/categories/", { params: { search } });
  return (data.results ?? []).map((category) => ({
    ...category,
    display_name: category.display_name || category.label || category.name,
  }));
}

export async function searchDoctorSpecialties(search: string) {
  const { data } = await protectedApiClient.get<DoctorSpecialtySearchResponse>("/api/doctors/specialties/", { params: { search } });
  return (data.results ?? []).map((specialty) => ({
    ...specialty,
    display_name: specialty.label || specialty.name,
  }));
}

function ownedDoctorsUrl(businessId: string) {
  return `/api/businesses/my/${encodeURIComponent(businessId)}/doctors/`;
}

function ownedDoctorUrl(businessId: string, doctorId: string) {
  return `${ownedDoctorsUrl(businessId)}${encodeURIComponent(doctorId)}/`;
}

export async function createDoctor(businessId: string, payload: DoctorPayload) {
  const { data } = await protectedApiClient.post<ManagedDoctor>(ownedDoctorsUrl(businessId), payload);
  return data;
}

export async function updateDoctor(businessId: string, doctorId: string, payload: DoctorPayload) {
  const { data } = await protectedApiClient.patch<ManagedDoctor>(ownedDoctorUrl(businessId, doctorId), payload);
  return data;
}

export async function deleteDoctor(businessId: string, doctorId: string) {
  await protectedApiClient.delete(ownedDoctorUrl(businessId, doctorId));
}

export async function getManagedDoctors(businessSlug: string, page = 1) {
  const { data } = await protectedApiClient.get<ManagedDoctorsResponse>(`/api/businesses/${encodeURIComponent(businessSlug)}/doctors/`, { params: { page } });
  return {
    ...data,
    results: data.results ?? [],
  };
}

export async function getManagedDoctor(businessSlug: string, doctorIdOrSlug: string) {
  let page = 1;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const response = await getManagedDoctors(businessSlug, page);
    const doctor = response.results.find((item) => item.id === doctorIdOrSlug || item.slug === doctorIdOrSlug);
    if (doctor) return doctor;
    if (!response.pagination?.has_next) break;
    page += 1;
  }
  throw new Error("Doctor not found.");
}

function ownedProductsUrl(businessSlug: string) {
  return `/api/businesses/mine/${encodeURIComponent(businessSlug)}/products/`;
}

function ownedProductUrl(businessSlug: string, productSlug: string) {
  return `${ownedProductsUrl(businessSlug)}${encodeURIComponent(productSlug)}/`;
}

function productPublicIdFromSlug(productSlug: string) {
  const publicId = productSlug.split("-").at(-1);
  return publicId && publicId !== productSlug ? publicId : null;
}

async function withOwnedProductFallback<T>(productSlug: string, request: (lookup: string) => Promise<AxiosResponse<T>>) {
  try {
    return await request(productSlug);
  } catch (error) {
    const publicId = productPublicIdFromSlug(productSlug);
    if (!publicId || !axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    return request(publicId);
  }
}

export async function getOwnedProducts(businessSlug: string, page = 1) {
  const { data } = await protectedApiClient.get<OwnedProductsResponse>(ownedProductsUrl(businessSlug), { params: { page } });
  return {
    ...data,
    results: data.results ?? [],
  };
}

export async function getOwnedProduct(businessSlug: string, productSlug: string) {
  const { data } = await withOwnedProductFallback(productSlug, (lookup) => protectedApiClient.get<OwnedProductResponse>(ownedProductUrl(businessSlug, lookup)));
  if (!data.result) throw new Error("Product not found.");
  return {
    ...data.result,
    categories: (data.result.categories ?? []).map((category) => ({
      ...category,
      display_name: category.display_name || category.label || category.name,
    })),
  };
}

export async function createProduct(businessSlug: string, payload: ProductPayload) {
  console.log("Creating product payload", payload);
  const { data } = await protectedApiClient.post<OwnedProductResponse>(ownedProductsUrl(businessSlug), payload);
  return data;
}

export async function updateProduct(businessSlug: string, productSlug: string, payload: Partial<ProductPayload>) {
  console.log("Updating product payload", payload);
  const { data } = await withOwnedProductFallback(productSlug, (lookup) => protectedApiClient.patch<OwnedProductResponse>(ownedProductUrl(businessSlug, lookup), payload));
  return data;
}

export async function updateProductImages(businessSlug: string, productSlug: string, uploadIds: string[]) {
  return updateProduct(businessSlug, productSlug, { image_ids: uploadIds });
}

export async function deleteProduct(businessSlug: string, productSlug: string) {
  await withOwnedProductFallback(productSlug, (lookup) => protectedApiClient.delete(ownedProductUrl(businessSlug, lookup)));
}

export async function createCatalog(businessSlug: string, payload: CatalogPayload) {
  const { data } = await protectedApiClient.post(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/`, payload);
  return data;
}

export async function getCatalogDetails(businessSlug: string, catalogSlug: string) {
  const { data } = await protectedApiClient.get<CatalogDetailResponse>(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/details/`);
  if (!data.result) throw new Error("Catalog details returned no result.");
  return {
    ...data.result,
    categories: (data.result.categories ?? []).map((category) => ({
      ...category,
      display_name: category.display_name || category.label || category.name,
    })),
  };
}

export async function updateCatalog(businessSlug: string, catalogSlug: string, payload: CatalogPayload) {
  const { data } = await protectedApiClient.patch(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/`, payload);
  return data;
}

export async function updateCatalogViaEditEndpoint(businessSlug: string, catalogSlug: string, payload: CatalogPayload) {
  const { data } = await protectedApiClient.patch(`/api/businesses/mine/${encodeURIComponent(businessSlug)}/catalogs/${encodeURIComponent(catalogSlug)}/edit/`, payload);
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

function catalogImageUploadsUrl(businessSlug: string, catalogSlug: string) {
  return `${catalogImagesUrl(businessSlug, catalogSlug)}uploads/`;
}

export async function uploadCatalogImage(businessSlug: string, catalogSlug: string, file: File): Promise<CatalogGalleryImage> {
  const baseUrl = catalogImageUploadsUrl(businessSlug, catalogSlug);
  const { data: ticket } = await protectedApiClient.post<CatalogImageUploadTicket>(baseUrl, { content_type: file.type });
  const response = await fetch(ticket.upload_url, { method: "PUT", headers: { "Content-Type": ticket.content_type }, body: file });
  if (!response.ok) throw new Error("Direct product image upload failed.");
  await protectedApiClient.post(`${baseUrl}${ticket.id}/complete/`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const { data } = await protectedApiClient.get<CatalogImageUpload>(`${baseUrl}${ticket.id}/`);
    if (data.status === "ready" && data.image) return data.image;
    if (data.status === "failed") throw new Error(data.error || "Product image processing failed.");
    await wait(750);
  }
  throw new Error("Product image processing is taking longer than expected.");
}

export async function uploadCatalogImages(businessSlug: string, catalogSlug: string, files: File[]) {
  if (files.length > 20) throw new Error("You can upload a maximum of 20 product images.");
  const results: CatalogGalleryImage[] = new Array(files.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      results[index] = await uploadCatalogImage(businessSlug, catalogSlug, files[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(5, files.length) }, () => worker()));
  return results;
}

export async function getOwnedBusinessInfo(slug: string) {
  const { data } = await protectedApiClient.get<OwnedBusinessInfoResponse>(
    `/api/businesses/mine/${encodeURIComponent(slug)}/`,
  );
  if (!data.result) throw new Error("Business not found.");
  return normalizeOwnedBusinessInfo(data.result);
}

export async function updateOwnedBusiness(slug: string, payload: BusinessUpdatePayload | FormData) {
  const { data } = await protectedApiClient.patch<OwnedBusinessInfoResponse>(`/api/businesses/mine/${encodeURIComponent(slug)}/`, payload);
  if (!data.result) throw new Error("Business update returned no result.");
  return normalizeOwnedBusinessInfo(data.result);
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

export async function updateBusinessGallery(slug: string, uploadIds: string[]) {
  return updateOwnedBusiness(slug, { gallery: uploadIds });
}

function businessGalleryUploadsUrl(slug: string) {
  return `${businessGalleryUrl(slug)}uploads/`;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export async function uploadBusinessGalleryImage(slug: string, file: File): Promise<BusinessGalleryImage> {
  const { data: ticket } = await protectedApiClient.post<BusinessGalleryUploadTicket>(
    businessGalleryUploadsUrl(slug),
    { content_type: file.type },
  );
  const uploadResponse = await fetch(ticket.upload_url, {
    method: "PUT",
    headers: { "Content-Type": ticket.content_type },
    body: file,
  });
  if (!uploadResponse.ok) throw new Error("Direct image upload failed.");
  await protectedApiClient.post(`${businessGalleryUploadsUrl(slug)}${ticket.id}/complete/`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const { data } = await protectedApiClient.get<BusinessGalleryUpload>(
      `${businessGalleryUploadsUrl(slug)}${ticket.id}/`,
    );
    if (data.status === "ready" && data.image) return data.image;
    if (data.status === "failed") throw new Error(data.error || "Image processing failed.");
    await wait(750);
  }
  throw new Error("Image processing is taking longer than expected. Refresh the gallery shortly.");
}

export async function uploadBusinessGalleryImages(slug: string, files: File[]) {
  const results: BusinessGalleryImage[] = new Array(files.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < files.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await uploadBusinessGalleryImage(slug, files[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(5, files.length) }, () => worker()));
  return results;
}

async function uploadBusinessAsset(slug: string, file: File, initiateUrl: string) {
  const { data: ticket } = await protectedApiClient.post<BusinessGalleryUploadTicket>(initiateUrl, { content_type: file.type });
  const response = await fetch(ticket.upload_url, { method: "PUT", headers: { "Content-Type": ticket.content_type }, body: file });
  if (!response.ok) throw new Error("Direct image upload failed.");
  const statusUrl = `${businessGalleryUploadsUrl(slug)}${ticket.id}/`;
  await protectedApiClient.post(`${statusUrl}complete/`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const { data } = await protectedApiClient.get<BusinessGalleryUpload>(statusUrl);
    if (data.status === "ready") return data;
    if (data.status === "failed") throw new Error(data.error || "Image processing failed.");
    await wait(750);
  }
  throw new Error("Image processing is taking longer than expected.");
}

export async function uploadBusinessThumbnail(slug: string, file: File) {
  await uploadBusinessAsset(slug, file, `/api/businesses/mine/${encodeURIComponent(slug)}/thumbnail/uploads/`);
  return getOwnedBusinessInfo(slug);
}

export async function uploadBusinessOfferImage(slug: string, offerId: string, file: File) {
  return uploadBusinessAsset(slug, file, `${businessOffersUrl(slug)}${encodeURIComponent(offerId)}/image/uploads/`);
}

function businessOffersUrl(slug: string) {
  return `/api/businesses/mine/${encodeURIComponent(slug)}/offers/`;
}

export async function getBusinessOffers(slug: string) {
  const { data } = await protectedApiClient.get<BusinessOffersResponse>(businessOffersUrl(slug));
  return data.results ?? [];
}

function unwrapBusinessOffer(data: BusinessOfferResponse | BusinessOffer) {
  if ("result" in data) {
    if (!data.result) throw new Error("Offer request returned no result.");
    return data.result;
  }
  return data;
}

export async function createBusinessOffer(slug: string, payload: BusinessOfferPayload) {
  const { data } = await protectedApiClient.post<BusinessOfferResponse | BusinessOffer>(businessOffersUrl(slug), payload);
  return unwrapBusinessOffer(data);
}

export async function updateBusinessOffer(slug: string, offerId: string, payload: Partial<BusinessOfferPayload>) {
  const { data } = await protectedApiClient.patch<BusinessOfferResponse | BusinessOffer>(`${businessOffersUrl(slug)}${encodeURIComponent(offerId)}/`, payload);
  return unwrapBusinessOffer(data);
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

export async function getBusinessUploads() {
  const { data } = await protectedApiClient.get<BusinessUploadsResponse>("/api/uploads/");
  return data.results ?? [];
}

export async function uploadBusinessCoverImage(file: File) {
  const { data: tickets } = await protectedApiClient.post<BusinessUploadTicketsResponse>("/api/uploads/", {
    files: [{ mime_type: file.type, size: file.size }],
  });
  const ticket = tickets.results?.[0];
  if (!ticket) throw new Error("Upload request returned no ticket.");
  const uploadResponse = await fetch(ticket.upload_url, {
    method: "PUT",
    headers: { "Content-Type": ticket.mime_type },
    body: file,
  });
  if (!uploadResponse.ok) throw new Error("Direct image upload failed.");
  const { data: completed } = await protectedApiClient.post<BusinessUploadsResponse>("/api/uploads/complete/", {
    upload_ids: [ticket.id],
  });
  const upload = completed.results?.[0];
  if (!upload) throw new Error("Upload completion returned no image.");
  return upload;
}

export async function uploadBusinessImages(files: File[]) {
  const results = [];
  for (const file of files) results.push(await uploadBusinessCoverImage(file));
  return results;
}

export async function updateBusinessCoverImage(slug: string, uploadId: string) {
  return updateOwnedBusiness(slug, { cover_image: uploadId });
}
