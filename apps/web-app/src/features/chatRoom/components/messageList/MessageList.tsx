import React from "react";
import styles from "./MessageList.module.css";
import type { Message } from "../../types";

interface MessageListProps {
  messages: Message[];
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className={styles.container}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <p className={styles.emptyTitle}>Aucun message pour le moment</p>
            <p className={styles.emptyText}>La conversation apparaîtra ici dès qu’un message sera envoyé.</p>
          </div>
        </div>
      ) : (
        <ul className={styles.messagesList}>
          {messages.map((message) => {
            const messageTypeClass = styles[`type-${message.type}`];
            const messageClassName = [styles.message, messageTypeClass].filter(Boolean).join(" ");

            return (
              <li key={message.id} className={messageClassName}>
                <div className={styles.messageHeader}>
                  <span className={styles.userId}>{message.type === "system" ? "Info" : message.userId}</span>
                  <time className={styles.timestamp}>{formatTime(message.timestamp)}</time>
                </div>
                <p className={styles.content}>{message.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
