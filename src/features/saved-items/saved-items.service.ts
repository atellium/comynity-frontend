import { protectedApiClient } from "@/lib/api";
import type { SaveItemResponse, SavedItemsResponse, SavedItemType } from "./saved-items.types";

export async function getSavedItems() {
  const { data } = await protectedApiClient.get<SavedItemsResponse>("/api/saved-items/");
  return { ...data, results: data.results ?? [] };
}

export async function saveItem(itemType: SavedItemType, objectId: string) {
  const { data } = await protectedApiClient.post<SaveItemResponse>("/api/saved-items/", {
    item_type: itemType,
    object_id: objectId,
  });
  return data.result;
}

export async function deleteSavedItem(objectId: string) {
  await protectedApiClient.delete(`/api/saved-items/${encodeURIComponent(objectId)}/`);
}
