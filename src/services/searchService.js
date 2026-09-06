import { SERVER_URL } from "@/lib/apiConfig";

const BASE_URL = SERVER_URL;

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

export async function searchVoters({ q, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/search?${params.toString()}`);
  return data.data;
}

export async function advancedSearchVoters(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const data = await apiCall(`/api/search/advanced?${params.toString()}`);
  return data.data;
}

export async function getVoterDetails(id) {
  const data = await apiCall(`/api/search/${id}`);
  return data.data;
}
