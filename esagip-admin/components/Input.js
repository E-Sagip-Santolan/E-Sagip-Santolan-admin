"use client";

import { useId } from "react";
import styles from "./Input.module.css";

export default function Input({ label, id, error, className = "", ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input
        className={`${styles.input} ${error ? styles.invalid : ""} ${className}`.trim()}
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <span className={styles.error} id={`${inputId}-error`}>{error}</span>}
    </div>
  );
}
