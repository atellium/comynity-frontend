import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageOffersScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Offers", robots: { index: false, follow: false } };

export default async function BusinessOffersPage({ params }: PageProps<"/business/[slug]/manage/offers">) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageOffersScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
