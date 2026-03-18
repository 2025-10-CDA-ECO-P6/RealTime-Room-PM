import React from "react";
import styles from "./PageSection.module.css";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({ children, className }) => {
  return <section className={[styles.section, className].filter(Boolean).join(" ")}>{children}</section>;
};
