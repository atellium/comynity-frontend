import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { InstallPrompt } from "@/features/pwa";
import { getSiteUrl } from "@/lib/site-url";

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: getSiteUrl(),
	title: {
		default: "Comynity",
		template: "%s | Comynity",
	},
	description: "Your Comynity account and local experience.",
	applicationName: "Comynity",
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		siteName: "Comynity",
		title: "Comynity",
		description: "Discover trusted local businesses and services near you.",
		url: "/",
		images: ["/opengraph-image"],
	},
	twitter: {
		card: "summary_large_image",
		title: "Comynity",
		description: "Discover trusted local businesses and services near you.",
		images: ["/opengraph-image"],
	},
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Comynity",
	},
	icons: {
		icon: [
			{ url: "/app-icons/icon-128X128.png", sizes: "128x128", type: "image/png" },
			{ url: "/app-icons/icon-256X256.png", sizes: "256x256", type: "image/png" },
			{ url: "/app-icons/icon-512X512.png", sizes: "512x512", type: "image/png" },
			{ url: "/app-icons/icon-1024X1024.png", sizes: "1024x1024", type: "image/png" },
		],
		shortcut: {
			url: "/app-icons/icon-128X128.png",
			type: "image/png",
		},
		apple: {
			url: "/app-icons/icon-256X256.png",
			sizes: "256x256",
			type: "image/png",
		},
	},
};

export const viewport: Viewport = {
	colorScheme: "light",
	themeColor: "#FFFFFF",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${plusJakartaSans.variable}`}
			suppressHydrationWarning
		>
			<head>
				{/* Font Awesome is a static, self-hosted stylesheet from public/. */}
				{/* eslint-disable-next-line @next/next/no-css-tags */}
				<link rel="stylesheet" href="/fontawesome/css/all.css" />
			</head>
			<body>
				<Providers>
					<div className="mx-auto min-h-dvh w-full max-w-160 bg-background shadow-sm dark:bg-background-dark">
						<InstallPrompt />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
