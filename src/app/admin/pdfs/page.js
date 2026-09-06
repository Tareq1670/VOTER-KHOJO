"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  FolderOpen,
  ArrowRotateRight,
  TrashBin,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileArrowDown,
} from "@gravity-ui/icons";
import {
  fetchPDFs,
  reprocessPDF,
  deletePDF,
  downloadPDF,
} from "@/services/pdfService";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";
import { RippleLoader } from "@/components/loading-ui/ripple-loader";

const STATUS_OPTIONS = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "processing", label: "প্রক্রিয়াধীন" },
  { value: "completed", label: "সম্পন্ন" },
  { value: "failed", label: "ব্যর্থ" },
];

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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fileSizeLabel(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        মোট {pagination.total} টি — পৃষ্ঠা {pagination.page} / {pagination.totalPages}
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

function DeleteModal({ pdf, open, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(pdf.id);
      onClose();
    } catch {
      /* toast in parent */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open && !!pdf} onClose={onClose} panelClassName="sm:max-w-sm">
      <div className="p-6">
        <h3 className="text-lg font-bold text-red-600">পিডিএফ মুছে ফেলুন?</h3>
        <p className="mt-2 text-sm text-ink-600">
          <span className="font-semibold text-ink-800">{pdf?.fileName}</span>{" "}
          এবং এর সাথে সম্পর্কিত ভোটার রেকর্ডগুলো স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি
          পূর্বাবস্থায় ফেরানো যাবে না।
        </p>
      </div>
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
          {deleting ? <RippleLoader size={0.3} /> : "মুছে ফেলুন"}
        </Button>
      </div>
    </Modal>
  );
}

export default function AdminPDFsPage() {
  const [pdfs, setPdfs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [delPdf, setDelPdf] = useState(null);
  const [delOpen, setDelOpen] = useState(false);

  const loadPDFs = useCallback(async (page = 1, searchVal, statusVal) => {
    setLoading(true);
    try {
      const data = await fetchPDFs({
        search: searchVal,
        status: statusVal,
        page,
        limit: 10,
      });
      setPdfs(data.pdfs);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message || "পিডিএফ তালিকা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPDFs(1, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReprocess = async (id) => {
    try {
      await reprocessPDF(id);
      toast.success("PDF পুনরায় প্রক্রিয়া শুরু হয়েছে।");
      setTimeout(() => loadPDFs(pagination.page, search, statusFilter), 1500);
    } catch (err) {
      toast.error(err.message || "পুনরায় প্রক্রিয়া শুরু করা যায়নি।");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePDF(id);
      toast.success("PDF মুছে ফেলা হয়েছে।");
      loadPDFs(pagination.page, search, statusFilter);
    } catch (err) {
      toast.error(err.message || "PDF মুছে ফেলা যায়নি।");
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadPDF(id);
      toast.success("PDF ডাউনলোড শুরু হয়েছে।");
    } catch (err) {
      toast.error(err.message || "PDF ডাউনলোড করা যায়নি।");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPDFs(1, search, statusFilter);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          পিডিএফ পরিচালনা
        </h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          ভোটার খুঁজোতে সব ব্যবহারকারীর আপলোড করা সকল PDF ফাইল এক জায়গায়; পর্যালোচনা, পুনরায় প্রক্রিয়াকরণ, ডাউনলোড বা মুছে ফেলুন
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
                  placeholder="ফাইলের নাম দিয়ে খুঁজুন..."
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
                onPress={() => loadPDFs(1, search, statusFilter)}
              >
                ফিল্টার
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* List */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <PrinterLoader size={1.1} />
            </div>
          ) : pdfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-600">
              <FolderOpen className="size-10" />
              <p className="text-sm">কোনো PDF পাওয়া যায়নি।</p>
              <Link
                href="/dashboard/upload"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                প্রথম PDF আপলোড করুন
              </Link>
            </div>
          ) : (
            <>
              {/* Scrollable cards below md */}
              <motion.div
                key={pagination.page}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="divide-y divide-ink-100 md:hidden"
              >
                {pdfs.map((pdf) => (
                  <motion.div key={pdf.id} variants={fadeUp} className="p-3 sm:p-4">
                    <div className="overflow-hidden rounded-xl border border-ink-200 border-l-4 border-l-brand-400 bg-white p-4">
                      {/* Top row: icon + file name + uploader */}
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                          <FileText className="size-5 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900">
                            {pdf.fileName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-600">
                            {pdf.uploaderName} • {fileSizeLabel(pdf.fileSize)}
                          </p>
                        </div>
                      </div>

                      {/* Meta row: status badges + date */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-ink-100 pt-3">
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLASS[pdf.processingStatus] || ""}`}
                        >
                          {STATUS_LABELS[pdf.processingStatus] || pdf.processingStatus}
                        </span>
                        {pdf.deletedAt && (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-ink-600">
                            অপসারিত
                          </span>
                        )}
                        <span className="ml-auto text-xs text-ink-600">
                          {formatDate(pdf.createdAt)}
                        </span>
                      </div>

                      {/* Records + actions */}
                      <div className="mt-2 flex max-w-full flex-wrap items-center justify-between gap-x-2 gap-y-2">
                        <span className="min-w-0 text-xs font-medium text-ink-600">
                          {pdf.totalRecords ?? 0} টি রেকর্ড
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleDownload(pdf.id)}
                            className="text-brand-700 hover:bg-brand-50"
                            title="ডাউনলোড"
                          >
                            <FileArrowDown className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleReprocess(pdf.id)}
                            className="text-brand-700 hover:bg-brand-50"
                            title="পুনরায় প্রক্রিয়া"
                          >
                            <ArrowRotateRight className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => {
                              setDelPdf(pdf);
                              setDelOpen(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                            title="মুছে ফেলুন"
                          >
                            <TrashBin className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Table */}
              <div className="hidden overflow-x-auto nice-scroll md:block">
                <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[20%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-ink-600">
                      <th className="px-3 py-3 font-medium">ফাইলের নাম</th>
                      <th className="px-3 py-3 font-medium">আপলোডকারী</th>
                      <th className="px-3 py-3 font-medium">আকার</th>
                      <th className="px-3 py-3 font-medium">রেকর্ড</th>
                      <th className="px-3 py-3 font-medium">অবস্থা</th>
                      <th className="px-3 py-3 text-right font-medium">কার্যক্রম</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    key={pagination.page}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-ink-100"
                  >
                    {pdfs.map((pdf) => (
                      <motion.tr key={pdf.id} variants={fadeUp} className="row-hover transition-colors">
                        <td className="min-w-0 px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                              <FileText className="size-4 text-brand-700" />
                            </div>
                            <span className="truncate font-medium text-ink-900">
                              {pdf.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="min-w-0 px-3 py-3 text-xs text-ink-600">
                          {pdf.uploaderName}
                        </td>
                        <td className="px-3 py-3 text-xs text-ink-600">
                          {fileSizeLabel(pdf.fileSize)}
                        </td>
                        <td className="px-3 py-3 text-xs text-ink-600">
                          {pdf.totalRecords ?? 0}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-block whitespace-normal rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLASS[pdf.processingStatus] || ""}`}
                            >
                              {STATUS_LABELS[pdf.processingStatus] || pdf.processingStatus}
                            </span>
                            {pdf.deletedAt && (
                              <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                                অপসারিত
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleDownload(pdf.id)}
                              className="text-brand-700 hover:bg-brand-50"
                              title="ডাউনলোড"
                            >
                              <FileArrowDown className="size-4" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleReprocess(pdf.id)}
                              className="text-brand-700 hover:bg-brand-50"
                              title="পুনরায় প্রক্রিয়া"
                            >
                              <ArrowRotateRight className="size-4" />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => {
                                setDelPdf(pdf);
                                setDelOpen(true);
                              }}
                              className="text-red-600 hover:bg-red-50"
                              title="মুছে ফেলুন"
                            >
                              <TrashBin className="size-4" />
                            </Button>
                          </div>
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
            onPageChange={(p) => loadPDFs(p, search, statusFilter)}
          />
        </CardContent>
        </Card>
      </motion.div>

      <DeleteModal
        pdf={delPdf}
        open={delOpen}
        onClose={() => {
          setDelOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
