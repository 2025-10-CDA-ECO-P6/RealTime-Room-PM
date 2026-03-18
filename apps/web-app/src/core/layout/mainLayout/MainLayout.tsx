import React from "react";
import styles from "./MainLayout.module.css";

interface MainLayoutProps {
  header?: React.ReactNode;
  main: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ header, main, right, className }) => {
  return (
    <div className={[styles.page, className].filter(Boolean).join(" ")}>
      {header && <div className={styles.header}>{header}</div>}

      <div className={styles.body}>
        <main className={styles.main}>{main}</main>
        {right && <aside className={styles.right}>{right}</aside>}
      </div>
    </div>
  );
};
