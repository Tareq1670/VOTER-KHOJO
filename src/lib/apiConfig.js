const configuredServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";

function deriveServerUrl() {
  if (configuredServerUrl) return configuredServerUrl.replace(/\/+$/, "");
  if (authUrl) return authUrl.replace(/\/api\/auth\/?$/, "").replace(/\/+$/, "");
  return "http://localhost:5000";
}

export const SERVER_URL = deriveServerUrl();