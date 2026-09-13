import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogGalleryScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

type ProductImagesPageProps = {
  params: Promise<{ slug: string; catalogSlug: string }>;
};

export async function generateMetadata({ params }: ProductImagesPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Product Images");
}

export default async function ProductImagesPage({ params }: ProductImagesPageProps) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogGalleryScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
