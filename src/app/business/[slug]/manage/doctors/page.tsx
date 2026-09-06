import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { BusinessManageDoctorsScreen } from "@/features/profile";
import { getBusinessManageMetadata } from "../_metadata";

export async function generateMetadata({ params }: PageProps<"/business/[slug]/manage/doctors">): Promise<Metadata> {
  const { slug } = await params;
  return getBusinessManageMetadata(decodeURIComponent(slug), "Doctors");
}

export default async function BusinessManageDoctorsPage({ params }: PageProps<"/business/[slug]/manage/doctors">) {
  const { slug } = await params;
  return <AuthGuard><BusinessManageDoctorsScreen slug={decodeURIComponent(slug)} /></AuthGuard>;
}
