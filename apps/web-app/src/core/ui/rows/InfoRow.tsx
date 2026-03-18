import React from "react";
import styles from "./InfoRow.module.css";

interface InfoRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, className }) => {
  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};
