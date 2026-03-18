import React from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hasBorder?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ children, className, title, header, footer, hasBorder = true }) => {
  const classNames = [styles.panel, hasBorder ? styles.bordered : "", className].filter(Boolean).join(" ");

  return (
    <section className={classNames}>
      {(title || header) && (
        <header className={styles.panelHeader}>{header ?? <h2 className={styles.title}>{title}</h2>}</header>
      )}

      <div className={styles.panelContent}>{children}</div>

      {footer && <footer className={styles.panelFooter}>{footer}</footer>}
    </section>
  );
};
