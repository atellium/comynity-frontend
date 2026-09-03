import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageProductsScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Products", robots: { index: false, follow: false } };

export default async function BusinessManageProductsPage({ params }: PageProps<"/business/[slug]/manage/products">) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageProductsScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
