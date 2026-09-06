"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Button, Avatar } from "@heroui/react";
import {
  Persons,
  LayoutList,
  FileText,
  Clock,
  Magnifier,
  FileArrowUp,
  ArrowRightFromLine,
  ChevronRight,
  Bars,
} from "@gravity-ui/icons";
import { useSession, signOut } from "@/lib/auth-client";
import { CurrentUserProvider, useCurrentUser } from "@/lib/currentUser";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

// Exclusive to admins — regular users have no access to these.
const ADMIN_ONLY_NAV_ITEMS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutList },
  { href: "/admin/users", label: "ব্যবহারকারী", icon: Persons },
  { href: "/admin/audit-logs", label: "অডিট লগ", icon: Clock },
];

// Features a regular user also gets (their dashboard mirrors these).
const COMMON_NAV_ITEMS = [
  { href: "/admin/search", label: "ভোটার খুঁজুন", icon: Magnifier },
  { href: "/admin/upload", label: "পিডিএফ আপলোড", icon: FileArrowUp },
  { href: "/admin/pdfs", label: "পিডিএফ পরিচালনা", icon: FileText },
];

function NavSectionTitle({ children }) {
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/50">
      {children}
    </p>
  );
}

function SidebarLink({ href, label, icon: Icon, active, onClick, badge }) {
  return (
    <Link href={href} onClick={onClick} className="block">
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-white/15 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="size-5 shrink-0" />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="rounded bg-brand-400/25 px-1.5 py-0.5 text-[10px] font-semibold text-brand-300">
            {badge}
          </span>
        )}
        {active && <ChevronRight className="size-4 opacity-60" />}
      </div>
    </Link>
  );
}

function SidebarContent({ pathname, user, onLogout, onNavClick }) {
  return (
    <>
      {/* Logo header with brand gradient */}
      <div className="relative flex h-16 shrink-0 flex-col justify-center border-b border-white/10 px-5">
        <div className="absolute inset-x-0 top-0 h-1 brand-gradient" />
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-300">ভোটার খুঁজো</span>
          <span className="ml-auto rounded-md bg-brand-400/20 px-2 py-0.5 text-xs font-semibold text-brand-300">
            এডমিন
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          <NavSectionTitle>শুধু এডমিন</NavSectionTitle>
          {ADMIN_ONLY_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onClick={onNavClick}
              badge="এডমিন"
              active={
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-white/10 pt-4">
          <NavSectionTitle>সাধারণ (সবার জন্য)</NavSectionTitle>
          {COMMON_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onClick={onNavClick}
              active={
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 text-sm">
            {user.image ? (
              <Avatar.Image src={user.image} alt={user.name} />
            ) : null}
            <Avatar.Fallback>
              {user.name ? user.name.charAt(0) : "?"}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-white/70">{user.email}</p>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={onLogout}
            className="text-white/70 hover:text-red-400"
            title="লগআউট"
          >
            <ArrowRightFromLine className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  return (
    <CurrentUserProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </CurrentUserProvider>
  );
}

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending, error } = useSession();
  const { me, status: userStatus } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && error) {
      toast.error(
        "সেশন প্রদর্শনে সমস্যা। ব্যাকএন্ড সার্ভার চালু আছে কিনা যাচাই করুন।"
      );
    }
  }, [isPending, error]);

  // Role gate uses the freshly fetched `/me` record (session snapshots role at
  // login) so a promoted admin gets access immediately, without re-login.
  useEffect(() => {
    if (isPending || userStatus === "loading" || userStatus === "idle") return;
    const role = userStatus === "ok" && me ? me.role : data?.user?.role;
    if (data?.user && role !== "admin") {
      toast.error("এই পৃষ্ঠায় প্রবেশের অনুমতি নেই।");
      router.push("/");
    }
  }, [isPending, userStatus, me, data, router]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (isPending) {
    return (
      <main className="flex flex-1 items-center justify-center min-h-dvh bg-ink-50">
        <PrinterLoader size={1.35} label="লোড হচ্ছে…" />
      </main>
    );
  }

  if (!data?.user) {
    return (
      <main className="flex flex-1 items-center justify-center min-h-dvh bg-ink-50">
        <p className="text-ink-600">লগইন করুন।</p>
      </main>
    );
  }

  // Fresh `/me` wins for display; fall back to the session snapshot otherwise.
  const user = userStatus === "ok" && me ? me : data.user;

  const handleLogout = async () => {
    await signOut();
    toast.success("লগআউট সফল হয়েছে।");
    router.push("/");
  };

  return (
    <div className="flex min-h-dvh bg-ink-50">
      {/* ── Desktop sidebar (lg+) ──────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-navy">
        <SidebarContent
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile/tablet overlay sidebar (< lg) ──── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 sidebar-backdrop lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                onLogout={handleLogout}
                onNavClick={closeSidebar}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ──────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setSidebarOpen(true)}
            className="text-ink-700"
          >
            <Bars className="size-5" />
          </Button>
          <span className="text-base font-bold text-brand-700">
            ভোটার খুঁজো
          </span>
          <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
            এডমিন
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="content-shell flex-1 p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
