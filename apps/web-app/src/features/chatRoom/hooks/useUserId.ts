import { useState } from "react";
import { localStorageService } from "../../../core/services";

const USER_ID_KEY = "chat_user_id";

const generateUserId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `user_${crypto.randomUUID()}`;
  }
  return `user_${Math.random().toString(36).slice(2, 11)}`;
};

const getOrCreateUserId = (): string => {
  const stored = localStorageService.getItem<string>(USER_ID_KEY);

  if (stored) {
    return stored;
  }

  const newId = generateUserId();
  localStorageService.setItem(USER_ID_KEY, newId);
  return newId;
};

export const useUserId = (): string => {
  const [userId] = useState<string>(getOrCreateUserId);
  return userId;
};
