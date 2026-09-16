import type { Metadata } from "next";
import { ProductListPage } from "@/features/businesses";

export const metadata: Metadata = { title: "Products near you" };

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string; locality: string; categorySlug: string }>;
}) {
  const { slug, locality, categorySlug } = await params;
  return <ProductListPage city={decodeURIComponent(slug)} locality={decodeURIComponent(locality)} categorySlug={decodeURIComponent(categorySlug)} />;
}
