"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  adminLogin,
  getMe,
  getVolunteersSummary,
  logout as apiLogout,
} from "@/lib/api";
import { can, clearSession, getSession, setUnauthorizedHandler } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVolunteerCount, setPendingVolunteerCount] = useState(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setPendingVolunteerCount(null);
      if (pathname !== "/signin" && pathname !== "/login") {
        router.replace("/signin");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [pathname, router]);

  const refreshPendingCount = useCallback(async (targetUser) => {
    const activeUser = targetUser ?? getSession()?.user ?? null;
    if (!can("volunteer_approvals", activeUser)) {
      setPendingVolunteerCount(null);
      return null;
    }
    try {
      const response = await getVolunteersSummary();
      const pending = typeof response?.data?.pending === "number" ? response.data.pending : 0;
      setPendingVolunteerCount(pending);
      return pending;
    } catch {
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const session = getSession();
    if (!session?.token) {
      setUser(null);
      setPendingVolunteerCount(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await getMe();
      const nextUser = response?.data || null;
      setUser(nextUser);
      if (can("volunteer_approvals", nextUser)) {
        refreshPendingCount(nextUser);
      } else {
        setPendingVolunteerCount(null);
      }
      return nextUser;
    } catch {
      clearSession();
      setUser(null);
      setPendingVolunteerCount(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    let active = true;
    const session = getSession();

    if (!session?.token) {
      Promise.resolve().then(() => {
        if (active) {
          setUser(null);
          setPendingVolunteerCount(null);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }

    getMe()
      .then((response) => {
        if (!active) return;
        const nextUser = response?.data || null;
        setUser(nextUser);
        if (can("volunteer_approvals", nextUser)) {
          getVolunteersSummary()
            .then((sumRes) => {
              if (active && typeof sumRes?.data?.pending === "number") {
                setPendingVolunteerCount(sumRes.data.pending);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        clearSession();
        if (active) {
          setUser(null);
          setPendingVolunteerCount(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await adminLogin(credentials);
    const nextUser = response?.data?.user || null;
    setUser(nextUser);
    if (can("volunteer_approvals", nextUser)) {
      refreshPendingCount(nextUser);
    } else {
      setPendingVolunteerCount(null);
    }
    return nextUser;
  }, [refreshPendingCount]);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearSession();
      setUser(null);
      setPendingVolunteerCount(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pendingVolunteerCount,
      setPendingVolunteerCount,
      refreshPendingCount,
      login,
      signOut,
      refreshUser,
    }),
    [
      user,
      loading,
      pendingVolunteerCount,
      refreshPendingCount,
      login,
      signOut,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return ctx;
}
