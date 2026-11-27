import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  leadingIcon,
  ...props
}) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...props}>
      {leadingIcon && <span className={styles.leadingIcon}>{leadingIcon}</span>}
      {children}
    </button>
  );
}
