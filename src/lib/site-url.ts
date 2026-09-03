export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const value = configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  return new URL(value);
}
