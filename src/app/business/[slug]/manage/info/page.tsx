import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessInfoScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Business Information", robots: { index: false, follow: false } };

export default async function BusinessInfoPage({ params }: PageProps<"/business/[slug]/manage/info">) {
  const { slug } = await params;
  return <AuthGuard><BusinessInfoScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
