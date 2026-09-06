export const SITE_URL = "https://voter-khojo.vercel.app";
export const SITE_NAME = "ভোটার খুঁজো";
export const SITE_NAME_EN = "Voter Khojo";

export const OG_IMAGE = `${SITE_URL}/og-image.png`;

const TITLE_BN = "ভোটার খুঁজো – ভোটার তথ্য খুঁজুন সেকেন্ডেই";
const TITLE_EN = "Voter Khojo – Find Voter Information Instantly";

const DESC_BN =
  "ভোটার খুঁজো (Voter Khojo) – আপলোড করা ভোটার তালিকা থেকে নাম, পিতা/মাতার নাম বা আইডি দিয়ে সেকেন্ডেই খুঁজে নিন। নিরাপদ ও নিয়ন্ত্রিত পরিবেশে ভোটার তথ্য অনুসন্ধান করুন।";

const DESC_EN =
  "Voter Khojo (ভোটার খুঁজো) – search uploaded voter lists instantly by name, father/mother name or ID in a secure and controlled environment. Find voter information in seconds.";

const KEYWORDS = [
  "voter-khojo",
  "voter khojo",
  "ভোটার খুঁজো",
  "voter search",
  "ভোটার তালিকা",
  "voter list",
  "ভোটার তথ্য",
  "voter information",
  "ভোটার খোঁজা",
  "voter search bangladesh",
  "বাংলাদেশ ভোটার",
  "ভোটার আইডি",
  "voter id search",
];

export const baseMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TITLE_BN} | ${TITLE_EN}`,
    template: `%s | ${SITE_NAME} ${SITE_NAME_EN}`,
  },
  description: `${DESC_BN} ${DESC_EN}`,
  keywords: KEYWORDS,
  applicationName: `${SITE_NAME} (${SITE_NAME_EN})`,
  creator: "Tariqul Islam Tareq",
  publisher: `${SITE_NAME} (${SITE_NAME_EN})`,
  alternates: {
    canonical: SITE_URL,
    languages: {
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    title: `${TITLE_BN} | ${TITLE_EN}`,
    description: `${DESC_BN} ${DESC_EN}`,
    url: SITE_URL,
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
    title: `${TITLE_BN} | ${TITLE_EN}`,
    description: `${DESC_BN} ${DESC_EN}`,
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

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${SITE_NAME} (${SITE_NAME_EN})`,
    alternateName: ["Voter Khojo", "ভোটার খুঁজো", "voter-khojo"],
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: DESC_BN,
    sameAs: [],
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME} (${SITE_NAME_EN})`,
    alternateName: ["Voter Khojo", "ভোটার খুঁজো", "voter-khojo"],
    url: SITE_URL,
    inLanguage: ["bn", "en"],
    description: `${DESC_BN} ${DESC_EN}`,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/dashboard/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
