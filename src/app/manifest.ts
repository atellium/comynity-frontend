import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	const env = process.env.NEXT_PUBLIC_APP_ENV;
	const appName =
		env === "production"
			? "Comynity"
			: env === "staging"
				? "Comynity Staging"
				: "Comynity Dev";

	return {
		name: appName,
		short_name: appName,
		description: "Your Comynity account and local experience.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#FFFFFF",
		theme_color: "#FFFFFF",
		orientation: "portrait-primary",
		categories: ["lifestyle", "social"],
		icons: (["any", "maskable"] as const).flatMap((purpose) =>
			[128, 256, 512, 1024].map((size) => ({
				src: `/app-icons/icon-${size}X${size}.png`,
				sizes: `${size}x${size}`,
				type: "image/png",
				purpose,
			})),
		),
	};
}
