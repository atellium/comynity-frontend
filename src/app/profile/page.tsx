import type { Metadata } from "next";
import { AuthGuard } from "@/features/auth";
import { ProfileScreen } from "@/features/profile";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <AuthGuard><ProfileScreen /></AuthGuard>;
}
