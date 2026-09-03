import type { Metadata } from "next";
import { BusinessProductsPage } from "@/features/businesses";

export const metadata: Metadata = { title: "Category products" };

export default async function CategoryProductsPage({ params }: PageProps<"/business/[slug]/products/[category_slug]">) {
  const { slug, category_slug: categorySlug } = await params;
  return <BusinessProductsPage businessSlug={decodeURIComponent(slug)} categorySlug={decodeURIComponent(categorySlug)} />;
}
