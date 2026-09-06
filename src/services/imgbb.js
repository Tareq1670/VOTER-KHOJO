const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Validate that the file is an accepted image type and within the size limit
export function validateImage(file) {
  if (!file) {
    return { valid: false, error: "অনুগ্রহ করে একটি ছবি নির্বাচন করুন।" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "শুধুমাত্র JPG, PNG, WEBP বা GIF ফাইল আপলোড করা যাবে।",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `ছবির আকার সর্বোচ্চ ${MAX_SIZE_MB}MB হতে হবে।`,
    };
  }

  return { valid: true, error: null };
}

// Upload an image file directly to ImgBB from the client.
// Returns the public image URL on success.
export async function uploadImageToImgBB(file) {
  const { valid, error } = validateImage(file);
  if (!valid) {
    throw new Error(error);
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("ImgBB API key সেট করা নেই। NEXT_PUBLIC_IMGBB_API_KEY চেক করুন।");
  }

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", file);

  try {
    const response = await fetch(IMGBB_API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const message = data?.error?.message || "ইমেজ আপলোড ব্যর্থ হয়েছে।";
      throw new Error(message);
    }

    return data.data?.url || data.data?.display_url;
  } catch (error) {
    if (error.message && error.message.includes("ইমেজ আপলোড")) {
      throw error;
    }
    throw new Error("ইমেজ আপলোডের সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
}

export { MAX_SIZE_MB };
