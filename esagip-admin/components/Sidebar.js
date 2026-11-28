"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import styles from "./Sidebar.module.css";

const workspaceLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Volunteers", href: "/volunteers", icon: "users", count: "2" },
  { label: "Operations", href: "/operations", icon: "operations" },
  { label: "Attendance", href: "/attendance", icon: "attendance" },
  { label: "Community", href: "/community", icon: "community" },
  { label: "Reports", href: "/reports", icon: "reports" },
];

const adminLinks = [
  { label: "RBAC", href: "/rbac", icon: "access" },
  { label: "Activity Logs", href: "/activity-logs", icon: "logs" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderLinks = (items) =>
    items.map((link) => {
      const active = pathname === link.href;
      return (
        <Link className={`${styles.link} ${active ? styles.active : ""}`} href={link.href} key={link.href} aria-label={link.label} aria-current={active ? "page" : undefined} title={link.label}>
          <Icon name={link.icon} className={styles.icon} />
          <span className={styles.linkLabel}>{link.label}</span>
          {link.count && <span className={styles.count}>{link.count}</span>}
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
        {renderLinks(workspaceLinks)}
      </nav>
      <div className={styles.groupLabel}>ADMINISTRATION</div>
      <nav className={styles.nav} aria-label="Administration navigation">
        {renderLinks(adminLinks)}
      </nav>
      <div className={styles.version}><span>System version</span><strong>v2.5.0</strong></div>
    </aside>
  );
}
