import type { Metadata } from "next";
import { BusinessListPage } from "@/features/businesses";

function labelFromSlug(slug: string) {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

type BusinessListPageProps = {
    params: Promise<{ slug: string; locality: string; categorySlug: string }>;
    searchParams: Promise<{
        is_verified?: string | string[];
        open_now?: string | string[];
    }>;
};

export async function generateMetadata({
    params,
}: BusinessListPageProps): Promise<Metadata> {
    const { categorySlug, locality } = await params;
    return {
        title: `${labelFromSlug(categorySlug)} in ${labelFromSlug(locality)}`,
        description: `Discover nearby ${labelFromSlug(categorySlug).toLocaleLowerCase()} on Comynity.`,
    };
}

export default async function Page({
    params,
    searchParams,
}: BusinessListPageProps) {
    const [route, query] = await Promise.all([params, searchParams]);
    return (
        <BusinessListPage
            city={route.slug}
            locality={route.locality}
            categorySlug={route.categorySlug}
            initialVerifiedOnly={query.is_verified === "true"}
            initialOpenNowOnly={query.open_now === "true"}
        />
    );
}
