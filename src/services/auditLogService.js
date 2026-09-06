import { getApiBase } from "@/lib/apiConfig";

async function apiCall(path, options = {}) {
  const url = `${getApiBase()}${path}`;
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

export async function fetchAuditLogs({ page = 1, limit = 20, action = "", userId = "" } = {}) {
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  if (userId) params.set("userId", userId);
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/audit-logs?${params.toString()}`);
  return data.data;
}
