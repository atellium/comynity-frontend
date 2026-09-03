"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getBusinessNameBySlug } from "../business.service";
import { BusinessDetailImage } from "./detail/business-detail-image";
import { BusinessOverview } from "./detail/business-overview";

export function BusinessDetailPage({ slug }: { slug: string }) {
	const query = useQuery({
		queryKey: ["business", "detail", slug],
		queryFn: () => getBusinessNameBySlug(slug),
		enabled: Boolean(slug),
	});

	const message = axios.isAxiosError(query.error)
		? String(query.error.response?.data?.detail ?? query.error.message)
		: query.error instanceof Error ? query.error.message : "Unable to load this business.";

	return <div className="min-h-dvh bg-white">
		<main className="mx-auto w-full max-w-3xl">
			{query.isPending ? <div className="aspect-video w-full animate-pulse bg-slate-50" />
				: query.isError ? <section className="px-page py-10 text-center"><p className="text-sm font-semibold text-danger">{message}</p><button type="button" onClick={() => void query.refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Try again</button></section>
        : <section className="bg-white"><BusinessDetailImage thumbnail={query.data.media.thumbnail} businessName={query.data.name} businessId={query.data.id} /><BusinessOverview business={query.data} slug={slug} /></section>}
		</main>
	</div>;
}
