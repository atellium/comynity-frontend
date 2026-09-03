import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogGalleryScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Product Images", robots: { index: false, follow: false } };

export default async function ProductImagesPage({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/images">) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogGalleryScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
