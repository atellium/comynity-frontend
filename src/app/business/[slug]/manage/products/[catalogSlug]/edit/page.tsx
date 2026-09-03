import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogEditorScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Edit Product", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/edit">) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogEditorScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
