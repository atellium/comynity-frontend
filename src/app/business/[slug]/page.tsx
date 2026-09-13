import { redirect } from "next/navigation";

export default async function LegacyBusinessPage({
  params,
}: PageProps<"/business/[slug]">) {
  const { slug } = await params;
  redirect(`/${encodeURIComponent(decodeURIComponent(slug))}`);
}
