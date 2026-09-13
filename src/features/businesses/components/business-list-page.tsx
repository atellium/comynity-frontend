"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { LoaderCircle, Store } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useBusinessList } from "../use-business-list";
import { BusinessCard } from "./business-card";
import { BusinessListHeader } from "./business-list-header";

function labelFromSlug(slug: string) {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function BusinessListPage({
    categorySlug,
    initialVerifiedOnly,
    initialOpenNowOnly,
}: {
    city: string;
    locality: string;
    categorySlug: string;
    initialVerifiedOnly: boolean;
    initialOpenNowOnly: boolean;
}) {
    const { lat, lng } = useAppSelector((state) => state.location);
    const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
    const [openNowOnly, setOpenNowOnly] = useState(initialOpenNowOnly);
    const query = useBusinessList({
        category: categorySlug,
        lat,
        lng,
        isVerified: verifiedOnly,
        openNow: openNowOnly,
    });
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const businesses = useMemo(
        () => query.data?.pages.flatMap((page) => page.results ?? []).filter((business) => business !== null) ?? [],
        [query.data],
    );
    const categoryLabel =
        query.data?.pages[0]?.category?.label || labelFromSlug(categorySlug);
    const showFilters =
        !query.isSuccess || businesses.length > 0 || openNowOnly || verifiedOnly;

    function handleVerifiedChange(value: boolean) {
        setVerifiedOnly(value);
        updateFilterParam("is_verified", value);
    }

    function handleOpenNowChange(value: boolean) {
        setOpenNowOnly(value);
        updateFilterParam("open_now", value);
    }

    function clearFilters() {
        setVerifiedOnly(false);
        setOpenNowOnly(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("is_verified");
        url.searchParams.delete("open_now");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    function updateFilterParam(name: string, value: boolean) {
        const url = new URL(window.location.href);
        if (value) url.searchParams.set(name, "true");
        else url.searchParams.delete(name);
        window.history.replaceState(
            null,
            "",
            `${url.pathname}${url.search}${url.hash}`,
        );
    }

    useEffect(() => {
        const syncFilterFromUrl = () => {
            const searchParams = new URL(window.location.href).searchParams;
            setVerifiedOnly(searchParams.get("is_verified") === "true");
            setOpenNowOnly(searchParams.get("open_now") === "true");
        };
        window.addEventListener("popstate", syncFilterFromUrl);
        return () => window.removeEventListener("popstate", syncFilterFromUrl);
    }, []);

    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage)
                    fetchNextPage();
            },
            { rootMargin: "300px" },
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const errorMessage = axios.isAxiosError(query.error)
        ? (query.error.response?.data?.detail ?? query.error.message)
        : query.error instanceof Error
            ? query.error.message
            : "Unable to load businesses.";

    return (
        <div className="mx-auto w-full max-w-5xl">
            <BusinessListHeader
                categoryLabel={categoryLabel}
                categorySlug={categorySlug}
                verifiedOnly={verifiedOnly}
                openNowOnly={openNowOnly}
                showFilters={showFilters}
                onVerifiedChange={handleVerifiedChange}
                onOpenNowChange={handleOpenNowChange}
            />
            <main className="px-page pb-10 ">
                {query.isPending && <BusinessListSkeleton />}
                {query.isError && (
                    <StateMessage
                        icon="fa-triangle-exclamation"
                        title="Couldn’t load businesses"
                        message={errorMessage}
                        action={() => query.refetch()}
                    />
                )}
                {query.isSuccess && businesses.length === 0 && (
                    openNowOnly || verifiedOnly ? (
                        <FilteredBusinessEmptyState
                            openNowOnly={openNowOnly}
                            verifiedOnly={verifiedOnly}
                            onClearFilters={clearFilters}
                        />
                    ) : (
                        <div className="space-y-5 py-5">
                            <BusinessOnboardingMessage />
                            <BusinessReferralCta />
                        </div>
                    )
                )}
                {businesses.length > 0 && (
                    <div>
                        {businesses.map((business) => (
                            <BusinessCard key={business.id} business={business} />
                        ))}
                    </div>
                )}
                <div
                    ref={loadMoreRef}
                    className="flex h-20 items-center justify-center"
                    aria-live="polite"
                >
                    {query.isFetchingNextPage && (
                        <>
                            <LoaderCircle size={20} className="animate-spin text-brand" />
                            <span className="ml-2 text-sm font-semibold text-foreground-muted">
                                Loading more
                            </span>
                        </>
                    )}
                    {!query.hasNextPage && businesses.length > 0 && (
                        <span className="text-xs font-semibold text-foreground-subtle dark:text-foreground-dark-subtle">
                            You’ve reached the end
                        </span>
                    )}
                </div>
            </main>
        </div>
    );
}

function FilteredBusinessEmptyState({
    openNowOnly,
    verifiedOnly,
    onClearFilters,
}: {
    openNowOnly: boolean;
    verifiedOnly: boolean;
    onClearFilters: () => void;
}) {
    const title = openNowOnly && verifiedOnly
        ? "No verified businesses are open now"
        : openNowOnly
            ? "No businesses are open now"
            : "No verified businesses found";
    const message = openNowOnly
        ? "Businesses in this category may be closed right now. Turn off the Open now filter to see more options."
        : "No businesses in this category currently match the Verified filter.";

    return (
        <StateMessage
            icon="fa-filter-circle-xmark"
            title={title}
            message={message}
            action={onClearFilters}
            actionLabel="Clear filters"
        />
    );
}

function BusinessOnboardingMessage() {
    return (
        <section className="rounded-2xl border border-border-subtle bg-surface p-7 text-center shadow-xs dark:border-border-dark-subtle dark:bg-surface-dark">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-950 dark:text-brand-300">
                <i className="fa-solid fa-store text-xl" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-foreground dark:text-foreground-dark">
                Businesses are coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed font-medium text-foreground-muted dark:text-foreground-dark-muted">
                We’re currently working on onboarding businesses in this area. Please bear with us while we bring more local businesses to Comynity.
            </p>
        </section>
    );
}

function BusinessReferralCta() {
    function shareReferral() {
        const referralMessage = encodeURIComponent(
            `You can add your business to Comynity here: ${process.env.NEXT_PUBLIC_SITE_URL}`,
        );
        window.open(
            `https://wa.me/?text=${referralMessage}`,
            "_blank",
            "noopener,noreferrer",
        );
    }

    return (
        <section className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand dark:bg-brand-900 dark:text-brand-300">
                    <i className="fa-solid fa-handshake text-lg" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-foreground dark:text-foreground-dark">
                        Know a business owner?
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed font-medium text-foreground-secondary dark:text-foreground-dark-secondary">
                        Refer them to Comynity and help us bring more useful businesses to your community.
                    </p>
                </div>
            </div>
            <button
                type="button"
                onClick={shareReferral}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
            >
                <i className="fa-brands fa-whatsapp text-base" aria-hidden="true" />
                Refer a business owner
            </button>
        </section>
    );
}

function BusinessListSkeleton() {
    return (
        <div aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
                <article
                    key={index}
                    className="-mx-page animate-pulse border-b-4 border-background-muted bg-surface px-page py-4 first:border-t-4 first:pt-3 dark:border-background-dark-muted dark:bg-surface-dark"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-30 w-24 shrink-0 rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                        <div className="min-w-0 flex-1 py-0.5">
                            <div className="h-5 w-3/4 rounded bg-background-muted dark:bg-background-dark-muted" />
                            <div className="mt-2 h-3 w-1/2 rounded bg-background-muted dark:bg-background-dark-muted" />
                            <div className="mt-2.5 h-3.5 w-5/6 rounded bg-background-muted dark:bg-background-dark-muted" />
                            <div className="mt-2 h-3 w-2/3 rounded bg-background-muted dark:bg-background-dark-muted" />
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }, (_, actionIndex) => (
                            <div
                                key={actionIndex}
                                className="h-12 rounded-xl bg-surface-tertiary dark:bg-surface-dark-tertiary/50"
                            />
                        ))}
                    </div>
                </article>
            ))}
        </div>
    );
}

function StateMessage({
    icon,
    title,
    message,
    action,
    actionLabel = "Try again",
}: {
    icon: string;
    title: string;
    message: string;
    action?: () => void;
    actionLabel?: string;
}) {
    return (
        <div className="flex flex-col items-center px-5 py-20 text-center">
            <Store
                className="mb-4 text-foreground-subtle"
                size={44}
                aria-hidden="true"
            />
            <i className={`sr-only fa-solid ${icon}`} />
            <h2 className="text-lg font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-foreground-muted dark:text-foreground-dark-muted">
                {message}
            </p>
            {action && (
                <button
                    type="button"
                    onClick={action}
                    className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
