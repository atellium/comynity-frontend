import type { BusinessProductCategory, ProductCustomField, ProductDetail, ProductVariant } from "@/features/businesses/business.types";

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
