import type { Metadata } from "next";
import {
	HomeFooter,
	HomeSearchLink,
	HomeBannerSlider,
	ListBusinessCta,
	MobileHomeHeader,
	NearbyBusinesses,
	NearbyOffers,
	PopularCategoriesGrid,
} from "@/components/home";
import { getSiteUrl } from "@/lib/site-url";

const title = "Discover Local Businesses & Services Near You | Comynity";

const description =
	"Discover trusted local businesses, services, shops, and professionals near you. Explore popular categories and connect with businesses in your community.";

export const metadata: Metadata = {
	title: { absolute: title },
	description,
	keywords: [
		"local businesses",
		"businesses near me",
		"local services",
		"shops near me",
		"service providers near me",
		"business directory",
		"Comynity",
	],
	applicationName: "Comynity",
	category: "Local business directory",
	creator: "Comynity",
	publisher: "Comynity",
	alternates: { canonical: "/" },
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	openGraph: {
		title,
		description,
		type: "website",
		siteName: "Comynity",
		url: "/",
		locale: "en_IN",
		images: [
			{
				url: "/opengraph-image",
				width: 1200,
				height: 630,
				alt: "Comynity local business discovery platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["/opengraph-image"],
	},
};

export default function Home() {
	const siteUrl = getSiteUrl();
	const structuredData = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${siteUrl}#website`,
				url: siteUrl.toString(),
				name: "Comynity",
				description,
				inLanguage: "en-IN",
				publisher: { "@id": `${siteUrl}#organization` },
			},
			{
				"@type": "Organization",
				"@id": `${siteUrl}#organization`,
				name: "Comynity",
				url: siteUrl.toString(),
				logo: new URL("/app-icons/icon-512X512.png", siteUrl).toString(),
				description,
			},
		],
	};


	
	return (
		<div className="min-h-dvh bg-white dark:bg-background-dark">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
				}}
			/>
			<h1 className="sr-only">
				Discover trusted local businesses and services near you
			</h1>
			<MobileHomeHeader />
			<HomeSearchLink />
			<HomeBannerSlider />
			<PopularCategoriesGrid />
			<NearbyOffers />
			<ListBusinessCta />
			<NearbyBusinesses />
			<HomeFooter />
		</div>
	);
}
