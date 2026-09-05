export function toPathSegment(value: string) {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function businessListingPath({
	city,
	locality,
	categorySlug,
}: {
	city: string;
	locality: string;
	categorySlug: string;
}) {
	return `/${toPathSegment(city)}/${toPathSegment(locality)}/${encodeURIComponent(categorySlug)}`;
}
