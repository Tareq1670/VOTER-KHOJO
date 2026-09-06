"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Label,
  Input,
} from "@heroui/react";
import {
  Magnifier,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "@gravity-ui/icons";
import { fetchAuditLogs } from "@/services/auditLogService";
import SearchInput from "@/components/ui/SearchInput";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

const ACTION_OPTIONS = [
  { value: "", label: "সব" },
  { value: "USER_REGISTER", label: "নিবন্ধন" },
  { value: "USER_STATUS_UPDATE", label: "অবস্থা পরিবর্তন" },
  { value: "USER_PERMISSIONS_UPDATE", label: "পারমিশন পরিবর্তন" },
  { value: "USER_DELETE", label: "ব্যবহারকারী মুছে ফেলা" },
  { value: "PDF_UPLOAD", label: "পিডিএফ আপলোড" },
  { value: "PDF_DELETE", label: "পিডিএফ মুছে ফেলা" },
  { value: "PDF_REPROCESS", label: "পিডিএফ পুনরায় প্রক্রিয়া" },
];

const ACTION_LABELS = {
  USER_REGISTER: "নিবন্ধন",
  USER_STATUS_UPDATE: "অবস্থা পরিবর্তন",
  USER_PERMISSIONS_UPDATE: "পারমিশন পরিবর্তন",
  USER_DELETE: "ব্যবহারকারী মুছে ফেলা",
  PDF_UPLOAD: "পিডিএফ আপলোড",
  PDF_DELETE: "পিডিএফ মুছে ফেলা",
  PDF_REPROCESS: "পিডিএফ পুনরায় প্রক্রিয়া",
};

const ACTION_BADGE_CLASS = {
  USER_REGISTER: "bg-green-50 text-green-700 border border-green-200",
  USER_STATUS_UPDATE: "bg-amber-50 text-amber-700 border border-amber-200",
  USER_PERMISSIONS_UPDATE: "bg-sky-50 text-sky-700 border border-sky-200",
  USER_DELETE: "bg-red-50 text-red-700 border border-red-200",
  PDF_UPLOAD: "bg-brand-50 text-brand-700 border border-brand-200",
  PDF_DELETE: "bg-red-50 text-red-700 border border-red-200",
  PDF_REPROCESS: "bg-amber-50 text-amber-700 border border-amber-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
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
        মোট {pagination.total} টি — পৃষ্ঠা {pagination.page} /{" "}
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
            <span key={`dots-${i}`} className="px-1 text-xs text-ink-600">
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

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [actionFilter, setActionFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(
    async (page = 1, actionVal, userIdVal) => {
      setLoading(true);
      try {
        const data = await fetchAuditLogs({
          page,
          limit: 20,
          action: actionVal,
          userId: userIdVal,
        });
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch (err) {
        toast.error(err.message || "অডিট লগ লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs(1, actionFilter, userIdFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadLogs(1, actionFilter, userIdFilter);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          অডিট লগ
        </h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          সিস্টেমে সকল গুরুত্বপূর্ণ কার্যক্রমের রেকর্ড
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
          <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-end md:p-4">
          <form onSubmit={handleFilterSubmit} className="min-w-0 flex-1">
            <TextField
              value={userIdFilter}
              onChange={setUserIdFilter}
              name="userId"
              fullWidth
            >
              <Label className="text-xs font-medium sm:text-sm">
                ব্যবহারকারী আইডি
              </Label>
              <SearchInput
                icon={Magnifier}
                placeholder="ব্যবহারকারী আইডি দিয়ে খুঁজুন..."
                className="mt-1 rounded-lg"
              />
            </TextField>
          </form>

          <div className="flex w-full min-w-0 items-end gap-2 md:w-auto">
            <div className="flex min-w-0 flex-1 flex-col gap-1 md:w-52 md:flex-none">
              <Label className="text-xs font-medium sm:text-sm">
                কার্যক্রমের ধরন
              </Label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-400 focus:outline-none md:w-auto"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="solid"
              className="h-10 shrink-0 brand-gradient text-white font-semibold"
              onPress={() => loadLogs(1, actionFilter, userIdFilter)}
            >
              ফিল্টার
            </Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Logs */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <PrinterLoader size={1.1} />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-600">
              <Clock className="size-10" />
              <p className="text-sm">কোনো অডিট লগ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <motion.div
                key={pagination.page}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="divide-y divide-ink-100 md:hidden"
              >
                {logs.map((log) => (
                  <motion.div key={log.id} variants={fadeUp} className="p-3 sm:p-4">
                    <div className="overflow-hidden rounded-xl border border-ink-200 border-l-4 border-l-brand-400 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                          <ArrowRight className="size-4 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_BADGE_CLASS[log.action] || "bg-ink-100 text-ink-600 border border-ink-200"}`}
                          >
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                          {(log.resourceType || log.metadata?.name) && (
                            <p className="mt-1.5 break-words text-xs text-ink-600">
                              {log.resourceType && (
                                <span className="font-medium text-ink-800">
                                  {log.resourceType}
                                </span>
                              )}
                              {log.resourceType && log.metadata?.name && (
                                <span> — </span>
                              )}
                              {log.metadata?.name && (
                                <span>{log.metadata.name}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-ink-100 pt-3">
                        {log.userId && (
                          <span className="min-w-0 break-all font-mono text-[10px] text-ink-600">
                            {log.userId}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-xs text-ink-600">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto nice-scroll md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-ink-600">
                      <th className="px-3 py-3 font-medium">কার্যক্রম</th>
                      <th className="px-3 py-3 font-medium">রিসোর্স</th>
                      <th className="hidden px-3 py-3 font-medium md:table-cell">
                        মেটাডেটা
                      </th>
                      <th className="hidden px-3 py-3 font-medium md:table-cell">
                        ব্যবহারকারী আইডি
                      </th>
                      <th className="px-3 py-3 font-medium">সময়</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    key={pagination.page}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-ink-100"
                  >
                    {logs.map((log) => (
                      <motion.tr key={log.id} variants={fadeUp} className="row-hover transition-colors">
                        <td className="min-w-0 px-3 py-3">
                          <span
                            className={`inline-block whitespace-normal rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_BADGE_CLASS[log.action] || "bg-ink-100 text-ink-600 border border-ink-200"}`}
                          >
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td className="min-w-0 px-3 py-3 text-xs text-ink-600">
                          <span className="block truncate">{log.resourceType || "—"}</span>
                        </td>
                        <td className="hidden min-w-0 px-3 py-3 text-xs text-ink-600 md:table-cell">
                          <span className="block truncate">{log.metadata?.name || "—"}</span>
                        </td>
                        <td className="hidden min-w-0 px-3 py-3 font-mono text-[10px] text-ink-600 md:table-cell">
                          <span className="block truncate">{log.userId || "—"}</span>
                        </td>
                        <td className="min-w-0 px-3 py-3 text-xs text-ink-600">
                          {formatDate(log.createdAt)}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={(p) => loadLogs(p, actionFilter, userIdFilter)}
          />
        </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
