export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const value = configuredUrl
    ?? (vercelUrl ? `https://${vercelUrl}` : undefined)
    ?? (process.env.NODE_ENV === "production" ? "https://comynity.com" : "http://localhost:3000");

  return new URL(value);
}
