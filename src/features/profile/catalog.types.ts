import type { BusinessProductCategory, ProductCustomField, ProductDetail, ProductVariant } from "@/features/businesses/business.types";

export type CatalogPriceType = "fixed" | "starts_from" | "ask" | "range";

export type CatalogPayload = {
  name: string;
  type: "product";
  description: string;
  price_type: CatalogPriceType;
  price?: string;
  max_price?: string;
  original_price?: string;
  variants: ProductVariant[];
  specifications: { is_bargain: boolean; is_available: boolean; is_bestseller: boolean };
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
