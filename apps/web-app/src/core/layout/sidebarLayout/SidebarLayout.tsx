import React from "react";
import styles from "./SidebarLayout.module.css";

interface SidebarLayoutProps {
  top?: React.ReactNode;
  main: React.ReactNode;
  bottom?: React.ReactNode;
  className?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ top, main, bottom, className }) => {
  return (
    <div className={[styles.sidebar, className].filter(Boolean).join(" ")}>
      {top && <div className={styles.top}>{top}</div>}
      <div className={styles.main}>{main}</div>
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </div>
  );
};
