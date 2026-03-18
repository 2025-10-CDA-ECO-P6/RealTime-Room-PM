import React, { useState } from "react";
import { Button, Input } from "../../../../core/ui";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  onSend: (content: string) => void;
  isDisabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isDisabled = false }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isDisabled) {
      return;
    }

    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <Input
          type="text"
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className={styles.input}
          inputClassName={styles.textInput}
        />

        <Button type="submit" size="md" disabled={!message.trim() || isDisabled} className={styles.button}>
          Envoyer
        </Button>
      </div>
    </form>
  );
};
