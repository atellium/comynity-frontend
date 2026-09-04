export type BusinessCategory = {
  id?: number;
  slug: string;
  display_name: string;
};

export type BusinessHoursStatus = {
  status: "open" | "closing_soon" | "closed";
  next_closing_time: string | null;
  remark: string | null;
  schedule?: BusinessSchedule;
};

export type BusinessCity = string | {
  id?: number;
  name: string;
  state?: string;
  state_id?: number;
} | null;

export type BusinessListItem = {
  id: string;
  name: string;
  handle: string;
  slug: string;
  established_year: number | null;
  is_active: boolean;
  display_as_store: boolean;
  publication_status: string;
  last_updated: string;
  categories: BusinessCategory[] | null;
  media: { thumbnail: string | null; gallery?: string[] };
  is_verified: boolean;
  hours: BusinessHoursStatus | null;
  location: {
    address: string | null;
    landmark: string;
    locality: string;
    city: BusinessCity;
    state: string;
    postal_code: string;
    display_full_address?: boolean;
    coordinates: { latitude: number; longitude: number; distance_km: number };
  };
  contact: {
    phone: string;
    whatsapp: string;
    alternate_numbers: string[] | null;
    email: string;
    website: string;
    social_urls: Record<string, string> | null;
  };
};

export type BusinessListResponse = {
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_previous: boolean;
  };
  category: { name: string; display_name: string; label: string } | null;
  results: Array<BusinessListItem | null> | null;
};

export type BusinessScheduleSlot = {
  opens_at: string;
  closes_at: string;
};

export type BusinessSchedule = Record<string, BusinessScheduleSlot[]>;

export type BusinessProductCategory = {
  id: number;
  name: string;
  label: string;
  slug: string;
  type: string;
  display_name: string;
  image: string | null;
};

export type BusinessProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_type: "fixed" | "starts_from" | string;
  price: string;
  max_price: string | null;
  original_price: string | null;
  categories?: BusinessProductCategory[] | null;
  variants?: ProductVariant[] | null;
  specifications?: Record<string, string | number | boolean | null>;
  is_featured: boolean;
  primary_image: string | null;
};

export type BusinessProductsListResponse = {
  business: {
    id: string;
    name: string;
    slug: string;
  };
  categories: BusinessProductCategory[] | null;
  pagination: BusinessListResponse["pagination"];
  results: BusinessProduct[] | null;
};

export type BusinessProductsListParams = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: boolean;
  sortBy?: "price" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ProductDetailImage = {
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
};

export type ProductVariantValue = {
  value: string | number;
  unit?: string;
};

export type ProductVariant = {
  name: string;
  type: "text" | "measurement" | string;
  values: ProductVariantValue[];
};

export type ProductCustomField = {
  title: string;
  value: string;
  is_highlight?: boolean;
};

export type ProductDetail = Omit<BusinessProduct, "primary_image"> & {
  type: string;
  description: string;
  variants: ProductVariant[];
  specifications: Record<string, string | number | boolean | null>;
  custom_fields: ProductCustomField[];
  categories: BusinessProductCategory[];
  images: ProductDetailImage[];
  business: {
    id: string;
    name: string;
    handle: string;
    slug: string;
    thumbnail: string | null;
    locality: string;
    city: { id: number; name: string; state: string };
  };
};

export type ProductDetailResponse = { result: ProductDetail | null };

export type BusinessProducts = {
  categories: BusinessProductCategory[] | null;
  items: BusinessProduct[] | null;
};

export type BusinessDetailOffer = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  is_currently_active: boolean;
  status: string;
  sort_order: number;
  terms: string[];
  created_at: string;
  updated_at: string;
};

export type BusinessNameDetail = {
  id: string;
  name: string;
  description: string | null;
  is_verified: boolean;
  categories: BusinessCategory[] | null;
  media: {
    thumbnail: string | null;
	gallery?: string[] | null;
  };
  location: {
    address: string | null;
    landmark: string | null;
    locality: string;
    city: {
      id: number;
      name: string;
      state_id: number;
      state: string;
    };
    postal_code: string | null;
    display_full_address: boolean;
    coordinates: {
      latitude: number;
      longitude: number;
      distance_km: number | null;
    };
  };
  contact: {
    phone: string | null;
    whatsapp: string | null;
    alternate_numbers: string[] | null;
    email: string | null;
    website: string | null;
    social_urls: Record<string, string> | null;
  };
  hours: (BusinessHoursStatus & { schedule: BusinessSchedule }) | null;
  product: BusinessProducts | null;
  offers: BusinessDetailOffer[] | null;
};

export type BusinessNameDetailResponse = {
  result: BusinessNameDetail | null;
};

export type NearbyOffer = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  is_currently_active: boolean;
  status: string;
  sort_order: number;
  terms: string[];
  created_at: string;
  updated_at: string;
  distance_km: number;
  business: {
    id: string;
    name: string;
    handle: string;
    slug: string;
    thumbnail: string | null;
    locality: string;
    city: { id: number; name: string; state: string };
  };
};

export type NearbyOffersResponse = {
  pagination: BusinessListResponse["pagination"];
  results: NearbyOffer[] | null;
};
