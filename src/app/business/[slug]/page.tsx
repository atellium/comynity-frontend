import type { Metadata } from "next";
import { BusinessDetailPage } from "@/features/businesses";
import { getBusinessNameBySlug } from "@/features/businesses/business.service";
import { getSiteUrl } from "@/lib/site-url";

const appIconImage = {
  url: "/app-icons/icon-1024X1024.png",
  width: 1024,
  height: 1024,
  alt: "Comynity app icon",
  type: "image/png",
};

function getAbsoluteImageUrl(source: string) {
  return new URL(source, getSiteUrl()).toString();
}

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
      ? [{ url: getAbsoluteImageUrl(business.media.thumbnail), alt: business.name }]
      : [appIconImage];

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
