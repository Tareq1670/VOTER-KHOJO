"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { fetchCurrentUser } from "@/services/userService";

export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const { data: sessionData, isPending: sessionPending } = useSession();
  const sessionUser = sessionData?.user || null;
  const loggedIn = Boolean(sessionUser);

  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setMe(user);
      setStatus("ok");
    } catch {
      setMe(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (sessionPending) return;
    if (!loggedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMe(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPending, loggedIn]);

  // Re-fetch when the tab regains focus so admin permission grant/revoke
  // changes take effect for the user without requiring a re-login.
  useEffect(() => {
    if (!loggedIn) return;
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loggedIn, load]);

  return (
    <CurrentUserContext.Provider value={{ me, sessionUser, status, refresh: load }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}