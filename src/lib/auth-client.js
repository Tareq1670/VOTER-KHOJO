import { createAuthClient } from "better-auth/react";
import { AUTH_URL } from "@/lib/apiConfig";

// The backend Express server exposes Better Auth at /api/auth. Uses the shared
// apiConfig so the live deployment needs no extra environment setup.
export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
