import type { Metadata } from "next";
import { getBusinessNameBySlug } from "@/features/businesses/business.service";

export async function getBusinessManageMetadata(slug: string, section: string): Promise<Metadata> {
  try {
    const business = await getBusinessNameBySlug(slug);
    return {
      title: `${section} | ${business.name}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: section,
      robots: { index: false, follow: false },
    };
  }
}
