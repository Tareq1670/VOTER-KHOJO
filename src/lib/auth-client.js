import { createAuthClient } from "better-auth/react";
import { getAuthUrl } from "@/lib/apiConfig";

// The backend Express server exposes Better Auth at /api/auth. Uses the shared
// apiConfig so the live deployment needs no additional environment setup.
export const authClient = createAuthClient({
  baseURL: getAuthUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
