import React, { type JSX } from "react";
import styles from "./Stack.module.css";

interface StackProps {
  children: React.ReactNode;
  gap?: "xs" | "sm" | "md" | "lg";
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Stack: React.FC<StackProps> = ({ children, gap = "md", className, as: Component = "div" }) => {
  return <Component className={[styles.stack, styles[gap], className].filter(Boolean).join(" ")}>{children}</Component>;
};
