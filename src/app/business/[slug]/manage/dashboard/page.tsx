import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessDashboardScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/dashboard">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Business dashboard");
}

export default async function BusinessDashboardPage({
  params,
}: PageProps<"/business/[slug]/manage/dashboard">) {
  const { slug } = await params;

  return <AuthGuard>
    <BusinessDashboardScreen slug={decodeURIComponent(slug)} />
  </AuthGuard>;
}
