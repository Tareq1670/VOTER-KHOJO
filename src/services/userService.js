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

export async function fetchCurrentUser() {
  const data = await apiCall("/api/auth/me");
  return data.data;
}

export async function fetchUsers({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/users?${params.toString()}`);
  return data.data;
}

export async function fetchUserById(id) {
  const data = await apiCall(`/api/users/${id}`);
  return data.data;
}

export async function updateUserStatus(id, status) {
  const data = await apiCall(`/api/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function updateUserPermissions(id, permissions) {
  const data = await apiCall(`/api/users/${id}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissions }),
  });
  return data;
}

export async function deleteUser(id) {
  const data = await apiCall(`/api/users/${id}`, { method: "DELETE" });
  return data;
}

export async function fetchUserUploads(id, { page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/users/${id}/uploads?${params.toString()}`);
  return data.data;
}

export async function fetchUserActivity(id, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  const data = await apiCall(`/api/users/${id}/activity?${params.toString()}`);
  return data.data;
}

export async function fetchUserSearchStats(id) {
  const data = await apiCall(`/api/users/${id}/search-stats`);
  return data.data;
}

export async function fetchUserDetailViewStats(id) {
  const data = await apiCall(`/api/users/${id}/detail-stats`);
  return data.data;
}
