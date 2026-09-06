"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  TextField,
  Label,
  Input,
} from "@heroui/react";
import { Envelope, Lock, Eye, EyeSlash } from "@gravity-ui/icons";
import SearchInput from "@/components/ui/SearchInput";
import { signIn } from "@/lib/auth-client";
import { RippleLoader } from "@/components/loading-ui/ripple-loader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Messages the server sends when login is blocked because of account status
  // (as opposed to a wrong email/password).
  const APPROVAL_MESSAGES = [
    "à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦¹à¦¯à¦¼à¦¨à¦¿à¥¤",
    "à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨à§‡ à¦¸à§à¦¥à¦—à¦¿à¦¤ à¦°à¦¯à¦¼à§‡à¦›à§‡à¥¤",
    "à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦à¦–à¦¨à§‹ à¦à¦¡à¦®à¦¿à¦¨ à¦¦à§à¦¬à¦¾à¦°à¦¾ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦¹à¦¯à¦¼à¦¨à¦¿à¥¤",
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    try {
      const result = await signIn.email({ email, password });
      const { error, data } = result;

      if (error) {
        const rawMessage = String(error.message || "").trim();
        const approvalMessage = APPROVAL_MESSAGES.find((m) =>
          rawMessage.includes(m)
        );

        if (approvalMessage) {
          toast.error(approvalMessage);
        } else if (
          error.status === 401 ||
          String(error.code || "").toUpperCase() === "UNAUTHORIZED"
        ) {
          toast.error("à¦‡à¦®à§‡à¦‡à¦² à¦¬à¦¾ à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦­à§à¦² à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤");
        } else {
          toast.error(
            rawMessage || "à¦²à¦—à¦‡à¦¨ à¦•à¦°à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿à¥¤ à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤"
          );
        }
        return;
      }

      // Send the user straight to their main site (dashboard / admin panel).
      const role = data?.user?.role || data?.role;
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error) {
      toast.error("à¦²à¦—à¦‡à¦¨à§‡à¦° à¦¸à¦®à¦¯à¦¼ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤ à¦…à¦¨à§à¦—à§à¦°à¦¹ à¦•à¦°à§‡ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-background flex flex-1 items-center justify-center px-4 py-16 sm:py-20">
      <Card className="auth-card w-full max-w-md auth-fade-up">
        <CardHeader className="items-center text-center px-8 pt-10 pb-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <CardDescription className="text-sm font-semibold uppercase tracking-widest text-brand-700">
              à¦­à§‹à¦Ÿà¦¾à¦° à¦–à§à¦à¦œà§‹
            </CardDescription>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.06}
            className="mt-3"
          >
            <CardTitle className="text-2xl font-bold text-brand-700">
              à¦¸à§à¦¬à¦¾à¦—à¦¤à¦® â€” à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨
            </CardTitle>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.12}
            className="mt-2"
          >
            <CardDescription className="mx-auto max-w-sm text-sm leading-relaxed text-ink-700">
              à¦†à¦ªà¦¨à¦¾à¦° à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿà§‡ à¦ªà§à¦°à¦¬à§‡à¦¶ à¦•à¦°à§à¦¨à¥¤ à¦à¦¡à¦®à¦¿à¦¨ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¬à§à¦¯à¦¤à§€à¦¤ à¦²à¦—à¦‡à¦¨ à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡ à¦¨à¦¾à¥¤
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="px-8 pt-6">
          <motion.form
            onSubmit={handleSubmit}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.18}
            className="flex flex-col gap-5"
          >
            <TextField
              value={email}
              onChange={setEmail}
              isRequired
              type="email"
              name="email"
              fullWidth
            >
              <Label className="text-sm font-medium text-ink-800">
                à¦‡à¦®à§‡à¦‡à¦²
              </Label>
              <SearchInput
                icon={Envelope}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-1.5 rounded-lg"
              />
            </TextField>

            <TextField
              value={password}
              onChange={setPassword}
              isRequired
              type={showPassword ? "text" : "password"}
              name="password"
              fullWidth
            >
              <Label className="text-sm font-medium text-ink-800">
                à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡
              </Label>
              <SearchInput
                icon={Lock}
                placeholder="à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡"
                autoComplete="current-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦²à§à¦•à¦¾à¦¨" : "à¦ªà¦¾à¦¸à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à¦¦à§‡à¦–à§à¦¨"}
                    className="flex items-center text-ink-600 transition hover:text-ink-800"
                  >
                    {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                className="mt-1.5 rounded-lg"
              />
            </TextField>

            <Button
              type="submit"
              fullWidth
              isDisabled={submitting}
              variant="solid"
              className="mt-1 h-11 rounded-lg text-base font-semibold brand-gradient text-white transition"
            >
              {submitting ? <RippleLoader size={0.32} /> : "à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨"}
            </Button>

            <p className="text-center text-xs text-ink-600">
              à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦“ à¦¸à§à¦°à¦•à§à¦·à¦¿à¦¤ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦…à§à¦¯à¦¾à¦•à§à¦¸à§‡à¦¸
            </p>
          </motion.form>
        </CardContent>

        <CardFooter className="justify-center px-8 pt-4 pb-10">
          <span className="text-sm text-ink-600">
            à¦¨à¦¤à§à¦¨ à¦à¦–à¦¾à¦¨à§‡?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-700 hover:underline"
            >
              à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨
            </Link>
          </span>
        </CardFooter>
      </Card>
    </main>
  );
}
