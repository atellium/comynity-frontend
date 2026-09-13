import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/products/add">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Add Product");
}

export default async function AddProductPage({ params }: PageProps<"/business/[slug]/manage/products/add">) {
  const { slug } = await params;
  return <AuthGuard><CatalogEditorScreen businessSlug={decodeURIComponent(slug)} /></AuthGuard>;
}
