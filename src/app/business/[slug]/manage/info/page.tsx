import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessInfoScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/info">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Business Information");
}

export default async function BusinessInfoPage({ params }: PageProps<"/business/[slug]/manage/info">) {
  const { slug } = await params;
  return <AuthGuard><BusinessInfoScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
