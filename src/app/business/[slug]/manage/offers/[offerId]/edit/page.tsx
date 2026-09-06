import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessOfferEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/offers/[offerId]/edit">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Edit Offer");
}

export default async function EditOfferPage({ params }: PageProps<"/business/[slug]/manage/offers/[offerId]/edit">) {
  const { slug, offerId } = await params;
  return <AuthGuard><BusinessOfferEditorScreen businessSlug={decodeURIComponent(slug)} offerId={decodeURIComponent(offerId)} /></AuthGuard>;
}
