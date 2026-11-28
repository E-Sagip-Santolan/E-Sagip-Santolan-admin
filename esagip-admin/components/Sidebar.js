"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Icon from "@/components/Icon";
import { can } from "@/lib/auth";
import styles from "./Sidebar.module.css";

const workspaceLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", permission: null },
  { label: "Volunteers", href: "/volunteers", icon: "users", showPendingBadge: true, permission: "volunteer_approvals" },
  { label: "Operations", href: "/operations", icon: "operations", permission: "operation_management" },
  { label: "Attendance", href: "/attendance", icon: "attendance", permission: "attendance_confirmation" },
  { label: "Community", href: "/community", icon: "community", permission: "community_publishing" },
  { label: "Reports", href: "/reports", icon: "reports", permission: "reports_exports" },
];

const adminLinks = [
  { label: "RBAC", href: "/rbac", icon: "access", permission: "superadmin_only" },
  { label: "Activity Logs", href: "/activity-logs", icon: "logs", permission: "activity_logs" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, pendingVolunteerCount } = useAuth();

  const visibleWorkspace = workspaceLinks.filter((item) => can(item.permission, user));
  const visibleAdmin = adminLinks.filter((item) => can(item.permission, user));

  const renderLinks = (items) =>
    items.map((link) => {
      const active = pathname === link.href;
      const badgeCount =
        link.showPendingBadge && typeof pendingVolunteerCount === "number" && pendingVolunteerCount > 0
          ? String(pendingVolunteerCount)
          : null;
      return (
        <Link
          className={`${styles.link} ${active ? styles.active : ""}`}
          href={link.href}
          key={link.href}
          aria-label={link.label}
          aria-current={active ? "page" : undefined}
          title={link.label}
        >
          <Icon name={link.icon} className={styles.icon} />
          <span className={styles.linkLabel}>{link.label}</span>
          {badgeCount && <span className={styles.count}>{badgeCount}</span>}
        </Link>
      );
    });

  return (
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/dashboard" aria-label="E-Sagip admin portal home">
        <span className={styles.logo} aria-hidden="true">
          <Image src="/e-sagip-logo.svg" alt="" width={36} height={36} />
        </span>
        <span className={styles.brandWords}><strong>E-Sagip</strong><small>ADMIN PORTAL</small></span>
      </Link>
      <div className={styles.groupLabel}>WORKSPACE</div>
      <nav className={styles.nav} aria-label="Workspace navigation">
        {renderLinks(visibleWorkspace)}
      </nav>
      {visibleAdmin.length > 0 && (
        <>
          <div className={styles.groupLabel}>ADMINISTRATION</div>
          <nav className={styles.nav} aria-label="Administration navigation">
            {renderLinks(visibleAdmin)}
          </nav>
        </>
      )}
      <div className={styles.version}><span>System version</span><strong>v2.5.0</strong></div>
    </aside>
  );
}
