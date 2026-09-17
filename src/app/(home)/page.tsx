import type { Metadata } from "next";
import Image from "next/image";
import {
	CategorySlider,
	HomeFooter,
	HomeSearchLink,
	ListBusinessCta,
	MobileHomeHeader,
	NearbyBusinesses,
	NearbyOffers,
} from "@/components/home";
import { getSiteUrl } from "@/lib/site-url";

const title = "Discover Local Businesses & Services Near You | Comynity";

const description =
	"Discover trusted local businesses, services, shops, and professionals near you. Explore popular categories and connect with businesses in your community.";

const appIconUrl = new URL("/app-icons/icon-1024X1024.png", getSiteUrl()).toString();

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
				url: appIconUrl,
				width: 1024,
				height: 1024,
				alt: "Comynity app icon",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: [
			{
				url: appIconUrl,
				width: 1024,
				height: 1024,
				alt: "Comynity app icon",
				type: "image/png",
			},
		],
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
			{/* <section className="mx-auto w-full max-w-3xl px-2.5 pt-3" aria-label="Support">
				<div className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl bg-surface-tertiary shadow-sm dark:bg-surface-dark-tertiary">
					<Image
						src="/images/support.jpg"
						alt="Comynity support"
						fill
						priority
						sizes="(max-width: 768px) calc(100vw - 1.25rem), 748px"
						className="object-cover"
					/>
				</div>
			</section> */}
			<CategorySlider title="Shopping & Retail" categorySlug="shopping-retail" />
			<CategorySlider title="Health & Medical" categorySlug="health-medical" />
			<CategorySlider title="Home Services" categorySlug="home-services" />
			<NearbyOffers />
			<ListBusinessCta />
			<NearbyBusinesses />
			<HomeFooter />
		</div>
	);
}
