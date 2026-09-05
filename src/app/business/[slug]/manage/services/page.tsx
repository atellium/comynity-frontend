import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageServicesScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Services", robots: { index: false, follow: false } };

export default async function BusinessServicesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageServicesScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}

