import RegisterClient from "./register-client";
import { SITE_URL, SITE_NAME, SITE_NAME_EN } from "@/lib/seo";

export const metadata = {
  title: {
    absolute: `নতুন অ্যাকাউন্ট তৈরি করুন | ${SITE_NAME} (${SITE_NAME_EN})`,
  },
  description:
    "ভোটার খুঁজো (Voter Khojo) তে নতুন অ্যাকাউন্ট তৈরি করুন। নিবন্ধনের পর এডমিন অনুমোদন পর্যন্ত অপেক্ষা করতে হবে। Create an account to search voter lists.",
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}