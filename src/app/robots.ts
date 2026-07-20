import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://studio.frameandformstudio.com";

/**
 * Only the marketing landing page is meant for search engines. Everything
 * else is the authed app (dashboard route group), auth flows, or APIs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/reset-password",
          "/update-password",
          "/dashboard",
          "/listings",
          "/content",
          "/brand-profile",
          "/payments",
          "/leads",
          "/quick-post",
          "/settings",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
