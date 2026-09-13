import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

type EditProductPageProps = {
  params: Promise<{ slug: string; catalogSlug: string }>;
};

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Edit Product");
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogEditorScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
