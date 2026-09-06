import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { DoctorEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../../_metadata";

type EditDoctorPageProps = {
  params: Promise<{ slug: string; catalogSlug: string }>;
};

export async function generateMetadata({ params }: EditDoctorPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Edit Doctor");
}

export default async function EditDoctorPage({ params }: EditDoctorPageProps) {
  const { slug, catalogSlug } = await params;
  return <AuthGuard><DoctorEditorScreen businessSlug={decodeURIComponent(slug)} catalogSlug={decodeURIComponent(catalogSlug)} /></AuthGuard>;
}
