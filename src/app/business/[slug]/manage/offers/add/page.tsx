import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessOfferEditorScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Add Offer", robots: { index: false, follow: false } };

export default async function AddOfferPage({ params }: PageProps<"/business/[slug]/manage/offers/add">) {
  const { slug } = await params;
  return <AuthGuard><BusinessOfferEditorScreen businessSlug={decodeURIComponent(slug)} /></AuthGuard>;
}
