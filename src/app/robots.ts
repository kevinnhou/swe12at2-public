import { MetadataRoute } from "next";

import { site } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site.links.url}/sitemap.xml`,
  };
}
