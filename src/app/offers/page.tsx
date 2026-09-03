import type { Metadata } from "next";
import { NearbyOffersPage } from "@/features/businesses";

export const metadata: Metadata = { title: "Nearby Offers", description: "Discover offers from businesses near you." };

export default function OffersPage() {
  return <NearbyOffersPage />;
}
