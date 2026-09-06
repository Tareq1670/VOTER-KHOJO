"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@heroui/react";
import {
  Magnifier,
  ShieldCheck,
  ArrowRightFromSquare,
  ArrowUpRightFromSquare,
  Code,
  Persons,
} from "@gravity-ui/icons";
import { useSession, signOut } from "@/lib/auth-client";
import { CurrentUserProvider, useCurrentUser } from "@/lib/currentUser";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

const DEV_CREDIT = {
  name: "TARIQUL ISLAM TAREQ",
  role: "Full Stack Developer · MERN ও Next.js",
  url: "https://tariqul-islam-tareq.vercel.app",
};

export default function HomeContent() {
  return (
    <CurrentUserProvider>
      <HomeView />
    </CurrentUserProvider>
  );
}

function HomeView() {
  const router = useRouter();
  const { data, isPending, error } = useSession();
  const { me, status: userStatus } = useCurrentUser();

  useEffect(() => {
    if (!isPending && error) {
      toast.error("অনুরোধটি সম্পন্ন করা যায়নি। ব্যাকএন্ড সার্ভার চালু আছে কিনা যাচাই করুন।");
    }
  }, [isPending, error]);

  // Logged-in users are sent straight to their main site (dashboard / admin)
  // instead of the auth landing card. Uses the fresh `/me` role so promoted
  // admins land in the admin area immediately, no re-login required.
  useEffect(() => {
    if (!isPending && data?.user && userStatus !== "loading") {
      const role = userStatus === "ok" && me ? me.role : data.user.role;
      router.replace(role === "admin" ? "/admin" : "/dashboard");
    }
  }, [isPending, data, me, userStatus, router]);

  if (isPending) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <PrinterLoader size={1.35} label="লোড হচ্ছে…" />
      </main>
    );
  }

  const user = data?.user;

  const handleLogout = async () => {
    await signOut();
    toast.success("লগআউট সফল হয়েছে।");
    router.refresh();
  };

  return (
    <main className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            key="authed"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-12"
            exit={{ opacity: 0, y: -8 }}
          >
            <motion.div variants={fadeUp} className="w-full">
              <Card className="surface-card-elevated">
                <CardHeader className="items-center text-center">
                  <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl brand-gradient text-xl font-bold text-white shadow-lg shadow-brand-500/25 ring-4 ring-brand-100">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                      />
                    ) : (
                      user.name ? user.name.charAt(0) : "?"
                    )}
                  </div>
                  <CardTitle className="mt-4 text-2xl text-ink-800">
                    স্বাগতম, {user.name}!
                  </CardTitle>
                  <CardDescription className="truncate text-ink-600">
                    {user.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p className="text-center text-ink-600">
                    আপনি সফলভাবে লগইন করেছেন। নিচের বাটনে ক্লিক করে ড্যাশবোর্ডে যান।
                  </p>
                </CardContent>
                <div className="flex flex-col gap-2 px-6 pb-6">
                  <Link href="/dashboard" className="block">
                    <Button
                      variant="solid"
                      fullWidth
                      className="brand-gradient text-white font-semibold h-11"
                    >
                      ড্যাশবোর্ডে যান
                    </Button>
                  </Link>
                  <Button
                    variant="bordered"
                    fullWidth
                    onPress={handleLogout}
                    className="border-red-200 text-red-600 hover:bg-red-50 h-11"
                  >
                    লগআউট
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <GuestLanding key="guest" />
        )}
      </AnimatePresence>
    </main>
  );
}

function GuestLanding() {
  return (
    <motion.div
      key="guest"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8 }}
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-16"
    >
      {/* ── Soft branded backdrop ─────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-ink-50 to-ink-50" />
      <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-brand-200/50 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-28 left-0 size-96 rounded-full bg-navy-light/20 blur-[110px]" />

      {/* ── Compact auth card ─────────────────────────── */}
      <motion.div variants={fadeUp} className="relative z-10 w-full max-w-md">
        <Card className="surface-card-elevated overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-50">
                <Magnifier className="size-7" />
              </div>

              <p className="mt-4 text-xs font-bold tracking-[0.3em] text-brand-600 uppercase">
                ভোটার খুঁজো
              </p>

              <h1 className="mt-2 text-2xl font-bold text-ink-800 sm:text-[1.7rem]">
                ভোটার তথ্য খুঁজুন{" "}
                <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  সেকেন্ডেই
                </span>
              </h1>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
                আপলোড করা ভোটার তালিকা থেকে নাম, পিতার নাম বা আইডি দিয়ে খুঁজুন —
                নিরাপদ ও নিয়ন্ত্রিত পরিবেশে।
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login" className="block">
                <Button
                  variant="solid"
                  fullWidth
                  className="h-12 rounded-xl text-base font-semibold brand-gradient text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/40"
                  startContent={<ArrowRightFromSquare className="size-5" />}
                >
                  লগইন করুন
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button
                  variant="bordered"
                  fullWidth
                  className="h-12 rounded-xl border-ink-200 text-base font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  startContent={<Persons className="size-5" />}
                >
                  নতুন অ্যাকাউন্ট তৈরি করুন
                </Button>
              </Link>
            </div>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-500">
              <ShieldCheck className="size-4 text-brand-500" />
              এডমিন অনুমোদন নিয়ে নিরাপদে প্রবেশ করুন
            </p>
          </div>
        </Card>
      </motion.div>

      {/* ── Developer credit ──────────────────────────── */}
      <motion.footer
        variants={fadeUp}
        className="relative z-10 mt-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white ring-1 ring-white">
              T
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-xs font-bold text-ink-800">
                <Code className="size-3.5 shrink-0 text-brand-500" />
                {DEV_CREDIT.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-ink-500">
                {DEV_CREDIT.role}
              </p>
            </div>
          </div>

          <Link
            href={DEV_CREDIT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors duration-300 hover:border-brand-300 hover:bg-brand-100"
          >
            পোর্টফোলিও
            <ArrowUpRightFromSquare className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <p className="mt-3 text-center text-[11px] text-ink-400">
          © {new Date().getFullYear()} Voter Khojo — Developed by{" "}
          <a
            href={DEV_CREDIT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-600 transition hover:text-brand-500"
          >
            {DEV_CREDIT.name}
          </a>
        </p>
      </motion.footer>
    </motion.div>
  );
}