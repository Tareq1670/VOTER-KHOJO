"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  TextField,
  Label,
  Input,
  Avatar,
} from "@heroui/react";
import {
  Magnifier,
  CircleCheck,
  CircleXmark,
  CircleInfo,
  Ban,
  TrashBin,
  Gear,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Person,
} from "@gravity-ui/icons";
import { fetchUsers, updateUserStatus, updateUserPermissions, deleteUser, fetchUserUploads, fetchUserActivity, fetchUserSearchStats, fetchUserDetailViewStats } from "@/services/userService";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";
import BarChart from "@/components/ui/BarChart";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";
import { RippleLoader } from "@/components/loading-ui/ripple-loader";

const USER_PERMISSIONS = [
  {
    key: "canSearch",
    label: "ভোটার খোঁজা",
    description: "ভোটার ডেটা খোঁজার অনুমতি",
  },
  {
    key: "canViewPDF",
    label: "পিডিএফ তালিকা দেখা",
    description: "আপলোডকৃত পিডিএফ দেখার অনুমতি",
  },
  {
    key: "canUploadPDF",
    label: "পিডিএফ আপলোড",
    description: "নতুন পিডিএফ আপলোডের অনুমতি",
  },
  {
    key: "canManagePDF",
    label: "পিডিএফ পরিচালনা",
    description: "পিডিএফ পুনরায় প্রক্রিয়া / মুছে ফেলার অনুমতি",
  },
];

const ADMIN_PERMISSIONS = [
  {
    key: "canManageUsers",
    label: "ব্যবহারকারী পরিচালনা",
    description: "ব্যবহারকারী অনুমোদন, পারমিশন ও মুছে ফেলা",
  },
  {
    key: "canViewAuditLogs",
    label: "অডিট লগ দেখা",
    description: "সকল কার্যক্রমের লগ পর্যালোচনা",
  },
];

const PERMISSION_LABELS = Object.fromEntries(
  [...USER_PERMISSIONS, ...ADMIN_PERMISSIONS].map((p) => [p.key, p.label])
);

const STATUS_OPTIONS = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "বাতিল" },
  { value: "suspended", label: "স্থগিত" },
];

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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Shared action buttons for a user row/card ──── */

function UserActions({ user, onStatusChange, onPermOpen, onDeleteOpen, onActivityOpen }) {
  // Admins can never be blocked/deleted — only permission & activity views apply.
  const isAdmin = user.role === "admin";
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {!isAdmin && user.status === "pending" && (
        <>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onStatusChange(user.id, "approved")}
            className="text-green-600 hover:bg-green-50"
            title="অনুমোদন করুন"
          >
            <CircleCheck className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onStatusChange(user.id, "rejected")}
            className="text-red-600 hover:bg-red-50"
            title="বাতিল করুন"
          >
            <CircleXmark className="size-4" />
          </Button>
        </>
      )}

      {!isAdmin && user.status === "approved" && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onStatusChange(user.id, "suspended")}
          className="text-amber-600 hover:bg-amber-50"
          title="স্থগিত করুন"
        >
          <Ban className="size-4" />
        </Button>
      )}

      {!isAdmin && (user.status === "suspended" || user.status === "rejected") && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onStatusChange(user.id, "approved")}
          className="text-green-600 hover:bg-green-50"
          title="পুনরায় অনুমোদন করুন"
        >
          <CircleCheck className="size-4" />
        </Button>
      )}

      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={() => onPermOpen(user)}
            className="text-brand-700 hover:bg-brand-50"
          title="পারমিশন পরিচালনা"
      >
        <Gear className="size-4" />
      </Button>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={() => onActivityOpen(user)}
            className="text-sky-700 hover:bg-sky-50"
          title="কার্যক্রম দেখুন"
      >
        <Clock className="size-4" />
      </Button>

      {!isAdmin && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onDeleteOpen(user)}
          className="text-red-600 hover:bg-red-50"
          title="মুছে ফেলুন"
        >
          <TrashBin className="size-4" />
        </Button>
      )}
    </div>
  );
}

/* ── Mobile user card (< md) ────────────────────── */

function UserCard({
  user,
  onStatusChange,
  onPermOpen,
  onDeleteOpen,
  onActivityOpen,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 border-l-4 border-l-brand-400 bg-white p-4">
      {/* Top row: avatar, name, status */}
      <div className="flex items-start gap-3">
        <Avatar className="size-10 text-sm">
          {user.image ? (
            <Avatar.Image src={user.image} alt={user.name} />
          ) : null}
          <Avatar.Fallback>{user.name?.charAt(0) || "?"}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            {user.name}
          </p>
          <p className="truncate text-xs text-ink-600">
            {user.email}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLASS[user.status] || ""}`}
        >
          {STATUS_LABELS[user.status] || user.status}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-600">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            user.role === "admin"
              ? "bg-brand-100 text-brand-700"
              : "bg-ink-100 text-ink-600"
          }`}
        >
          {user.role === "admin" ? "এডমিন" : "ব্যবহারকারী"}
        </span>
        <span>{formatDate(user.createdAt)}</span>
      </div>

      {/* Permissions */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {user.role === "admin" ? (
          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
            সব পারমিশন
          </span>
        ) : (
          user.permissions?.length > 0 &&
          user.permissions.map((perm) => (
            <span
              key={perm}
              className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600"
            >
              {PERMISSION_LABELS[perm] || perm}
            </span>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex justify-end border-t border-ink-100 pt-3">
        <UserActions
          user={user}
          onStatusChange={onStatusChange}
          onPermOpen={onPermOpen}
          onDeleteOpen={onDeleteOpen}
          onActivityOpen={onActivityOpen}
        />
      </div>
    </div>
  );
}

/* ── Permission Modal ──────────────────────────────── */

function CheckVisual({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-1 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors ${
        checked
          ? "border-brand-500 bg-brand-600"
          : "border-ink-300 bg-white hover:border-brand-400"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 17 18"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-white"
        >
          <polyline points="1 9 7 14 15 4" />
        </svg>
      )}
    </span>
  );
}

function PermissionRow({ perm, checked, onToggle, disabled }) {
  const rowClass = `flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
    disabled
      ? "border-ink-100 bg-ink-50 opacity-70"
      : checked
        ? "border-brand-200 bg-brand-50"
        : "border-ink-100 bg-white hover:border-brand-200 hover:bg-brand-50/40"
  }`;

  return (
    <div
      className={rowClass}
      {...(disabled
        ? {}
        : {
            role: "checkbox",
            "aria-checked": checked,
            tabIndex: 0,
            onClick: () => onToggle(perm.key),
            onKeyDown: (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onToggle(perm.key);
              }
            },
          })}
    >
      {disabled ? (
        <span className="mt-1 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-ink-200 bg-ink-100 text-[10px] font-bold text-ink-400">
          —
        </span>
      ) : (
        <CheckVisual checked={checked} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-800">{perm.label}</span>
          {disabled && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[9px] font-semibold text-ink-600">
              কেবল এডমিন
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-ink-600">{perm.description}</p>
      </div>
      <span className="shrink-0 text-[10px] text-ink-400">{perm.key}</span>
    </div>
  );
}

function PermissionModal({ user, open, onClose, onSave }) {
  const [selected, setSelected] = useState(() =>
    (user?.permissions || []).filter((p) =>
      USER_PERMISSIONS.some((u) => u.key === p)
    )
  );
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";

  const toggle = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, selected);
      onClose();
    } catch {
      /* toast in parent */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="max-w-md border-t-2 border-t-brand-400"
    >
      {user && (
      <Card className="rounded-2xl border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            পারমিশন পরিচালনা
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isAdmin
                  ? "bg-brand-100 text-brand-700"
                  : "bg-ink-100 text-ink-600"
              }`}
            >
              {isAdmin ? "এডমিন" : "ব্যবহারকারী"}
            </span>
          </CardTitle>
          <CardDescription className="truncate">{user.email}</CardDescription>
        </CardHeader>

        {isAdmin ? (
          <CardContent>
            <div className="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-800">
                  এডমিন অ্যাকাউন্ট
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">
                  এডমিনের সব অনুমতি (ভোটার খোঁজা, পিডিএফ, ব্যবহারকারী পরিচালনা,
                  অডিট লগ প্রভৃতি) স্বয়ংক্রিয়ভাবে থাকে। আলাদাভাবে পারমিশন
                  বরাদ্দের প্রয়োজন নেই।
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                সাধারণ অনুমতি
              </p>
              <div className="space-y-2">
                {USER_PERMISSIONS.map((perm) => (
                  <PermissionRow
                    key={perm.key}
                    perm={perm}
                    checked={selected.includes(perm.key)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                কেবল এডমিনের জন্য
              </p>
              <div className="space-y-2">
                {ADMIN_PERMISSIONS.map((perm) => (
                  <PermissionRow key={perm.key} perm={perm} disabled />
                ))}
              </div>
            </div>
          </CardContent>
        )}

        <div className="flex justify-end gap-2 border-t border-ink-100 px-6 py-4">
          {!isAdmin && (
            <Button variant="ghost" onPress={onClose}>
              বাতিল
            </Button>
          )}
          <Button
            variant="solid"
            className="brand-gradient text-white font-semibold"
            onPress={isAdmin ? onClose : handleSave}
            isDisabled={!isAdmin && saving}
          >
            {!isAdmin && saving ? (
              <RippleLoader size={0.3} />
            ) : isAdmin ? (
              "বন্ধ করুন"
            ) : (
              "সংরক্ষণ করুন"
            )}
          </Button>
        </div>
      </Card>
      )}
    </Modal>
  );
}

/* ── Delete Confirmation Modal ──────────────────────── */

function DeleteModal({ user, open, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch {
      /* toast in parent */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-sm">
      {user && (
      <Card className="rounded-2xl border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-red-600 sm:text-lg">
            ব্যবহারকারী মুছে ফেলুন?
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            <span className="font-semibold text-ink-800">
              {user.name}
            </span>{" "}
            ({user.email}) কে স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায়
            ফেরানো যাবে না।
          </CardDescription>
        </CardHeader>
        <div className="flex justify-end gap-2 border-t border-ink-100 px-6 py-4">
          <Button variant="ghost" onPress={onClose}>
            বাতিল
          </Button>
          <Button
            variant="solid"
            className="bg-red-600 text-white hover:bg-red-700"
            onPress={handleDelete}
            isDisabled={deleting}
          >
            {deleting ? (
              <RippleLoader size={0.3} />
            ) : (
              "মুছে ফেলুন"
            )}
          </Button>
        </div>
      </Card>
      )}
    </Modal>
  );
}

/* ── Search Stats view (per-day/week/month/year chart) ── */

function ChartPanel({ title, data }) {
  const total = (data || []).reduce((sum, d) => sum + (d.count || 0), 0);
  const hasAny = total > 0;
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-800 sm:text-sm">{title}</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
          মোট {total} বার
        </span>
      </div>
      {hasAny ? (
        <BarChart data={data} height={140} />
      ) : (
        <p className="py-8 text-center text-xs text-ink-600">
          এই সময়ে কোনো সার্চ হয়নি।
        </p>
      )}
    </div>
  );
}

function SummaryCards({ totals }) {
  const summary = [
    { label: "আজ", value: totals?.today ?? 0 },
    { label: "এই সপ্তাহ", value: totals?.thisWeek ?? 0 },
    { label: "এই মাস", value: totals?.thisMonth ?? 0 },
    { label: "এই বছর", value: totals?.thisYear ?? 0 },
    { label: "মোট", value: totals?.allTime ?? 0 },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {summary.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5 text-center"
        >
          <p className="text-lg font-bold text-brand-700">{s.value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-ink-600">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function ChartSection({ title, totals, daily, weekly, monthly, yearly }) {
  return (
    <div>
      <p className="text-xs font-bold text-ink-700 sm:text-sm">{title}</p>
      <div className="mt-2 space-y-2.5">
        <SummaryCards totals={totals} />
      </div>
      <div className="mt-4 space-y-4">
        <ChartPanel title="গত ৭ দিন" data={daily || []} />
        <ChartPanel title="গত ৮ সপ্তাহ" data={weekly || []} />
        <ChartPanel title="গত ১২ মাস" data={monthly || []} />
        <ChartPanel
          title="বছরভিত্তিক"
          data={yearly || []}
          accentClass="brand-gradient-subtle"
        />
      </div>
    </div>
  );
}

function SearchStatsView({ stats }) {
  return (
    <div className="space-y-6 p-4 sm:p-5">
      <ChartSection
        title="সার্চ"
        totals={stats?.totals}
        daily={stats?.daily}
        weekly={stats?.weekly}
        monthly={stats?.monthly}
        yearly={stats?.yearly}
      />
    </div>
  );
}

function DetailStatsView({ stats }) {
  return (
    <div className="space-y-6 p-4 sm:p-5">
      <ChartSection
        title="বিস্তারিত তথ্য দেখা (বিস্তারিত ক্লিক)"
        totals={stats?.totals}
        daily={stats?.daily}
        weekly={stats?.weekly}
        monthly={stats?.monthly}
        yearly={stats?.yearly}
      />
    </div>
  );
}

/* ── User Activity Modal ──────────────────────────── */

const PDF_STATUS_LABELS = {
  pending: "অপেক্ষমাণ",
  processing: "প্রক্রিয়াধীন",
  completed: "সম্পন্ন",
  failed: "ব্যর্থ",
};

const PDF_STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  processing: "bg-sky-50 text-sky-700 border border-sky-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

const ACTION_LABELS = {
  USER_REGISTER: "নিবন্ধন",
  USER_STATUS_UPDATE: "অবস্থা পরিবর্তন",
  USER_PERMISSIONS_UPDATE: "পারমিশন পরিবর্তন",
  USER_DELETE: "ব্যবহারকারী মুছে ফেলা",
  PDF_UPLOAD: "পিডিএফ আপলোড",
  PDF_DELETE: "পিডিএফ মুছে ফেলা",
  PDF_REPROCESS: "পিডিএফ পুনরায় প্রক্রিয়া",
  PDF_PROCESSED: "পিডিএফ প্রক্রিয়া সম্পন্ন",
  PDF_PROCESS_FAILED: "পিডিএফ প্রক্রিয়া ব্যর্থ",
};

const ACTION_BADGE = {
  USER_REGISTER: "bg-green-50 text-green-700 border border-green-200",
  USER_STATUS_UPDATE: "bg-amber-50 text-amber-700 border border-amber-200",
  USER_PERMISSIONS_UPDATE: "bg-sky-50 text-sky-700 border border-sky-200",
  USER_DELETE: "bg-red-50 text-red-700 border border-red-200",
  PDF_UPLOAD: "bg-brand-50 text-brand-700 border border-brand-200",
  PDF_DELETE: "bg-red-50 text-red-700 border border-red-200",
  PDF_REPROCESS: "bg-amber-50 text-amber-700 border border-amber-200",
  PDF_PROCESSED: "bg-green-50 text-green-700 border border-green-200",
  PDF_PROCESS_FAILED: "bg-red-50 text-red-700 border border-red-200",
};

function UserActivityModal({ user, open, onClose }) {
  const [tab, setTab] = useState("uploads");
  const [uploads, setUploads] = useState([]);
  const [activity, setActivity] = useState([]);
  const [uploadsPagination, setUploadsPagination] = useState(null);
  const [activityPagination, setActivityPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchStats, setSearchStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [detailStats, setDetailStats] = useState(null);
  const [detailStatsLoading, setDetailStatsLoading] = useState(false);

  const loadUploads = useCallback(
    async (page = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await fetchUserUploads(user.id, { page, limit: 5 });
        setUploads(data.uploads);
        setUploadsPagination(data.pagination);
      } catch {
        toast.error("আপলোড তথ্য লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const loadActivity = useCallback(
    async (page = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await fetchUserActivity(user.id, { page, limit: 10 });
        setActivity(data.activity);
        setActivityPagination(data.pagination);
      } catch {
        toast.error("কার্যক্রম লোড করা যায়নি।");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const loadSearchStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const data = await fetchUserSearchStats(user.id);
      setSearchStats(data);
    } catch {
      toast.error("সার্চ পরিসংখ্যান লোড করা যায়নি।");
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  const loadDetailStats = useCallback(async () => {
    if (!user) return;
    setDetailStatsLoading(true);
    try {
      const data = await fetchUserDetailViewStats(user.id);
      setDetailStats(data);
    } catch {
      toast.error("বিস্তারিত পরিসংখ্যান লোড করা যায়নি।");
    } finally {
      setDetailStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUploads(1);
    }
  }, [open, user, loadUploads]);

  const switchTab = (newTab) => {
    setTab(newTab);
    if (newTab === "uploads" && uploads.length === 0) {
      loadUploads(1);
    } else if (newTab === "activity" && activity.length === 0) {
      loadActivity(1);
    } else if (newTab === "stats" && !searchStats) {
      loadSearchStats();
    } else if (newTab === "details" && !detailStats) {
      loadDetailStats();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="max-w-lg border-t-2 border-t-brand-400"
    >
      {user && (
      <Card className="rounded-2xl border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            কার্যক্রম পর্যালোচনা
          </CardTitle>
          <CardDescription className="truncate">
            {user.name} ({user.email})
          </CardDescription>
        </CardHeader>

        {/* Tabs */}
        <div className="flex overflow-x-auto nice-scroll border-b border-ink-100 px-6">
          <button
            onClick={() => switchTab("uploads")}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "uploads"
                ? "border-brand-400 text-brand-700"
                : "border-transparent text-ink-600 hover:text-ink-800"
            }`}
          >
            আপলোড করা ফাইল
          </button>
          <button
            onClick={() => switchTab("activity")}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "activity"
                ? "border-brand-400 text-brand-700"
                : "border-transparent text-ink-600 hover:text-ink-800"
            }`}
          >
            সকল কার্যক্রম
          </button>
          <button
            onClick={() => switchTab("stats")}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "stats"
                ? "border-brand-400 text-brand-700"
                : "border-transparent text-ink-600 hover:text-ink-800"
            }`}
          >
            সার্চ পরিসংখ্যান
          </button>
          <button
            onClick={() => switchTab("details")}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "details"
                ? "border-brand-400 text-brand-700"
                : "border-transparent text-ink-600 hover:text-ink-800"
            }`}
          >
            বিস্তারিত দেখা
          </button>
        </div>

        <CardContent className="max-h-[50vh] overflow-y-auto p-0">
          {tab === "stats" ? (
            statsLoading ? (
              <div className="flex justify-center py-12">
                <RippleLoader color="brand" size={0.55} />
              </div>
            ) : !searchStats ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-ink-600">
                <Magnifier className="size-8 opacity-40" />
                <p className="text-sm">কোনো পরিসংখ্যান নেই।</p>
              </div>
            ) : (
              <SearchStatsView stats={searchStats} />
            )
          ) : tab === "details" ? (
            detailStatsLoading ? (
              <div className="flex justify-center py-12">
                <RippleLoader color="brand" size={0.55} />
              </div>
            ) : !detailStats ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-ink-600">
                <CircleInfo className="size-8 opacity-40" />
                <p className="text-sm">কোনো পরিসংখ্যান নেই।</p>
              </div>
            ) : (
              <DetailStatsView stats={detailStats} />
            )
          ) : loading ? (
            <div className="flex justify-center py-12">
              <RippleLoader color="brand" size={0.55} />
            </div>
          ) : tab === "uploads" ? (
            uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-ink-600">
                <FileText className="size-8" />
                <p className="text-sm">কোনো ফাইল আপলোড করা হয়নি।</p>
              </div>
            ) : (
              (() => {
                const activeUploads = uploads.filter((p) => !p.deletedAt);
                const deletedUploads = uploads.filter((p) => p.deletedAt);
                return (
                  <div className="divide-y divide-ink-100">
                    {activeUploads.length > 0 && (
                      <div className="px-6 pt-3 pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700">
                          সক্রিয় ({activeUploads.length})
                        </p>
                      </div>
                    )}
                    {activeUploads.map((pdf) => (
                      <div key={pdf.id} className="flex items-center gap-3 px-6 py-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                          <FileText className="size-4 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">
                            {pdf.fileName}
                          </p>
                          <p className="text-xs text-ink-600">
                            {formatDate(pdf.createdAt)} • {pdf.totalRecords ?? 0} রেকর্ড
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PDF_STATUS_BADGE[pdf.processingStatus] || ""}`}
                        >
                          {PDF_STATUS_LABELS[pdf.processingStatus] || pdf.processingStatus}
                        </span>
                      </div>
                    ))}
                    {deletedUploads.length > 0 && (
                      <div className="px-6 pt-3 pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                          মুছে ফেলা হয়েছে ({deletedUploads.length})
                        </p>
                      </div>
                    )}
                    {deletedUploads.map((pdf) => (
                      <div key={pdf.id} className="flex items-center gap-3 px-6 py-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                          <TrashBin className="size-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">
                            {pdf.fileName}
                          </p>
                          <p className="text-xs text-ink-600">
                            {formatDate(pdf.createdAt)} • {formatDate(pdf.deletedAt)} মুছে ফেলা
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 border border-red-200">
                          অপসারিত
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()
            )
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-ink-600">
              <Clock className="size-8" />
              <p className="text-sm">কোনো কার্যক্রম নেই।</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <Clock className="size-3.5 text-brand-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {ACTION_LABELS[log.action] || log.action}
                    </p>
                    <p className="text-xs text-ink-600">
                      {log.resourceType || "—"}
                      {log.metadata?.fileName && ` • ${log.metadata.fileName}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-600">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="flex justify-end border-t border-ink-100 px-6 py-4">
          <Button variant="ghost" onPress={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </Card>
      )}
    </Modal>
  );
}

/* ── Pagination ──────────────────────────────────── */

function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  const pages = Array.from(
    { length: pagination.totalPages },
    (_, i) => i + 1
  )
    .filter(
      (p) =>
        p === 1 ||
        p === pagination.totalPages ||
        Math.abs(p - pagination.page) <= 1
    )
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-200 px-4 py-3 sm:flex-row">
      <p className="text-[11px] text-ink-600 sm:text-xs">
        মোট {pagination.total} জন — পৃষ্ঠা {pagination.page} /{" "}
        {pagination.totalPages}
      </p>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-0.5">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          isDisabled={pagination.page <= 1}
          onPress={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="px-1 text-xs text-ink-600"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              isIconOnly
              size="sm"
              variant={p === pagination.page ? "solid" : "light"}
              className={
                p === pagination.page
                  ? "brand-gradient text-white"
                  : "text-ink-600"
              }
              onPress={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          isDisabled={pagination.page >= pagination.totalPages}
          onPress={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [permUser, setPermUser] = useState(null);
  const [permOpen, setPermOpen] = useState(false);

  const [delUser, setDelUser] = useState(null);
  const [delOpen, setDelOpen] = useState(false);

  const [actUser, setActUser] = useState(null);
  const [actOpen, setActOpen] = useState(false);

  const loadUsers = useCallback(async (page = 1, searchVal, statusVal) => {
    setLoading(true);
    try {
      const data = await fetchUsers({
        search: searchVal,
        status: statusVal,
        page,
        limit: 10,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message || "ব্যবহারকারী লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers(1, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      toast.success(
        `ব্যবহারকারীর অবস্থা "${STATUS_LABELS[newStatus]}" এ পরিবর্তন করা হয়েছে।`
      );
      loadUsers(pagination.page, search, statusFilter);
    } catch (err) {
      toast.error(err.message || "অবস্থা পরিবর্তন করা যায়নি।");
    }
  };

  const handlePermissionsSave = async (id, permissions) => {
    await updateUserPermissions(id, permissions);
    toast.success("পারমিশন সফলভাবে আপডেট হয়েছে।");
    loadUsers(pagination.page, search, statusFilter);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে।");
    loadUsers(pagination.page, search, statusFilter);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(1, search, statusFilter);
  };

  const openPermModal = (user) => {
    setPermUser(user);
    setPermOpen(true);
  };
  const openDelModal = (user) => {
    setDelUser(user);
    setDelOpen(true);
  };
  const openActModal = (user) => {
    setActUser(user);
    setActOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          ব্যবহারকারী পরিচালনা
        </h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          নিবন্ধিত ব্যবহারকারীদের তালিকা, অনুমোদন এবং পারমিশন পরিচালনা করুন
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card className="surface-card">
        <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-end md:p-4">
          <form onSubmit={handleSearchSubmit} className="min-w-0 flex-1">
            <TextField value={search} onChange={setSearch} name="search" fullWidth>
              <Label className="text-xs font-medium sm:text-sm">খুঁজুন</Label>
              <SearchInput
                icon={Magnifier}
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                className="mt-1 rounded-lg"
              />
            </TextField>
          </form>

          <div className="flex w-full min-w-0 items-end gap-2 md:w-auto">
            <div className="flex min-w-0 flex-1 flex-col gap-1 md:w-52 md:flex-none">
              <Label className="text-xs font-medium sm:text-sm">অবস্থা</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none md:w-auto"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="solid"
              className="h-10 shrink-0 brand-gradient text-white font-semibold"
              onPress={() => loadUsers(1, search, statusFilter)}
            >
              ফিল্টার
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Users */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card className="surface-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <PrinterLoader size={1.1} />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-600">
              <Person className="size-10" />
              <p className="text-sm">কোনো ব্যবহারকারী পাওয়া যায়নি।</p>
            </div>
          ) : (
            <>
              {/* ── Mobile: card list ────────────────── */}
              <motion.div
                key={pagination.page}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="divide-y divide-ink-100 md:hidden"
              >
                {users.map((user) => (
                  <motion.div key={user.id} variants={fadeUp} className="p-3 sm:p-4">
                    <UserCard
                      user={user}
                      onStatusChange={handleStatusChange}
                      onPermOpen={openPermModal}
                      onDeleteOpen={openDelModal}
                      onActivityOpen={openActModal}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* ── Desktop: table ─────────────────── */}
              <div className="hidden overflow-x-auto nice-scroll md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-ink-600">
                      <th className="px-3 py-3 font-medium">ব্যবহারকারী</th>
                      <th className="px-3 py-3 font-medium">অবস্থা</th>
                      <th className="hidden px-3 py-3 font-medium lg:table-cell">
                        ভূমিকা
                      </th>
                      <th className="hidden px-3 py-3 font-medium xl:table-cell">
                        পারমিশন
                      </th>
                      <th className="hidden px-3 py-3 font-medium xl:table-cell">
                        নিবন্ধনের তারিখ
                      </th>
                      <th className="px-3 py-3 text-right font-medium">
                        কার্যক্রম
                      </th>
                    </tr>
                  </thead>
                  <motion.tbody
                    key={pagination.page}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-ink-100"
                  >
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        variants={fadeUp}
                        className="row-hover transition-colors"
                      >
                        <td className="min-w-0 px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-9 text-xs">
                              {user.image ? (
                                <Avatar.Image src={user.image} alt={user.name} />
                              ) : null}
                              <Avatar.Fallback>
                                {user.name?.charAt(0) || "?"}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0 max-w-[320px]">
                              <p className="truncate font-medium text-ink-900">
                                {user.name}
                              </p>
                              <p className="truncate text-xs text-ink-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="min-w-0 px-3 py-3">
                          <span
                            className={`inline-block whitespace-normal rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${STATUS_BADGE_CLASS[user.status] || ""}`}
                          >
                            {STATUS_LABELS[user.status] || user.status}
                          </span>
                        </td>
                        <td className="hidden min-w-0 px-3 py-3 lg:table-cell">
                          <span
                            className={`inline-block whitespace-normal rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${
                              user.role === "admin"
                                ? "bg-brand-100 text-brand-700"
                                : "bg-ink-100 text-ink-600"
                            }`}
                          >
                            {user.role === "admin" ? "এডমিন" : "ব্যবহারকারী"}
                          </span>
                        </td>
                        <td className="hidden min-w-0 px-3 py-3 xl:table-cell">
                          <div className="flex max-w-full flex-wrap gap-1">
                            {user.role === "admin" ? (
                              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                                সব পারমিশন
                              </span>
                            ) : user.permissions?.length > 0 ? (
                              user.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-600"
                                >
                                  {PERMISSION_LABELS[perm] || perm}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-ink-600">—</span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-3 py-3 text-xs text-ink-600 xl:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <UserActions
                              user={user}
                              onStatusChange={handleStatusChange}
                              onPermOpen={openPermModal}
                              onDeleteOpen={openDelModal}
                              onActivityOpen={openActModal}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </>
          )}

          <Pagination pagination={pagination} onPageChange={(p) => loadUsers(p, search, statusFilter)} />
        </CardContent>
      </Card>
      </motion.div>

      {/* Modals */}
      <PermissionModal
        key={`perm-${permUser?.id || "none"}`}
        user={permUser}
        open={permOpen}
        onClose={() => setPermOpen(false)}
        onSave={handlePermissionsSave}
      />

      <DeleteModal
        user={delUser}
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={handleDelete}
      />

      <UserActivityModal
        key={`act-${actUser?.id || "none"}`}
        user={actUser}
        open={actOpen}
        onClose={() => setActOpen(false)}
      />
    </div>
  );
}
