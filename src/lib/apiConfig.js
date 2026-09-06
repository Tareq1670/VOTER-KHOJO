const configuredServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";

function runtimeHostFallback() {
  if (typeof window === "undefined") return "http://localhost:5000";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "http://localhost:5000";
  return "https://voter-khojo-server.vercel.app";
}

function deriveServerUrl() {
  if (configuredServerUrl) return configuredServerUrl.replace(/\/+$/, "");
  if (authUrl) return authUrl.replace(/\/api\/auth\/?$/, "").replace(/\/+$/, "");
  return runtimeHostFallback();
}

export const SERVER_URL = deriveServerUrl();
export const AUTH_URL = authUrl || `${SERVER_URL}/api/auth`;