"use client";

import { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, children }) {
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
    <div className={styles.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className={styles.header}>
          <h2 id="modal-title">{title}</h2>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Close dialog">×</button>
        </header>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  );
}
