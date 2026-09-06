import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogGalleryScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/images">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Product Images");
}

export default async function ProductImagesPage({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/images">) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogGalleryScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
