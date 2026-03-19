import { localStorageService } from "../../../core/services";
import type { CurrentUser } from "../types";

const STORAGE_KEY = "current-user";

const ADJECTIVES = ["Brave", "Calm", "Mellow", "Sunny", "Quiet", "Lucky"];
const NOUNS = ["Fox", "Otter", "Panda", "Robin", "Mage", "Wisp"];

function generateRandomUserName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${adjective}${noun}${number}`;
}

function createDefaultUser(): CurrentUser {
  return {
    userId: crypto.randomUUID(),
    userName: generateRandomUserName(),
  };
}

function getCurrentUser(): CurrentUser {
  const stored = localStorageService.getItem<CurrentUser>(STORAGE_KEY);

  if (stored?.userId && stored?.userName) {
    return stored;
  }

  const created = createDefaultUser();
  localStorageService.setItem(STORAGE_KEY, created);
  return created;
}

function setUserName(userName: string): CurrentUser {
  const current = getCurrentUser();
  const next: CurrentUser = {
    ...current,
    userName: userName.trim() || current.userName,
  };

  localStorageService.setItem(STORAGE_KEY, next);
  return next;
}

export const currentUserService = {
  getCurrentUser,
  setUserName,
};
