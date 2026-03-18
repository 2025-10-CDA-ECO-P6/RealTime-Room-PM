import React from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  title?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = "md",
  color = "var(--color-primary)",
  className,
  title,
}) => {
  const displayInitials = initials.toUpperCase().slice(0, 2);

  return (
    <div
      className={[styles.avatar, styles[`size-${size}`], className].filter(Boolean).join(" ")}
      style={{ backgroundColor: color }}
      title={title}
      aria-label={title}
    >
      <span className={styles.initials}>{displayInitials}</span>
    </div>
  );
};
