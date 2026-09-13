import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessDashboardScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "@/app/business/[slug]/manage/_metadata";

type LegacyBusinessDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LegacyBusinessDashboardPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Business dashboard");
}

export default async function LegacyBusinessDashboardPage({
  params,
}: LegacyBusinessDashboardPageProps) {
  const { slug } = await params;

  return (
    <AuthGuard>
      <BusinessDashboardScreen slug={decodeURIComponent(slug)} />
    </AuthGuard>
  );
}
