import React from "react";
import type { ConnectionStatus as ConnectionStatusType } from "../../types/ConnectionStatus";
import styles from "./ConnectionStatus.module.css";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

interface StatusConfig {
  label: string;
  icon: string;
  className: string;
}

const STATUS_CONFIG: Record<ConnectionStatusType, StatusConfig> = {
  connected: {
    label: "Connected",
    icon: "●",
    className: styles.connected,
  },
  connecting: {
    label: "Connecting...",
    icon: "◐",
    className: styles.connecting,
  },
  disconnected: {
    label: "Disconnected",
    icon: "○",
    className: styles.disconnected,
  },
  error: {
    label: "Error",
    icon: "✕",
    className: styles.error,
  },
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`${styles.container} ${config.className}`}>
      <span className={styles.icon} aria-hidden="true">
        {config.icon}
      </span>
      <span className={styles.label}>{config.label}</span>
    </div>
  );
};
