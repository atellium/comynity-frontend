import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogEditorScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Add Product", robots: { index: false, follow: false } };

export default async function AddProductPage({ params }: PageProps<"/business/[slug]/manage/products/add">) {
  const { slug } = await params;
  return <AuthGuard><CatalogEditorScreen businessSlug={decodeURIComponent(slug)} /></AuthGuard>;
}
