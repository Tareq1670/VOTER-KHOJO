"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  Person,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Xmark,
  CircleInfo,
} from "@gravity-ui/icons";
import {
  searchVoters,
  advancedSearchVoters,
  getVoterDetails,
} from "@/services/searchService";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useCurrentUser, hasPermission } from "@/lib/currentUser";
import PermissionDenied from "@/components/ui/PermissionDenied";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

const LIMIT = 20;
const DEBOUNCE_MS = 350;

const ADVANCED_FIELDS = [
  { key: "name", label: "নাম" },
  { key: "fatherName", label: "পিতার নাম" },
  { key: "motherName", label: "মাতার নাম" },
  { key: "spouseName", label: "স্বামী/স্ত্রী" },
  { key: "voterIdentifier", label: "ভোটার আইডি" },
  { key: "boothNumber", label: "বুথ/এলাকা নং" },
  { key: "dateOfBirth", label: "জন্ম তারিখ (DDMMYYYY)" },
  { key: "village", label: "গ্রাম" },
  { key: "ward", label: "ওয়ার্ড" },
  { key: "union", label: "ইউনিয়ন" },
];

function parsePage(value) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
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

function VoterDetailModal({ voter, open, onClose }) {
  const fields = [
    { label: "নাম", value: voter?.name },
    { label: "পিতার নাম", value: voter?.fatherName },
    { label: "মাতার নাম", value: voter?.motherName },
    { label: "স্বামী/স্ত্রী", value: voter?.spouseName },
    { label: "ভোটার আইডি", value: voter?.voterIdentifier },
    { label: "জন্ম তারিখ", value: voter?.dateOfBirth },
    { label: "পেশা", value: voter?.occupation },
    { label: "সিরিয়াল নম্বর", value: voter?.serialNumber },
    { label: "ঠিকানা", value: voter?.address },
    { label: "বুথ/এলাকা নং", value: voter?.boothNumber },
    { label: "গ্রাম", value: voter?.village },
    { label: "ওয়ার্ড", value: voter?.ward },
    { label: "ইউনিয়ন", value: voter?.union },
    { label: "উপজেলা", value: voter?.upazila },
    { label: "জেলা", value: voter?.district },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="max-w-lg border-t-2 border-t-brand-400"
    >
      {voter && (
      <>
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="text-base font-bold text-ink-900 sm:text-lg">
            ভোটার তথ্য
          </h3>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onClose}
            className="text-ink-600"
          >
            <Xmark className="size-4" />
          </Button>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-3">
            {fields.map((field) =>
              field.value ? (
                <div
                  key={field.label}
                  className="flex flex-col gap-0.5 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="shrink-0 text-xs font-medium text-ink-600 sm:w-28">
                    {field.label}
                  </span>
                  <span className="text-sm font-medium text-ink-900">
                    {field.value}
                  </span>
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="flex justify-end border-t border-ink-100 px-6 py-4">
          <Button variant="ghost" onPress={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </>
      )}
    </Modal>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(() =>
    Object.fromEntries(ADVANCED_FIELDS.map((f) => [f.key, ""]))
  );
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [detailVoter, setDetailVoter] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debounceTimerRef = useRef(null);
  const searchSeqRef = useRef(0);
  const didHydrateRef = useRef(false);

  const { me, status } = useCurrentUser();
  const canSearch = status !== "ok" ? true : hasPermission(me, "canSearch");

  /* Sync the current state into the URL query string. */
  const syncURL = useCallback(
    (params) => {
      const qs = params.toString();
      const next = qs ? `${pathname}?${qs}` : pathname;
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== next) {
        router.replace(next, { scroll: false });
      }
    },
    [pathname, router]
  );

  /* Build the query string for a (possibly overridden) search state. */
  const commitParams = useCallback(
    (opts = {}) => {
      const params = new URLSearchParams();
      const q = (opts.query ?? query).trim();
      const mode = opts.advancedMode ?? advancedMode;
      const filters = opts.advancedFilters ?? advancedFilters;
      const p = opts.page ?? page;
      if (q) params.set("q", q);
      if (mode) params.set("mode", "advanced");
      for (const field of ADVANCED_FIELDS) {
        const val = String(filters[field.key] || "").trim();
        if (val) params.set(field.key, val);
      }
      if (p > 1) params.set("page", String(p));
      syncURL(params);
    },
    [query, advancedMode, advancedFilters, page, syncURL]
  );

  /* Fire a search request; stale responses are ignored by sequence number. */
  const performSearch = useCallback(async ({ q, mode, filters, page: p }) => {
    const seq = ++searchSeqRef.current;
    setLoading(true);
    setSearched(true);
    try {
      const data = mode
        ? await advancedSearchVoters({ ...filters, page: p, limit: LIMIT })
        : await searchVoters({ q, page: p, limit: LIMIT });
      if (seq !== searchSeqRef.current) return;
      setResults(data.results);
      setPagination(data.pagination);
    } catch (err) {
      if (seq !== searchSeqRef.current) return;
      toast.error(err.message || "সার্চ করতে সমস্যা হয়েছে।");
      setResults([]);
      setPagination(null);
    } finally {
      if (seq === searchSeqRef.current) setLoading(false);
    }
  }, []);

  /* Run a search immediately with (optionally) overridden values. */
  const runSearch = useCallback(
    (opts = {}) => {
      const q = (opts.query ?? query).trim();
      const mode = opts.advancedMode ?? advancedMode;
      const filters = opts.advancedFilters ?? advancedFilters;
      const p = opts.page ?? page;
      clearTimeout(debounceTimerRef.current);
      commitParams({ query: q, advancedMode: mode, advancedFilters: filters, page: p });
      performSearch({ q, mode, filters, page: p });
    },
    [query, advancedMode, advancedFilters, page, commitParams, performSearch]
  );

  /* Debounce the live search while the user is typing. */
  const scheduleSearch = useCallback(
    (opts = {}) => {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => runSearch(opts), DEBOUNCE_MS);
    },
    [runSearch]
  );

  /* On mount, restore the search UI from the URL query params. */
  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const mode = params.get("mode") === "advanced";
    const filters = Object.fromEntries(
      ADVANCED_FIELDS.map((f) => [f.key, params.get(f.key) || ""])
    );
    const p = parsePage(params.get("page"));
    setQuery(q);
    setAdvancedMode(mode);
    setAdvancedFilters(filters);
    setPage(p);
    runSearch({ query: q, advancedMode: mode, advancedFilters: filters, page: p });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(1);
    scheduleSearch({ query: value, page: 1 });
  };

  const handleAdvancedFieldChange = (key, value) => {
    const next = { ...advancedFilters, [key]: value };
    setAdvancedFilters(next);
    setPage(1);
    scheduleSearch({ advancedFilters: next, page: 1 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    runSearch({ page: 1 });
  };

  const handlePageChange = (p) => {
    setPage(p);
    runSearch({ page: p });
  };

  const toggleAdvanced = () => {
    if (advancedMode) {
      const cleared = Object.fromEntries(ADVANCED_FIELDS.map((f) => [f.key, ""]));
      setAdvancedFilters(cleared);
      setAdvancedMode(false);
      setPage(1);
      runSearch({ advancedFilters: cleared, advancedMode: false, page: 1 });
    } else {
      setAdvancedMode(true);
      setPage(1);
      runSearch({ advancedMode: true, page: 1 });
    }
  };

  const clearAdvancedFilters = () => {
    const cleared = Object.fromEntries(ADVANCED_FIELDS.map((f) => [f.key, ""]));
    setAdvancedFilters(cleared);
    setPage(1);
    runSearch({ advancedFilters: cleared, page: 1 });
  };

  const openDetail = async (voter) => {
    setDetailVoter(voter);
    setDetailOpen(true);
    try {
      const detail = await getVoterDetails(voter._id);
      setDetailVoter(detail || voter);
    } catch {
      // আপলোড ব্যর্থ হলেও আগের তথ্যই দেখানো হবে।
    }
  };

  if (!canSearch) {
    return (
      <PermissionDenied
        title="ভোটার খুঁজুন"
        description="ভোটার খোঁজার অনুমতি নেই। কমপক্ষে 'ভোটার খোঁজা' পারমিশন প্রয়োজন।"
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          ভোটার খুঁজুন
        </h1>
        <p className="mt-1 text-xs text-ink-600 sm:text-sm">
          ভোটার তথ্য খুঁজে বের করুন — নাম, আইডি, ঠিকানা অনুযায়ী
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="surface-card">
          <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic search */}
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <TextField
                  value={query}
                  onChange={handleQueryChange}
                  name="query"
                  fullWidth
                >
                  <Label className="text-xs font-medium sm:text-sm">
                    সার্চ করুন
                  </Label>
                  <SearchInput
                    icon={Magnifier}
                    placeholder="নাম, পিতার নাম, ভোটার আইডি লিখুন..."
                    className="mt-1 rounded-lg"
                    isDisabled={advancedMode}
                  />
                </TextField>
              </div>
              <Button
                variant="solid"
                className="h-10 shrink-0 brand-gradient text-white font-semibold"
                type="submit"
                isDisabled={advancedMode}
              >
                খুঁজুন
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant={advancedMode ? "solid" : "light"}
                className={
                  advancedMode
                    ? "h-10 w-10 shrink-0 brand-gradient text-white"
                    : "h-10 w-10 shrink-0 text-ink-600"
                }
                onPress={toggleAdvanced}
                title="উন্নত সার্চ"
              >
                <Sliders className="size-4" />
              </Button>
            </div>

            {/* Advanced filters */}
            {advancedMode && (
              <div className="space-y-3 rounded-lg border border-ink-200 bg-ink-50 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-800 sm:text-sm">
                    উন্নত সার্চ ফিল্টার
                  </p>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={clearAdvancedFilters}
                    className="text-ink-600"
                    title="ফিল্টার মুছুন"
                  >
                    <Xmark className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ADVANCED_FIELDS.map((field) => (
                    <TextField
                      key={field.key}
                      value={advancedFilters[field.key]}
                      onChange={(val) => handleAdvancedFieldChange(field.key, val)}
                      name={field.key}
                      fullWidth
                    >
                      <Label className="text-[11px] font-medium text-ink-600 sm:text-xs">
                        {field.label}
                      </Label>
                      <Input
                        placeholder={field.label}
                        className="mt-0.5 rounded-lg"
                      />
                    </TextField>
                  ))}
                </div>
                <Button
                  variant="solid"
                  className="w-full brand-gradient text-white font-semibold sm:w-auto"
                  type="submit"
                >
                  <Magnifier className="size-4" />
                  উন্নত সার্চ করুন
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      </motion.div>

      {/* Results */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card className="surface-card">
        <CardContent className="p-0">
          {!searched ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-600">
              <Magnifier className="size-12 opacity-40" />
              <p className="text-sm">
                ভোটার খুঁজে পেতে উপরে কিছু লিখুন
              </p>
              <p className="text-xs text-ink-600">
                নাম, পিতার নাম, ভোটার আইডি, ঠিকানা ইত্যাদি দিয়ে খুঁজুন
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16">
              <PrinterLoader size={1.1} />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-600">
              <Person className="size-10" />
              <p className="text-sm">কোনো ভোটার পাওয়া যায়নি।</p>
              <p className="text-xs text-ink-600">
                অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <motion.div
                key={pagination?.page || 1}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="divide-y divide-ink-100 md:hidden"
              >
                {results.map((voter) => (
                  <motion.div key={voter._id} variants={fadeUp} className="p-3">
                    <div className="overflow-hidden rounded-xl border border-ink-200 border-l-4 border-l-brand-400 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                          <Person className="size-5 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {voter.name || "—"}
                          </p>
                          <p className="truncate text-xs text-ink-600">
                            পিতা: {voter.fatherName || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {voter.voterIdentifier && (
                          <p className="text-xs text-ink-600">
                            <span className="font-medium text-ink-800">
                              ভোটার আইডি:
                            </span>{" "}
                            {voter.voterIdentifier}
                          </p>
                        )}
                        {voter.boothNumber && (
                          <p className="text-xs text-ink-600">
                            <span className="font-medium text-ink-800">
                              বুথ/এলাকা নং:
                            </span>{" "}
                            {voter.boothNumber}
                          </p>
                        )}
                        {voter.dateOfBirth && (
                          <p className="text-xs text-ink-600">
                            <span className="font-medium text-ink-800">
                              জন্ম তারিখ:
                            </span>{" "}
                            {voter.dateOfBirth}
                          </p>
                        )}
                        {voter.address && (
                          <p className="break-words text-xs text-ink-600">
                            <span className="font-medium text-ink-800">
                              ঠিকানা:
                            </span>{" "}
                            {voter.address}
                          </p>
                        )}
                        <p className="text-xs text-ink-600">
                          {[voter.union, voter.upazila, voter.district]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                      <div className="mt-3 flex justify-end border-t border-ink-100 pt-3">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => openDetail(voter)}
                          className="text-brand-700 hover:bg-brand-50"
                        >
                          <CircleInfo className="size-4" />
                          বিস্তারিত
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto nice-scroll md:block">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50 text-ink-600">
                      <th className="px-4 py-3 font-medium">নাম</th>
                      <th className="px-4 py-3 font-medium">পিতার নাম</th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">
                        ভোটার আইডি
                      </th>
                      <th className="hidden px-4 py-3 font-medium xl:table-cell">
                        জন্ম তারিখ
                      </th>
                      <th className="hidden px-4 py-3 font-medium lg:table-cell">
                        বুথ/এলাকা নং
                      </th>
                      <th className="hidden px-4 py-3 font-medium xl:table-cell">
                        ঠিকানা
                      </th>
                      <th className="hidden px-4 py-3 font-medium xl:table-cell">
                        উপজেলা
                      </th>
                      <th className="hidden px-4 py-3 font-medium 2xl:table-cell">
                        জেলা
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        কার্যক্রম
                      </th>
                    </tr>
                  </thead>
                  <motion.tbody
                    key={pagination?.page || 1}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-ink-100"
                  >
                    {results.map((voter) => (
                      <motion.tr
                        key={voter._id}
                        variants={fadeUp}
                        className="row-hover transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-ink-900">
                            {voter.name || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-600">
                          {voter.fatherName || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-600 lg:table-cell">
                          {voter.voterIdentifier || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-600 xl:table-cell">
                          {voter.dateOfBirth || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-600 lg:table-cell">
                          {voter.boothNumber || "—"}
                        </td>
                        <td className="hidden max-w-[260px] truncate px-4 py-3 text-xs text-ink-600 xl:table-cell">
                          {voter.address || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-600 xl:table-cell">
                          {voter.upazila || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-ink-600 2xl:table-cell">
                          {voter.district || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => openDetail(voter)}
                              className="text-brand-700 hover:bg-brand-50"
                            >
                              <CircleInfo className="size-4" />
                              <span className="hidden sm:inline">
                                বিস্তারিত
                              </span>
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
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
      </motion.div>

      {/* Voter Detail Modal */}
      <VoterDetailModal
        voter={detailVoter}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}