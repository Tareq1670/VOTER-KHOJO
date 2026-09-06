"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
} from "@heroui/react";
import {
  Persons,
  Clock,
  FileText,
  Magnifier,
  ArrowRight,
  FolderOpen,
  ShieldCheck,
} from "@gravity-ui/icons";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { RippleLoader } from "@/components/loading-ui/ripple-loader";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

const DASHBOARD_LIST_LIMIT = 5;

const STATUS_LABELS = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
  suspended: "স্থগিত",
};

const STATUS_BADGE_CLASS = {
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200",
  approved:
    "bg-green-50 text-green-700 border border-green-200",
  rejected:
    "bg-red-50 text-red-700 border border-red-200",
  suspended:
    "bg-ink-100 text-ink-600 border border-ink-200",
};

function StatCard({ title, value, icon: Icon, iconBg, loading }) {
  return (
    <Card className="surface-card-elevated">
      <CardContent className="flex items-center justify-center gap-4 p-4 text-center sm:p-5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 ${iconBg}`}
        >
          <Icon className="size-5 sm:size-6" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <RippleLoader color="brand" size={0.28} />
          ) : (
            <p className="text-xl font-bold text-ink-900 sm:text-2xl">
              {value}
            </p>
          )}
          <p className="truncate text-xs text-ink-600 sm:text-sm">
            {title}
          </p>
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          এডমিন ড্যাশবোর্ড
        </h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          সিস্টেমের সামগ্রিক পরিসংখ্যান এবং সাম্প্রতিক কার্যক্রম
        </p>
      </motion.div>

      {/* Stat cards — 1 col mobile, 2 col sm, 4 col lg */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            title="মোট ব্যবহারকারী"
            value={stats?.stats?.totalUsers ?? 0}
            icon={Persons}
            iconBg="brand-gradient text-white"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="অনুমোদন অপেক্ষমাণ"
            value={stats?.stats?.pendingUsers ?? 0}
            icon={Clock}
            iconBg="bg-amber-100 text-amber-700"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            title="মোট পিডিএফ"
            value={stats?.stats?.totalPDFs ?? 0}
            icon={FileText}
            iconBg="bg-sky-100 text-sky-700"
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

      {/* Quick actions */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      >
        <motion.div variants={fadeUp}>
          <Link href="/admin/users" className="block">
            <Card className="surface-card hover:border-t-brand-400 transition-all">
              <CardContent className="flex items-center justify-center gap-4 p-5 text-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                  <Persons className="size-6" />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-base font-semibold text-ink-900">
                    ব্যবহারকারী পরিচালনা
                  </p>
                  <p className="text-xs text-ink-600">
                    অনুমোদন, পারমিশন ও ব্যবহারকারী তথ্য পরিচালনা করুন
                  </p>
                </div>
                <ArrowRight className="size-5 text-ink-400" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link href="/admin/pdfs" className="block">
            <Card className="surface-card hover:border-t-brand-400 transition-all">
              <CardContent className="flex items-center justify-center gap-4 p-5 text-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <FolderOpen className="size-6" />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-base font-semibold text-ink-900">
                    পিডিএফ পরিচালনা
                  </p>
                  <p className="text-xs text-ink-600">
                    সকল আপলোড করা PDF পর্যালোচনা ও পুনরায় প্রক্রিয়া করুন
                  </p>
                </div>
                <ArrowRight className="size-5 text-ink-400" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link href="/admin/audit-logs" className="block">
            <Card className="surface-card hover:border-t-brand-400 transition-all">
              <CardContent className="flex items-center justify-center gap-4 p-5 text-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl brand-gradient text-white">
                  <ShieldCheck className="size-6" />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-base font-semibold text-ink-900">
                    অডিট লগ
                  </p>
                  <p className="text-xs text-ink-600">
                    সিস্টেমের সকল কার্যক্রমের রেকর্ড দেখুন
                  </p>
                </div>
                <ArrowRight className="size-5 text-ink-400" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link href="/admin/search" className="block">
            <Card className="surface-card hover:border-t-brand-400 transition-all">
              <CardContent className="flex items-center justify-center gap-4 p-5 text-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Magnifier className="size-6" />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-base font-semibold text-ink-900">
                    ভোটার খুঁজুন
                  </p>
                  <p className="text-xs text-ink-600">
                    ভোটার তালিকা থেকে তথ্য খুঁজে বের করুন
                  </p>
                </div>
                <ArrowRight className="size-5 text-ink-400" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom panels — stack mobile, side-by-side lg */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="surface-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold text-ink-800 sm:text-base">
                  সাম্প্রতিক নিবন্ধন
                </CardTitle>
                <CardDescription className="text-xs text-ink-600">
                  সাম্প্রতিক নিবন্ধিত
                </CardDescription>
              </div>
              <Link
                href="/admin/users"
                className="shrink-0 text-xs font-medium text-brand-700 hover:underline sm:text-sm"
              >
                সব দেখুন
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RippleLoader color="brand" size={0.4} />
                </div>
              ) : stats?.recentRegistrations?.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-600 sm:text-sm">
                  এখনো কেউ নিবন্ধন করেনি।
                </p>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2.5"
                >
                  {stats?.recentRegistrations?.slice(0, DASHBOARD_LIST_LIMIT).map((u) => (
                    <motion.div key={u.id} variants={fadeUp}>
                      <div className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5">
                        <Avatar className="size-8 text-xs">
                          {u.image ? (
                            <Avatar.Image src={u.image} alt={u.name} />
                          ) : null}
                          <Avatar.Fallback>
                            {u.name?.charAt(0) || "?"}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">
                            {u.name}
                          </p>
                          <p className="truncate text-xs text-ink-600">
                            {u.email}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${STATUS_BADGE_CLASS[u.status] || STATUS_BADGE_CLASS.pending}`}
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

        {/* Recent Activity */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="surface-card">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold text-ink-800 sm:text-base">
                  সাম্প্রতিক কার্যক্রম
                </CardTitle>
                <CardDescription className="text-xs text-ink-600">
                  সর্বশেষ কার্যক্রম
                </CardDescription>
              </div>
              <Link
                href="/admin/audit-logs"
                className="shrink-0 text-xs font-medium text-brand-700 hover:underline sm:text-sm"
              >
                সব দেখুন
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RippleLoader color="brand" size={0.4} />
                </div>
              ) : stats?.recentActivity?.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-600 sm:text-sm">
                  কোনো কার্যক্রম নেই।
                </p>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2.5"
                >
                  {stats?.recentActivity?.slice(0, DASHBOARD_LIST_LIMIT).map((a) => (
                    <motion.div key={a.id} variants={fadeUp}>
                      <div className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                          <ArrowRight className="size-3.5 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-900">
                            {a.action}
                          </p>
                          <p className="text-xs text-ink-600">
                            {formatDate(a.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
