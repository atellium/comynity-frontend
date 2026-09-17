import type { Metadata } from "next";
import { NearbyOffersPage } from "@/features/businesses";

function labelFromSlug(slug: string) {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

type OffersPageProps = {
	params: Promise<{ slug: string; locality: string }>;
};

export async function generateMetadata({ params }: OffersPageProps): Promise<Metadata> {
	const { locality } = await params;
	return {
		title: `Offers near ${labelFromSlug(decodeURIComponent(locality))}`,
		description: "Discover nearby offers from local businesses on Comynity.",
	};
}

export default function OffersPage() {
	return <NearbyOffersPage />;
}
