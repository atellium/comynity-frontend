import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageServicesScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Services");
}

export default async function BusinessServicesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageServicesScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}

