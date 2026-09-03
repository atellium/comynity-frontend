import type { BusinessListItem, BusinessProduct } from "@/features/businesses/business.types";

export type SavedItemType = "business" | "product" | (string & {});

export type SavedBusiness = Omit<BusinessListItem, "display_as_store" | "location"> & {
  display_as_store?: boolean;
  location: Omit<BusinessListItem["location"], "coordinates" | "state"> & {
    state?: string;
    coordinates: Omit<BusinessListItem["location"]["coordinates"], "distance_km"> & { distance_km: number | null };
  };
};

export type SavedProduct = Omit<BusinessProduct, "short_description"> & {
  public_id?: string;
  short_description?: string;
};

export type SavedItemPayload = SavedBusiness | SavedProduct | (Record<string, unknown> & { id?: string; name?: string; slug?: string });

export type SavedItem = {
  id: string;
  item_type: SavedItemType;
  object_id: string;
  created_at: string;
  item: SavedItemPayload;
};

export type SavedItemsResponse = { count: number; next: string | null; previous: string | null; results: SavedItem[] };
export type SaveItemResponse = { result: SavedItem };
