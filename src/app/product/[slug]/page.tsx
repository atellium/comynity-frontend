import type { Metadata } from "next";
import { ProductDetailPage } from "@/features/businesses";

export const metadata: Metadata = { title: "Product details" };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailPage slug={decodeURIComponent(slug)} />;
}
