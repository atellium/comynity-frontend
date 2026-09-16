import type { Metadata } from "next";
import { DoctorListPage } from "@/features/businesses";

function labelFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

type DoctorsPageProps = {
  params: Promise<{ slug: string; locality: string; specialtySlug: string }>;
};

export async function generateMetadata({ params }: DoctorsPageProps): Promise<Metadata> {
  const { locality, specialtySlug } = await params;
  const specialty = labelFromSlug(decodeURIComponent(specialtySlug));
  return {
    title: `${specialty} near ${labelFromSlug(decodeURIComponent(locality))}`,
    description: `Find nearby ${specialty.toLocaleLowerCase()} on Comynity.`,
  };
}

export default async function Page({ params }: DoctorsPageProps) {
  const { slug, locality, specialtySlug } = await params;
  return <DoctorListPage city={decodeURIComponent(slug)} locality={decodeURIComponent(locality)} specialtySlug={decodeURIComponent(specialtySlug)} />;
}
