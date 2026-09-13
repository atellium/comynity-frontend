import { redirect } from "next/navigation";
import { businessListingPath } from "@/lib/business-listing-url";

type LegacyBusinessListingPageProps = {
	params: Promise<{ slug: string; locality: string; categorySlug: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryString(searchParams: Record<string, string | string[] | undefined>) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams)) {
		if (Array.isArray(value)) {
			value.forEach((item) => params.append(key, item));
			continue;
		}
		if (value !== undefined) params.set(key, value);
	}
	return params.size ? `?${params.toString()}` : "";
}

export default async function Page({
	params,
	searchParams,
}: LegacyBusinessListingPageProps) {
	const [{ slug: city, locality, categorySlug }, query] = await Promise.all([
		params,
		searchParams,
	]);

	redirect(
		`${businessListingPath({
			city: decodeURIComponent(city),
			locality: decodeURIComponent(locality),
			categorySlug: decodeURIComponent(categorySlug),
		})}${queryString(query)}`,
	);
}
