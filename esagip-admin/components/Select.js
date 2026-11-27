"use client";

import { useId } from "react";
import styles from "./Select.module.css";

export default function Select({ label, id, options = [], className = "", children, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={selectId}>{label}</label>}
      <select className={`${styles.select} ${className}`.trim()} id={selectId} {...props}>
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
