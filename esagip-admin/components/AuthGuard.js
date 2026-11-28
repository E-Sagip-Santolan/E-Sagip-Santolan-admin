"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import NoAccess from "@/components/NoAccess";
import { isAdminUser } from "@/lib/auth";
import { canAccessRoute } from "@/lib/rbac";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const authorized = isAdminUser(user);

  useEffect(() => {
    if (!loading && !authorized) {
      router.replace("/signin");
    }
  }, [loading, authorized, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "60vh",
          color: "var(--color-text-secondary)",
        }}
      >
        Loading workspace…
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}

export function PermissionGate({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (user && !canAccessRoute(user, pathname)) {
    return <NoAccess />;
  }

  return children;
}
