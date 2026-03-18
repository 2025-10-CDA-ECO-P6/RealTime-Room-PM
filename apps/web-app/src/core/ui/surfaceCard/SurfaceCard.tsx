import React from "react";
import styles from "./SurfaceCard.module.css";

interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({ children, className }) => {
  return <section className={[styles.card, className].filter(Boolean).join(" ")}>{children}</section>;
};
