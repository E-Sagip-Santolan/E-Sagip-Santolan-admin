"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import styles from "./NoAccess.module.css";

export default function NoAccess({ title = "You don't have access to this page" }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const permCount =
    user?.role === "superadmin"
      ? "All permissions"
      : `${user?.permissions?.length || 0} assigned`;

  async function handleSignOut() {
    await signOut();
    router.replace("/signin");
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.card} aria-labelledby="no-access-title">
        <div className={styles.iconBadge} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9.5 9.5 5 5m0-5-5 5" />
          </svg>
        </div>

        <span className={styles.eyebrow}>ACCESS RESTRICTED</span>
        <h1 id="no-access-title">{title}</h1>
        <p className={styles.description}>
          Your administrator account does not have the required permissions to view this workspace
          section. Contact a Barangay Santolan Superadmin to request access.
        </p>

        {user && (
          <div className={styles.accountBox}>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
            <Badge variant="primary">
              {user.role === "superadmin" ? "Superadmin" : `Admin · ${permCount}`}
            </Badge>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/dashboard">
            <Button>← Back to Dashboard</Button>
          </Link>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
