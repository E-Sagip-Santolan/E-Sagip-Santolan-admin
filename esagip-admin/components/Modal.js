"use client";

import { useEffect, useId } from "react";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, subtitle, icon, size = "medium", children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className={`${styles.dialog} ${size === "wide" ? styles.wide : ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            {icon && <span className={styles.iconBadge} aria-hidden="true">{icon}</span>}
            <div>
              <h2 id={titleId}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  );
}
