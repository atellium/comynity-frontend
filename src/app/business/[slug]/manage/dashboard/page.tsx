import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessDashboardScreen } from "@/features/profile";

export const metadata: Metadata = {
  title: "Business dashboard",
  robots: { index: false, follow: false },
};

export default async function BusinessDashboardPage({
  params,
}: PageProps<"/business/[slug]/manage/dashboard">) {
  const { slug } = await params;

  return <AuthGuard>
    <BusinessDashboardScreen slug={decodeURIComponent(slug)} />
  </AuthGuard>;
}
