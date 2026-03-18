import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, inputClassName, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}

          <input
            ref={ref}
            id={inputId}
            className={[styles.input, error ? styles.error : "", icon ? styles.withIcon : "", inputClassName || ""]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
            {...props}
          />
        </div>

        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
