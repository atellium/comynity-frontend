import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessOfferEditorScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Edit Offer", robots: { index: false, follow: false } };

export default async function EditOfferPage({ params }: PageProps<"/business/[slug]/manage/offers/[offerId]/edit">) {
  const { slug, offerId } = await params;
  return <AuthGuard><BusinessOfferEditorScreen businessSlug={decodeURIComponent(slug)} offerId={decodeURIComponent(offerId)} /></AuthGuard>;
}
