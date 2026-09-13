import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { DoctorEditorScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/doctors/add">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Add Doctor");
}

export default async function AddDoctorPage({ params }: PageProps<"/business/[slug]/manage/doctors/add">) {
  const { slug } = await params;
  return <AuthGuard><DoctorEditorScreen businessSlug={decodeURIComponent(slug)} /></AuthGuard>;
}
