"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { isMockMode } from "@/lib/api";
import styles from "./page.module.css";

export default function SignInPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email address is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch (error) {
      if (error?.errors) {
        const mapped = {};
        Object.entries(error.errors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        });
        setFieldErrors(mapped);
      }
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-label="E-Sagip Barangay Santolan overview">
        <div className={styles.brand}>
          <Image src="/e-sagip-logo.svg" alt="E-Sagip" width={40} height={40} />
          <span>E-Sagip</span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.crestBadge}>
            <Image
              src="/barangay-santolan-seal.png"
              alt="Official Seal of Barangay Santolan, Pasig City"
              width={144}
              height={144}
              priority
              unoptimized
              className={styles.crestImage}
            />
          </div>
          <p className={styles.eyebrow}>BARANGAY SANTOLAN · PASIG CITY</p>
          <h1>
            Coordinated response.
            <br />
            Stronger communities.
          </h1>
          <p className={styles.heroDescription}>
            E-Sagip gives disaster response teams one secure workspace for volunteer coordination,
            operations, attendance, and community information.
          </p>

          <ul className={styles.highlights}>
            <li><span>01</span>Real-time operation monitoring</li>
            <li><span>02</span>Verified volunteer participation</li>
            <li><span>03</span>Role-based administrative control</li>
          </ul>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.topNote}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 5 6v6c0 5 3.5 8.2 7 9 3.5-.8 7-4 7-9V6l-7-3Z" />
            <path d="m9.5 12 1.8 1.8 3.7-3.8" />
          </svg>
          Official Barangay Santolan platform
        </div>

        <div className={styles.card}>
          <span className={styles.cardEyebrow}>SECURE ADMIN PORTAL</span>
          <h2>Welcome!</h2>
          <p className={styles.cardSubtitle}>
            Sign in with your authorized E-Sagip administrator account.
          </p>

          {formError && (
            <div className={styles.alert} role="alert">
              {formError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="superadmin@example.test"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password}
            />
            <Button type="submit" size="large" disabled={submitting} className={styles.submitBtn}>
              {submitting ? "Signing in…" : "Sign in to E-Sagip"}
            </Button>
          </form>

          <p className={styles.footnote}>
            Authorized Barangay Santolan personnel only. All activity is logged.
          </p>

          {isMockMode() && (
            <p className={styles.mockHint}>
              Mock mode active: try <code>superadmin@example.test</code>,{" "}
              <code>admin@example.test</code>, or <code>auditor@example.test</code> (any password).
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
