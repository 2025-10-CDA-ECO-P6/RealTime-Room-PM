import React from "react";
import styles from "./SectionBlock.module.css";

interface SectionBlockProps {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({ title, eyebrow, children, className }) => {
  return (
    <section className={[styles.block, className].filter(Boolean).join(" ")}>
      {(eyebrow || title) && (
        <header className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          {title && <h3 className={styles.title}>{title}</h3>}
        </header>
      )}

      <div className={styles.content}>{children}</div>
    </section>
  );
};
