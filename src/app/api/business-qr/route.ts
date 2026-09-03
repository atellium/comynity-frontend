const QR_PROVIDER = "https://api.qrserver.com/v1/create-qr-code/";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const data = requestUrl.searchParams.get("data")?.trim();
	const requestedSize = Number(requestUrl.searchParams.get("size"));
	const size = Number.isInteger(requestedSize) && requestedSize >= 200 && requestedSize <= 1200
		? requestedSize
		: 600;

	if (!data || data.length > 2048) {
		return Response.json({ detail: "A valid QR value is required." }, { status: 400 });
	}

	try {
		const target = new URL(data);
		if (target.protocol !== "http:" && target.protocol !== "https:") throw new Error("Invalid protocol");
	} catch {
		return Response.json({ detail: "The QR value must be a valid web address." }, { status: 400 });
	}

	const providerUrl = new URL(QR_PROVIDER);
	providerUrl.searchParams.set("size", `${size}x${size}`);
	providerUrl.searchParams.set("margin", "20");
	providerUrl.searchParams.set("ecc", "H");
	providerUrl.searchParams.set("data", data);

	try {
		const response = await fetch(providerUrl, { cache: "no-store" });
		if (!response.ok) throw new Error(`QR provider returned ${response.status}`);
		return new Response(await response.arrayBuffer(), {
			headers: {
				"Content-Type": response.headers.get("content-type") || "image/png",
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch {
		return Response.json({ detail: "Unable to generate the QR code." }, { status: 502 });
	}
}
