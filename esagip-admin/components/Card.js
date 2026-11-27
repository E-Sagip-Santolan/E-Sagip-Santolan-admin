import styles from "./Card.module.css";

export default function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`${styles.card} ${className}`.trim()}>
      {(title || subtitle || action) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
