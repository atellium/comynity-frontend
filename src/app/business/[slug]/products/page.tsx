import type { Metadata } from "next";
import { BusinessProductsPage } from "@/features/businesses";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ params }: PageProps<"/business/[slug]/products">) {
  const { slug } = await params;
  return <BusinessProductsPage businessSlug={decodeURIComponent(slug)} />;
}
