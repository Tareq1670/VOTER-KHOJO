import { createAuthClient } from "better-auth/react";

// The backend Express server exposes Better Auth at /api/auth.
// In development it runs on http://localhost:5000.
const baseURL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000/api/auth";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
