import styles from "./Badge.module.css";

export default function Badge({ children, variant = "neutral", className = "" }) {
  return <span className={`${styles.badge} ${styles[variant] || styles.neutral} ${className}`.trim()}>{children}</span>;
}
