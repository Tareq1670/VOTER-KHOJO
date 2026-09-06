import { SITE_URL } from "@/lib/seo";

export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}