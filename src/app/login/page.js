import LoginClient from "./login-client";
import { SITE_URL, SITE_NAME, SITE_NAME_EN } from "@/lib/seo";

export const metadata = {
  title: {
    absolute: `লগইন করুন | ${SITE_NAME} (${SITE_NAME_EN})`,
  },
  description:
    "ভোটার খুঁজো (Voter Khojo) এ লগইন করে ভোটার তালিকা অনুসন্ধান করুন। এডমিন অনুমোদন ব্যতীত লগইন করা যাবে না। Sign in to search voter lists.",
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginPage() {
  return <LoginClient />;
}