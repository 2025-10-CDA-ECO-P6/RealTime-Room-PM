import { loggerService } from "./Loggerservice";

function getStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
      return null;
    }

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isStorageAvailable(storage: Storage): boolean {
  try {
    const testKey = "__storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storage = getStorage();
const storageAvailable = storage !== null && isStorageAvailable(storage);

export const localStorageService = {
  getItem<T = string>(key: string, defaultValue?: T): T | null {
    if (!storage || !storageAvailable) {
      loggerService.warn("localStorageService", `localStorage unavailable on getItem("${key}")`);
      return defaultValue ?? null;
    }

    try {
      const item = storage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      loggerService.warn("localStorageService", `Failed to get key "${key}"`, error);
      return defaultValue ?? null;
    }
  },

  setItem<T>(key: string, value: T): void {
    if (!storage || !storageAvailable) {
      loggerService.warn("localStorageService", `localStorage unavailable on setItem("${key}")`);
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      loggerService.warn("localStorageService", `Failed to set key "${key}"`, error);
    }
  },

  removeItem(key: string): void {
    if (!storage || !storageAvailable) {
      loggerService.warn("localStorageService", `localStorage unavailable on removeItem("${key}")`);
      return;
    }

    try {
      storage.removeItem(key);
    } catch (error) {
      loggerService.warn("localStorageService", `Failed to remove key "${key}"`, error);
    }
  },

  clear(): void {
    if (!storage || !storageAvailable) {
      loggerService.warn("localStorageService", "localStorage unavailable on clear()");
      return;
    }

    try {
      storage.clear();
    } catch (error) {
      loggerService.warn("localStorageService", "Failed to clear storage", error);
    }
  },
};