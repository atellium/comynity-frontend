import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageOffersScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/offers">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Offers");
}

export default async function BusinessOffersPage({ params }: PageProps<"/business/[slug]/manage/offers">) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageOffersScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
