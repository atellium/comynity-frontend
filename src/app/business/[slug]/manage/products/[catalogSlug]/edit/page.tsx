import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { CatalogEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/edit">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Edit Product");
}

export default async function EditProductPage({ params }: PageProps<"/business/[slug]/manage/products/[catalogSlug]/edit">) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><CatalogEditorScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
