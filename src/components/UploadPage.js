"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardContent,
} from "@heroui/react";
import { CloudArrowUpIn, FileText, CircleCheck, CircleXmark, FolderOpen } from "@gravity-ui/icons";
import { uploadPDFs } from "@/services/pdfService";
import { useCurrentUser, hasPermission } from "@/lib/currentUser";
import PermissionDenied from "@/components/ui/PermissionDenied";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

const MAX_FILES = 10;
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function fileSizeLabel(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const { me, status } = useCurrentUser();
  const canUpload = status !== "ok" ? true : hasPermission(me, "canUploadPDF");
  const pdfsHref = me?.role === "admin" ? "/admin/pdfs" : "/dashboard/pdfs";

  const addFiles = useCallback((list) => {
    const incoming = Array.from(list || []);
    const valid = [];
    const skipped = [];

    incoming.forEach((file) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        skipped.push(`${file.name} — PDF নয়`);
        return;
      }
      if (file.size > MAX_SIZE) {
        skipped.push(`${file.name} — ২০ MB এর বেশি`);
        return;
      }
      valid.push(file);
    });

    setError("");
    if (skipped.length > 0) {
      toast.error(skipped.join(", "));
    }
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    }
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    setResults([]);
    try {
      const data = await uploadPDFs(files);
      const mapped = Array.isArray(data) ? data : [];
      setResults(mapped);
      setFiles([]);
      toast.success(`আপলোড সম্পন্ন — ${mapped.length} টি ফাইল।`);
    } catch (err) {
      setError(err.message || "আপলোড সফল হয়নি।");
      toast.error(err.message || "আপলোড সফল হয়নি।");
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <PermissionDenied
        title="পিডিএফ আপলোড"
        description="পিডিএফ আপলোডের অনুমতি নেই। কমপক্ষে 'পিডিএফ আপলোড' পারমিশন প্রয়োজন।"
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">পিডিএফ আপলোড</h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          ভোটার তালিকার PDF ফাইল আপলোড করুন; সিস্টেম স্বয়ংক্রিয়ভাবে রেকর্ড তৈরি করবে
        </p>
      </motion.div>

      {/* Dropzone */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
        <CardContent className="p-4 sm:p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging
                ? "border-brand-400 bg-brand-50"
                : "border-ink-200 bg-ink-50 hover:border-brand-300 hover:bg-brand-50/50"
            }`}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl brand-gradient text-white">
              <CloudArrowUpIn className="size-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink-900">
                PDF ফাইল এখানে টেনে আনুন
              </p>
              <p className="mt-1 text-xs text-ink-600">
                অথবা ক্লিক করে ফাইল নির্বাচন করুন — সর্বোচ্চ {MAX_FILES}টি ফাইল, প্রতিটি {fileSizeLabel(MAX_SIZE)} পর্যন্ত
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Selected files */}
      <AnimatePresence initial={false}>
      {files.length > 0 && (
        <motion.div
          key="selected-files"
          variants={fadeUp}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
        <Card className="surface-card">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-800">
                নির্বাচিত ফাইল ({files.length})
              </p>
              <Button variant="light" size="sm" onPress={() => setFiles([])}>
                সব মুছুন
              </Button>
            </div>
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5"
              >
                <FileText className="size-5 shrink-0 text-brand-700" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
                  <p className="text-xs text-ink-600">{fileSizeLabel(file.size)}</p>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => removeFile(i)}
                  className="text-red-600 hover:bg-red-50"
                  title="মুছুন"
                >
                  <CircleXmark className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        </motion.div>
      )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="solid"
            className="brand-gradient text-white font-semibold h-11 px-6"
            onPress={handleUpload}
            isDisabled={uploading}
          >
            {uploading ? (
              <>
                <PrinterLoader compact size={0.3} />
                আপলোড হচ্ছে...
              </>
            ) : (
              "আপলোড করুন"
            )}
          </Button>
        </div>
      )}

      {/* Upload results */}
      {results.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <p className="text-sm font-semibold text-ink-800">আপলোড ফলাফল</p>
            {results.map((r, i) => (
              <div
                key={`${r.id || i}`}
                className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5"
              >
                {r.status === "duplicate" ? (
                  <CircleXmark className="size-5 shrink-0 text-amber-600" />
                ) : (
                  <CircleCheck className="size-5 shrink-0 text-green-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{r.fileName}</p>
                  <p className="text-xs text-ink-600">{r.message}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    r.status === "duplicate"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-sky-50 text-sky-700"
                  }`}
                >
                  {r.status === "duplicate" ? "ডুপ্লিকেট" : "প্রক্রিয়াধীন"}
                </span>
              </div>
            ))}
            <div className="pt-2">
              <Link
                href={pdfsHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
              >
                <FolderOpen className="size-4" />
                পিডিএফ তালিকা দেখুন
              </Link>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}
    </div>
  );
}
