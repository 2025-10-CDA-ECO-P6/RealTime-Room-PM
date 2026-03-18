import React from "react";
import styles from "./SplitPanelLayout.module.css";

interface SplitPanelLayoutProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  secondaryWidth?: "sm" | "md" | "lg";
  className?: string;
}

export const SplitPanelLayout: React.FC<SplitPanelLayoutProps> = ({
  primary,
  secondary,
  secondaryWidth = "md",
  className,
}) => {
  return (
    <div className={[styles.layout, className].filter(Boolean).join(" ")}>
      <div className={styles.primary}>{primary}</div>

      {secondary && <aside className={[styles.secondary, styles[secondaryWidth]].join(" ")}>{secondary}</aside>}
    </div>
  );
};
