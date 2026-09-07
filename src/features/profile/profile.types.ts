import type { BusinessListItem, BusinessListResponse } from "@/features/businesses";

export type OwnedBusiness = Omit<BusinessListItem, "display_as_store" | "location"> & {
  display_as_store?: boolean;
  location: Omit<BusinessListItem["location"], "state" | "coordinates"> & {
    state?: string;
    coordinates: Omit<BusinessListItem["location"]["coordinates"], "distance_km"> & {
      distance_km: number | null;
    };
  };
};

export type OwnedBusinessesResponse = Omit<BusinessListResponse, "results"> & {
  results: Array<OwnedBusiness | null> | null;
};

export type OwnedBusinessInfo = Omit<OwnedBusiness, "hours" | "media"> & {
  description: string | null;
  services: string[] | null;
  offerings: string[] | null;
  media: OwnedBusiness["media"] & { gallery: string[] };
  hours: (NonNullable<OwnedBusiness["hours"]> & {
    schedule: Record<string, Array<{ opens_at: string; closes_at: string }>>;
  }) | null;
  seo: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  metadata: {
    created_at: string;
    updated_at: string;
  };
  owner_id: string;
  visibility: {
    display_full_address: boolean;
    display_business_hours: boolean;
  };
};

export type OwnedBusinessInfoResponse = {
  result: (Omit<OwnedBusinessInfo, "seo"> & { seo: OwnedBusinessInfo["seo"] | null }) | null;
};

export type BusinessGalleryImage = {
  id: string;
  image: string;
};

export type BusinessGalleryResponse = {
  results: BusinessGalleryImage[] | null;
};

export type BusinessGalleryUploadTicket = {
  id: string;
  upload_url: string;
  content_type: string;
  expires_in: number;
};

export type BusinessGalleryUpload = {
  id: string;
  status: "pending" | "processing" | "ready" | "failed";
  error: string;
  image: BusinessGalleryImage | null;
  asset_url?: string | null;
};

export type BusinessCategoryOption = { id: number; name: string; display_name: string; label: string; slug: string };
export type BusinessCityOption = { id: number; name: string; slug: string; tier: number; state: { id: number; name: string; slug: string; code: string } };
export type BusinessUpdatePayload = Partial<{
  name: string; handle: string; categories: number[]; address: string; landmark: string; locality: string; city: number; postal_code: string;
  latitude: number; longitude: number; phone: string; whatsapp: string; email: string; website: string; description: string;
  established_year: number; alternate_numbers: string[]; social_urls: Record<string, string>; is_active: boolean;
  display_full_address: boolean; display_business_hours: boolean; seo_title: string; seo_description: string; seo_keywords: string;
  services: string[]; offerings: string[];
}>;

export type BusinessHoursUpdatePayload = {
  business_hours: Array<{
    days: number[];
    opens_at: string;
    closes_at: string;
  }>;
};
