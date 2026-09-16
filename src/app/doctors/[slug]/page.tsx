import type { Metadata } from "next";
import { DoctorDetailPage } from "@/features/businesses";

function labelFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

type DoctorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = labelFromSlug(decodeURIComponent(slug).split("-at-")[0] ?? slug);
  return {
    title: name,
    description: `View ${name}'s details, schedule, and clinic on Comynity.`,
  };
}

export default async function Page({ params }: DoctorPageProps) {
  const { slug } = await params;
  return <DoctorDetailPage slug={decodeURIComponent(slug)} />;
}
