import React from "react";
import styles from "./StatusPill.module.css";

interface StatusPillProps {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ children, tone = "neutral", className }) => {
  return <span className={[styles.pill, styles[tone], className].filter(Boolean).join(" ")}>{children}</span>;
};
