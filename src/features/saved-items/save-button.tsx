"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, LoaderCircle } from "lucide-react";
import { AuthButton, useAuth } from "@/features/auth";
import { deleteSavedItem, getSavedItems, saveItem } from "./saved-items.service";
import type { SavedItemType } from "./saved-items.types";

export function SaveButton({ itemType, objectId, className = "" }: { itemType: SavedItemType; objectId: string; className?: string }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const savedItemsQuery = useQuery({ queryKey: ["saved-items"], queryFn: getSavedItems, enabled: isAuthenticated });
  const savedItem = savedItemsQuery.data?.results.find((item) => item.item_type === itemType && item.object_id === objectId);
  const mutation = useMutation({
    mutationFn: async () => {
      if (savedItem) await deleteSavedItem(savedItem.object_id);
      else await saveItem(itemType, objectId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-items"] }),
  });

  return <AuthButton
    aria-label={savedItem ? `Remove saved ${itemType}` : `Save ${itemType}`}
    aria-pressed={Boolean(savedItem)}
    disabled={mutation.isPending || (isAuthenticated && savedItemsQuery.isPending)}
    showLoader={false}
    onAuthSuccess={() => mutation.mutate()}
    onClick={(event) => event.stopPropagation()}
    className={className}
  >
    {mutation.isPending || (isAuthenticated && savedItemsQuery.isPending) ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <Bookmark size={20} strokeWidth={2.25} fill={savedItem ? "currentColor" : "none"} aria-hidden="true" />}
  </AuthButton>;
}
