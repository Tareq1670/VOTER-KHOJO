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
  FieldError,
  Avatar,
} from "@heroui/react";
import { Envelope, Lock, Eye, EyeSlash, Person, PersonFill, CircleInfo, Camera } from "@gravity-ui/icons";
import { uploadImageToImgBB, validateImage, MAX_SIZE_MB } from "@/services/imgbb";
import { getApiBase } from "@/lib/apiConfig";
import SearchInput from "@/components/ui/SearchInput";
import { PrinterLoader } from "@/components/loading-ui/printer-loader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { valid, error } = validateImage(file);
    if (!valid) {
      toast.error(error);
      event.target.value = "";
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      setImageUrl(url);
      toast.success("প্রোফাইল ছবি আপলোড হয়েছে।");
    } catch (error) {
      toast.error(error.message || "ছবি আপলোড ব্যর্থ হয়েছে।");
      setImageUrl("");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।");
      return;
    }
    if (password.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${getApiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          image: imageUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "নিবন্ধন ব্যর্থ হয়েছে।");
        return;
      }

      toast.success(result.message || "নিবন্ধন সফল হয়েছে!");
      router.push("/login");
    } catch (error) {
      toast.error("নিবন্ধনের সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-background flex flex-1 items-center justify-center px-4 py-4 sm:py-6">
      <Card className="auth-card w-full max-w-md auth-fade-up">
        <CardHeader className="items-center text-center px-6 pt-4 pb-1">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <CardDescription className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              ভোটার খুঁজো
            </CardDescription>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.06}
            className="mt-1.5"
          >
            <CardTitle className="text-xl font-bold text-brand-700 sm:text-2xl">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </CardTitle>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.12}
            className="mt-1"
          >
            <CardDescription className="mx-auto max-w-sm text-xs leading-relaxed text-ink-700 sm:text-sm">
              নিবন্ধনের পর এডমিন অনুমোদন পর্যন্ত অপেক্ষা করতে হবে।
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="px-6 pt-3">
          <motion.form
            onSubmit={handleSubmit}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.18}
            className="flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/50 p-3">
              <div className="relative shrink-0">
                <Avatar className="size-14 text-large ring-2 ring-brand-100 shadow-sm">
                  {imagePreview ? (
                    <Avatar.Image src={imagePreview} alt="প্রোফাইল ছবি" />
                  ) : null}
                  <Avatar.Fallback>
                    <span className="flex size-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                      {name ? (
                        <span className="text-lg font-bold text-brand-700">
                          {name.charAt(0)}
                        </span>
                      ) : (
                        <PersonFill className="size-7 text-brand-500" />
                      )}
                    </span>
                  </Avatar.Fallback>
                </Avatar>
                <span className="absolute -right-1 -bottom-1 z-10 flex size-5 items-center justify-center rounded-full brand-gradient text-white shadow-sm ring-2 ring-white">
                  <Camera className="size-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink-800">
                  প্রোফাইল ছবি <span className="font-normal text-ink-500">(ঐচ্ছিক)</span>
                </p>
                <div className="mt-1.5">
                  <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-200 transition hover:bg-brand-50">
                    {uploading ? (
                      <PrinterLoader compact size={0.26} />
                    ) : (
                      <Camera className="size-3.5" />
                    )}
                    {uploading ? "আপলোড হচ্ছে…" : "প্রোফাইল ছবি আপলোড করুন"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleImageChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] leading-none text-ink-500">
                  <CircleInfo className="size-3 shrink-0" />
                  JPG, PNG, WEBP, GIF — সর্বোচ্চ {MAX_SIZE_MB}MB
                </p>
              </div>
            </div>

            <div className="my-0.5 flex items-center gap-3">
              <span className="h-px flex-1 bg-ink-200" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-600">
                একাউন্ট তথ্য
              </span>
              <span className="h-px flex-1 bg-ink-200" />
            </div>

            <TextField value={name} onChange={setName} isRequired name="name" fullWidth>
              <Label className="text-sm font-medium text-ink-800">
                পূর্ণ নাম
              </Label>
              <SearchInput
                icon={Person}
                placeholder="আপনার পূর্ণ নাম"
                autoComplete="name"
                className="mt-1 rounded-lg"
              />
            </TextField>

            <TextField value={email} onChange={setEmail} isRequired type="email" name="email" fullWidth>
              <Label className="text-sm font-medium text-ink-800">
                ইমেইল
              </Label>
              <SearchInput
                icon={Envelope}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-1 rounded-lg"
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
                পাসওয়ার্ড
              </Label>
              <SearchInput
                icon={Lock}
                placeholder="কমপক্ষে ৮ অক্ষর"
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    className="flex items-center text-ink-600 transition hover:text-ink-800"
                  >
                    {showPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                className="mt-1 rounded-lg"
              />
              <FieldError>পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।</FieldError>
            </TextField>

            <TextField
              value={confirmPassword}
              onChange={setConfirmPassword}
              isRequired
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              fullWidth
              isInvalid={confirmPassword.length > 0 && confirmPassword !== password}
            >
              <Label className="text-sm font-medium text-ink-800">
                পাসওয়ার্ড নিশ্চিত করুন
              </Label>
              <SearchInput
                icon={Lock}
                placeholder="আবার পাসওয়ার্ড লিখুন"
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    className="flex items-center text-ink-600 transition hover:text-ink-800"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
                className="mt-1 rounded-lg"
              />
              <FieldError>পাসওয়ার্ড দুটি একই হতে হবে।</FieldError>
            </TextField>

            <Button
              type="submit"
              fullWidth
              isDisabled={submitting || uploading}
              variant="solid"
              className="mt-0.5 h-10 rounded-lg text-base font-semibold brand-gradient text-white transition"
            >
              {submitting ? <PrinterLoader compact size={0.3} /> : "নিবন্ধন করুন"}
            </Button>
          </motion.form>
        </CardContent>

        <CardFooter className="justify-center px-6 py-2 pb-3">
          <span className="text-sm text-ink-600">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          </span>
          <Link
            href="/login"
            className="ml-1 text-sm font-semibold text-brand-700 hover:underline"
          >
            লগইন করুন
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}