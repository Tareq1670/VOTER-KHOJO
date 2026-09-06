import HomeContent from "./home-content";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, OG_IMAGE, webSiteLd } from "@/lib/seo";

export const metadata = {
  title: {
    absolute: "ভোটার খুঁজো (Voter Khojo) – ভোটার তথ্য খুঁজুন সেকেন্ডেই",
  },
  description:
    "ভোটার খুঁজো (Voter Khojo) – আপলোড করা ভোটার তালিকা থেকে নাম, পিতার নাম বা আইডি দিয়ে সেকেন্ডেই খুঁজে নিন। Search voter lists by name, father's name or ID instantly.",
  keywords: [
    "voter-khojo",
    "voter khojo",
    "ভোটার খুঁজো",
    "ভোটার তথ্য",
    "voter list search",
    "ভোটার তালিকা",
    "voter search",
    "voter id look up",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} – ${SITE_NAME_EN} | ভোটার তথ্য খুঁজুন সেকেন্ডেই`,
    description:
      "ভোটার খুঁজো (Voter Khojo) – আপলোড করা ভোটার তালিকা থেকে নাম, পিতার নাম বা আইডি দিয়ে সেকেন্ডেই খুঁজে নিন। Find voter information in seconds.",
    siteName: `${SITE_NAME} – ${SITE_NAME_EN}`,
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – Voter Khojo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – ${SITE_NAME_EN} | ভোটার তথ্য খুঁজুন সেকেন্ডেই`,
    description:
      "ভোটার খুঁজো (Voter Khojo) – আপলোড করা ভোটার তালিকা থেকে নাম, পিতার নাম বা আইডি দিয়ে সেকেন্ডেই খুঁজে নিন।",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd()) }}
      />
      <HomeContent />
    </>
  );
}