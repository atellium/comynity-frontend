import type { NextConfig } from "next";

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
      : "";
  } catch {
    return "";
  }
})();

const r2UploadOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_R2_UPLOAD_ORIGIN
      ? new URL(process.env.NEXT_PUBLIC_R2_UPLOAD_ORIGIN).origin
      : "";
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
	"img-src 'self' data: blob: https://media.comynity.com https://pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev https://api.qrserver.com https://images.unsplash.com",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}${r2UploadOrigin ? ` ${r2UploadOrigin}` : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.29.122.149", "10.222.56.149", "10.30.143.149"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.comynity.com",
        pathname: "/media/businesses/thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "media.comynity.com",
        pathname: "/media/businesses/gallery/**",
      },
      {
        protocol: "https",
        hostname: "media.comynity.com",
        pathname: "/media/categories/businesses/**",
      },
      {
        protocol: "https",
        hostname: "media.comynity.com",
        pathname: "/media/categories/catalogs/**",
      },
      {
        protocol: "https",
        hostname: "pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev",
        pathname: "/media/businesses/thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev",
        pathname: "/media/businesses/gallery/**",
      },
      {
        protocol: "https",
        hostname: "pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev",
        pathname: "/media/categories/businesses/**",
      },
      {
        protocol: "https",
        hostname: "pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev",
        pathname: "/media/categories/catalogs/**",
      },
      {
        protocol: "https",
        hostname: "pub-f3d16aa17c8b46af8ec3b0a6a3681646.r2.dev",
        pathname: "/media/catalog/items/**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
	  {
		protocol: "https",
		hostname: "images.unsplash.com",
		pathname: "/photo-1614786269829-d24616faf56d",
	  },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
