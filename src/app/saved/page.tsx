import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { SavedItemsPage } from "@/features/saved-items";

export const metadata: Metadata = { title: "Saved" };

export default function SavedPage() {
  return <AuthGuard><SavedItemsPage /></AuthGuard>;
}
