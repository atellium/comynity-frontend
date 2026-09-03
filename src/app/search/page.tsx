import type { Metadata } from "next";
import { SearchPage } from "@/features/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Find local services and businesses by category.",
};

export default function Page() {
  return <SearchPage />;
}
