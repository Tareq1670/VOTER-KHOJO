const ENV_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "";
const ENV_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "";

const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/;

export function getApiBase() {
  const envServer = ENV_SERVER_URL.trim().replace(/\/+$/, "");
  const envAuth = ENV_AUTH_URL.trim().replace(/\/+$/, "");

  if (envServer && !LOCALHOST_RE.test(envServer)) return envServer;
  if (envAuth) return envAuth.replace(/\/api\/auth\/?$/, "");

  let host = "";
  try {
    host = window.location.hostname;
  } catch {
    host = "";
  }
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return "https://voter-khojo-server.vercel.app";
  }
  return "http://localhost:5000";
}

export function getAuthUrl() {
  const envAuth = ENV_AUTH_URL.trim().replace(/\/+$/, "");
  return envAuth || `${getApiBase()}/api/auth`;
}