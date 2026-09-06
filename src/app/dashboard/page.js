"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@heroui/react";
import { FileText, Magnifier, FileArrowUp, FolderOpen, ArrowRight, CircleInfo } from "@gravity-ui/icons";
import { useCurrentUser, hasPermission } from "@/lib/currentUser";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { RippleLoader } from "@/components/loading-ui/ripple-loader";
import { SERVER_URL } from "@/lib/apiConfig";

const BASE_URL = SERVER_URL;

const STATUS_LABELS = {
  pending: "অপেক্ষমাণ",
  processing: "প্রক্রিয়াধীন",
  completed: "সম্পন্ন",
  failed: "ব্যর্থ",
};

const STATUS_BADGE_CLASS = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  processing: "bg-sky-50 text-sky-700 border border-sky-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

function StatCard({ title, value, icon: Icon, iconBg, loading }) {
  return (
    <Card className="surface-card-elevated h-full">
      <CardContent className="flex h-full items-center justify-center gap-3 p-4 text-center sm:gap-4 sm:p-5 xl:gap-5 xl:p-6">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 xl:size-14 ${iconBg}`}>
          <Icon className="size-5 sm:size-6 xl:size-7" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <RippleLoader color="brand" size={0.28} />
          ) : (
            <p className="truncate text-xl font-bold tabular-nums text-ink-900 sm:text-2xl xl:text-3xl">{value}</p>
          )}
          <p className="truncate text-xs text-ink-600 sm:text-sm">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { me, status } = useCurrentUser();
  const permUser = me;
  const canSearch = status !== "ok" ? true : hasPermission(permUser, "canSearch");
  const canUpload = status !== "ok" ? true : hasPermission(permUser, "canUploadPDF");
  const canViewPdfs = status !== "ok" ? true : hasPermission(permUser, "canViewPDF");
  const noPermissions =
    status === "ok" &&
    !hasPermission(permUser, "canSearch") &&
    !hasPermission(permUser, "canUploadPDF") &&
    !hasPermission(permUser, "canViewPDF");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "ডেটা লোড করা যায়নি।");
        }
        setStats(data.data);
      } catch (err) {
        toast.error(err.message || "ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const actions = [];
  if (canSearch) {
    actions.push({
      href: "/dashboard/search",
      title: "ভোটার খুঁজুন",
      desc: "ভোটার তালিকা থেকে নাম, ঠিকানা বা পরিচয় দিয়ে খুঁজুন",
      icon: Magnifier,
      iconWrap: "brand-gradient text-white shadow-md shadow-brand-500/20",
    });
  }
  if (canUpload) {
    actions.push({
      href: "/dashboard/upload",
      title: "পিডিএফ আপলোড করুন",
      desc: "ভোটার তালিকার PDF ফাইল আপলোড ও প্রক্রিয়া করুন",
      icon: FileArrowUp,
      iconWrap: "bg-green-100 text-green-700",
    });
  }
  if (canViewPdfs) {
    actions.push({
      href: "/dashboard/pdfs",
      title: "পিডিএফ তালিকা",
      desc: "আপলোড করা ফাইল ও প্রক্রিয়াকরণ অবস্থা দেখুন",
      icon: FolderOpen,
      iconWrap: "bg-sky-100 text-sky-700",
    });
  }

  const actionGridClass = `grid gap-3 sm:gap-4 ${
    actions.length === 1
      ? "max-w-lg mx-auto grid-cols-1"
      : actions.length === 2
        ? "grid-cols-2 lg:max-w-4xl lg:mx-auto"
        : "grid-cols-2 xl:grid-cols-3"
  }`;

  return (
    <div className="space-y-5 sm:space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">ড্যাশবোর্ড</h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          পিডিএফ আপলোড ও প্রক্রিয়াকরণের সামগ্রিক পরিসংখ্যান
        </p>
      </motion.div>

      {/* Stats — responsive bento-style row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            title="মোট পিডিএফ"
            value={stats?.stats?.totalPDFs ?? 0}
            icon={FileText}
            iconBg="brand-gradient text-white shadow-md shadow-brand-500/20"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="মোট ভোটার রেকর্ড"
            value={stats?.stats?.totalRecords ?? 0}
            icon={Magnifier}
            iconBg="bg-green-100 text-green-700"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {noPermissions && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="surface-card">
            <CardContent className="flex items-start gap-3 rounded-lg p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <CircleInfo className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  এখনো কোনো অনুমতি দেওয়া হয়নি
                </p>
                <p className="mt-0.5 text-xs text-ink-600">
                  ভোটার খোঁজা, পিডিএফ আপলোড বা পিডিএফ তালিকা দেখার অনুমতি পেলে এখানে সংশ্লিষ্ট
                  মেনু দেখা যাবে। এডমিনের সঙ্গে যোগাযোগ করুন।
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick actions — bento grid with equal-height, evenly spaced cards */}
      {actions.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={actionGridClass}
        >
          {actions.map((a, i) => (
            <motion.div
              key={a.href}
              variants={fadeUp}
              className={`h-full ${
                actions.length > 1 &&
                actions.length % 2 === 1 &&
                i === actions.length - 1
                  ? "col-span-2 xl:col-span-1"
                  : ""
              }`}
            >
              <Link href={a.href} className="group block h-full">
                <Card className="surface-card h-full transition-all duration-300 ease-out hover:border-t-brand-400 hover:shadow-lg hover:shadow-navy/5 hover:-translate-y-1">
                  <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center xl:flex-row xl:items-center xl:justify-center xl:gap-5 xl:px-6">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:size-12 ${a.iconWrap}`}
                    >
                      <a.icon className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-sm font-semibold text-ink-900 sm:text-base">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-600">{a.desc}</p>
                    </div>
                    <ArrowRight className="hidden size-5 shrink-0 text-ink-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-600 xl:block" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recent uploads */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-ink-800 sm:text-base">
              সাম্প্রতিক পিডিএফ আপলোড
            </CardTitle>
            <CardDescription className="text-xs text-ink-600">
              সর্বশেষ আপলোড
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <RippleLoader color="brand" size={0.4} />
              </div>
            ) : stats?.recentUploads?.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-600 sm:text-sm">
                এখনো কোনো পিডিএফ আপলোড হয়নি।
              </p>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2.5"
              >
                {stats?.recentUploads?.map((u) => (
                  <motion.div key={u.id} variants={fadeUp}>
                    <div className="group flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5 transition-colors duration-200 hover:border-brand-200 hover:bg-brand-50/50">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 transition-colors duration-200 group-hover:bg-brand-200">
                        <FileText className="size-4 text-brand-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{u.fileName}</p>
                        <p className="text-xs text-ink-600">{formatDate(u.createdAt)}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${
                          STATUS_BADGE_CLASS[u.status] || ""
                        }`}
                      >
                        {STATUS_LABELS[u.status] || u.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
