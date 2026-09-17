import type { Metadata } from "next";
import { DoctorSpecialtiesPage } from "@/features/businesses";

function labelFromSlug(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

type DoctorsPageProps = {
  params: Promise<{ slug: string; locality: string }>;
};

export async function generateMetadata({ params }: DoctorsPageProps): Promise<Metadata> {
  const { locality } = await params;
  return {
    title: `Doctors in ${labelFromSlug(decodeURIComponent(locality))}`,
    description: `Find doctors by specialty on Comynity.`,
  };
}

export default async function Page({ params }: DoctorsPageProps) {
  const { slug, locality } = await params;
  return (
    <DoctorSpecialtiesPage
      city={decodeURIComponent(slug)}
      locality={decodeURIComponent(locality)}
    />
  );
}
