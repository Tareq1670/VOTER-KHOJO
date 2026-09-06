const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

async function apiCall(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "অনুরোধটি সফল হয়নি।");
  }
  return data;
}

// Multipart upload — no explicit Content-Type so the browser sets the boundary.
export async function uploadPDFs(files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append("pdfs", file));

  const res = await fetch(`${BASE_URL}/api/pdfs/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  try {
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "PDF আপলোড সফল হয়নি।");
    }
    return data.data;
  } finally {
    // onProgress is optional and currently unused; kept for future upload
    // progress wiring. Chrome's fetch() has no upload progress API.
    if (typeof onProgress === "function") onProgress(100);
  }
}

export async function fetchPDFs({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/pdfs?${params.toString()}`);
  return data.data;
}

export async function fetchPDFById(id) {
  const data = await apiCall(`/api/pdfs/${id}`);
  return data.data;
}

export async function reprocessPDF(id) {
  const data = await apiCall(`/api/pdfs/${id}/reprocess`, { method: "POST" });
  return data;
}

export async function deletePDF(id) {
  const data = await apiCall(`/api/pdfs/${id}`, { method: "DELETE" });
  return data;
}

// Binary download — the response is a file, not JSON, so this bypasses
// apiCall and materializes the body as a Blob then saves it via a temp link.
export async function downloadPDF(id) {
  const res = await fetch(`${BASE_URL}/api/pdfs/${id}/download`, {
    credentials: "include",
  });
  if (!res.ok) {
    let message = "PDF ডাউনলোড করা যায়নি।";
    try {
      const err = await res.json();
      if (err.message) message = err.message;
    } catch {
      /* body is not JSON */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  let fileName = `pdf-${id}.pdf`;
  const star = disposition.match(/filename\*\s*=UTF-8''([^;]+)/i);
  if (star && star[1]) {
    fileName = decodeURIComponent(star[1]);
  } else {
    const plain =
      disposition.match(/filename\s*=\s*"([^"]+)"/i) ||
      disposition.match(/filename\s*=\s*([^;\s]+)/i);
    if (plain && plain[1]) fileName = plain[1];
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
