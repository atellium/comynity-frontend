import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessOfferEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/offers/add">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Add Offer");
}

export default async function AddOfferPage({ params }: PageProps<"/business/[slug]/manage/offers/add">) {
  const { slug } = await params;
  return <AuthGuard><BusinessOfferEditorScreen businessSlug={decodeURIComponent(slug)} /></AuthGuard>;
}
