"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getInitials } from "@/lib/rbac";
import styles from "./Header.module.css";

const titles = {
  "/dashboard": "Dashboard",
  "/volunteers": "Volunteers",
  "/operations": "Operations",
  "/attendance": "Attendance",
  "/community": "Community",
  "/reports": "Reports",
  "/rbac": "RBAC",
  "/activity-logs": "Activity Logs",
  "/no-access": "No Access",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const title = titles[pathname] || "Dashboard";
  const initials = getInitials(user?.name || "Admin");

  async function handleSignOut() {
    await signOut();
    router.replace("/signin");
  }

  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <span>BARANGAY SANTOLAN</span>
        <h1>{title}</h1>
      </div>
      <div className={styles.actions}>
        <label className={styles.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></svg>
          <input type="search" placeholder="Search volunteers..." aria-label="Search volunteers" />
        </label>
        <button className={styles.notification} type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4" /></svg>
          <i />
        </button>
        <span className={styles.profile} title={user ? `${user.name} (${user.role})` : "Administrator"}>
          {initials}
        </span>
        <button className={styles.signOutBtn} type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
