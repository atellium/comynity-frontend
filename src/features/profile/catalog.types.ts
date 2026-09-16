import type { BusinessProductCategory, ProductCustomField, ProductDetail, ProductVariant } from "@/features/businesses/business.types";
import type { BusinessUpload } from "./profile.types";

export type CatalogPriceType = "fixed" | "starts_from" | "ask" | "range";

export type DoctorSpecifications = {
  qualification: string;
  experience_years: number;
  gender: string;
  consultation_fee: number;
  treatments: string[];
  languages: string[];
  schedule: Array<{
    title: string;
    slots: string[];
  }>;
};

export type CatalogPayload = {
  name: string;
  type: "product" | "doctor";
  description: string;
  price_type: CatalogPriceType;
  price?: string;
  max_price?: string;
  original_price?: string;
  variants: ProductVariant[];
  specifications: { is_bargain: boolean; is_available: boolean; is_bestseller: boolean } | DoctorSpecifications;
  custom_fields: ProductCustomField[];
  categories: number[];
  is_featured: boolean;
  is_active: boolean;
  sort_order?: number;
};

export type CatalogCategory = BusinessProductCategory & {
  parent: number | null;
  aliases: string;
  is_active: boolean;
};

export type CatalogCategorySearchResponse = {
  results: CatalogCategory[] | null;
};

export type EditableProduct = ProductDetail & {
  is_active?: boolean;
  categories: CatalogCategory[];
};

export type CatalogDetailResponse = {
  result: EditableProduct | null;
};

export type CatalogGalleryImage = {
  id: string;
  image: string;
  is_primary?: boolean;
  sort_order?: number;
};

export type CatalogGalleryResponse = {
  results: CatalogGalleryImage[] | null;
};

export type CatalogImageUploadTicket = {
  id: string;
  upload_url: string;
  content_type: string;
  expires_in: number;
};

export type CatalogImageUpload = {
  id: string;
  status: "pending" | "processing" | "ready" | "failed";
  error: string;
  image: CatalogGalleryImage | null;
};

export type ProductPayload = {
  name: string;
  description: string;
  categories: number[];
  price_type: CatalogPriceType;
  price?: string | null;
  mrp_price?: string | null;
  max_price?: string | null;
  variants: Record<string, string[]>;
  specifications: Array<{ label: string; value: string }>;
  status: "active" | "inactive" | "draft";
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  image_ids?: string[];
};

export type OwnedProductImage = {
  id: string;
  upload: BusinessUpload;
  sort_order: number;
};

export type OwnedProduct = {
  id: string;
  public_id?: string;
  name: string;
  slug: string;
  description?: string | null;
  categories?: BusinessProductCategory[] | null;
  price_type: CatalogPriceType | string;
  price?: string | null;
  mrp_price?: string | null;
  max_price?: string | null;
  images?: OwnedProductImage[] | null;
  variants?: Record<string, string[]> | null;
  specifications?: Array<{ label: string; value: string }> | null;
  status?: "active" | "inactive" | "draft" | string;
  is_featured: boolean;
  is_available?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type OwnedProductsResponse = {
  business?: {
    id: string;
    name: string;
    slug: string;
  };
  pagination?: import("@/features/businesses/business.types").BusinessListResponse["pagination"];
  results: OwnedProduct[] | null;
};

export type OwnedProductResponse = {
  result: OwnedProduct | null;
};

export type ProductCategorySearchResponse = {
  results: CatalogCategory[] | null;
};

export type DoctorSpecialty = {
  id: number;
  name: string;
  label: string;
  slug: string;
  aliases: string;
  body_part: string;
  image?: string;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  display_name?: string;
};

export type DoctorSchedulePayload = {
  schedule_type: "weekly" | "monthly_weekday" | "monthly_date";
  weekday?: number | null;
  week_of_month?: number | null;
  day_of_month?: number | null;
  start_time: string;
  end_time: string;
  consultation_type: "walk_in" | "by_appointment";
  is_active: boolean;
};

export type DoctorPayload = {
  name: string;
  specialty_ids: number[];
  qualification: string;
  registration_number?: string;
  registration_council?: string;
  registration_year?: number | null;
  consultation_fee?: string;
  gender?: string;
  bio?: string;
  languages?: string[];
  treatments?: string[];
  is_active?: boolean;
  schedules?: DoctorSchedulePayload[];
};

export type ManagedDoctor = {
  id: string;
  name: string;
  slug: string;
  qualification: string;
  profile_image?: string | null;
  registration_number: string;
  registration_council: string;
  registration_year: number | null;
  consultation_fee: string;
  gender: string;
  bio: string;
  languages: string[];
  treatments: string[];
  is_active: boolean;
  is_featured?: boolean;
  specialties: DoctorSpecialty[];
  schedule?: {
    is_available?: boolean;
    next_available?: string | null;
    full_schedule?: Array<{
      schedule_type: "weekly" | "monthly_weekday" | "monthly_date";
      schedule_label?: string;
      weekday: number | null;
      week_of_month?: number | null;
      day_of_month: number | null;
      start_time: string;
      end_time: string;
      consultation_type: "walk_in" | "by_appointment";
    }>;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ManagedDoctorsResponse = {
  business?: {
    id: string;
    name: string;
    slug: string;
  };
  pagination?: import("@/features/businesses/business.types").BusinessListResponse["pagination"];
  results: ManagedDoctor[] | null;
};

export type DoctorSpecialtySearchResponse = {
  results: DoctorSpecialty[] | null;
};
