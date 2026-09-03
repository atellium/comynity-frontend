import type { Metadata } from "next";
import { BusinessDetailPage } from "@/features/businesses";
import { getBusinessNameBySlug } from "@/features/businesses/business.service";

export async function generateMetadata({
  params,
}: PageProps<"/business/[slug]">): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  try {
    const business = await getBusinessNameBySlug(slug);
    const location = [business.location.locality, business.location.city.name]
      .filter(Boolean)
      .join(", ");
    const title = location ? `${business.name} in ${location}` : business.name;
    const description = business.description?.trim()
      || `Discover ${business.name} in ${location}. View business details, contact information, products, services, and opening hours on Comynity.`;
    const images = business.media.thumbnail
      ? [{ url: business.media.thumbnail, alt: business.name }]
      : [{ url: "/opengraph-image", alt: "Comynity" }];

    return {
      title,
      description,
      alternates: {
        canonical: `/business/${encodeURIComponent(slug)}`,
      },
      openGraph: {
        type: "website",
        siteName: "Comynity",
        title,
        description,
        url: `/business/${encodeURIComponent(slug)}`,
        images,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: "Business details",
      description: "View local business details, contact information, products, services, and opening hours on Comynity.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function BusinessPage({ params }: PageProps<"/business/[slug]">) {
  const { slug } = await params;
  return <BusinessDetailPage slug={decodeURIComponent(slug)} />;
}
