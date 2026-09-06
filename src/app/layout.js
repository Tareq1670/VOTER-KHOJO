import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { MotionConfig } from "framer-motion";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
});

export const metadata = {
  title: "ভোটার খুঁজো",
  description: "তথ্যের মাধ্যমে সহজে খুঁজে নিন প্রয়োজনীয় ভোটার তথ্য",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ink-50">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#1e293b",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px -8px rgba(30, 58, 95, 0.25)",
              padding: "12px 16px",
            },
            success: {
              duration: 4000,
              style: {
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
              },
              iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
            },
            error: {
              duration: 5000,
              style: {
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              },
              iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
            },
          }}
        />
      </body>
    </html>
  );
}
