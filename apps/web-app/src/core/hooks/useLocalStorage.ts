import { useState, useCallback } from "react";
import { localStorageService } from "../services/Localstorageservice";

export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorageService.getItem<T>(key);
    return item ?? initialValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        localStorageService.setItem(key, nextValue);
        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
};
