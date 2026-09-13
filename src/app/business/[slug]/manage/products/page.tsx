import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageProductsScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/products">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Products");
}

export default async function BusinessManageProductsPage({ params }: PageProps<"/business/[slug]/manage/products">) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageProductsScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
