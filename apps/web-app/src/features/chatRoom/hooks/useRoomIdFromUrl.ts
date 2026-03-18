import { useCallback, useEffect, useState } from "react";

const ROOM_URL_PARAM = "room";

const isBrowser = (): boolean => globalThis.window !== undefined;

const getBrowserCrypto = (): Crypto | null => {
  if (typeof globalThis === "undefined" || !("crypto" in globalThis)) {
    return null;
  }

  return globalThis.crypto;
};

const generateRoomId = (): string => {
  const browserCrypto = getBrowserCrypto();

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID().slice(0, 8).toUpperCase();
  }

  if (browserCrypto) {
    const bytes = new Uint8Array(4);
    browserCrypto.getRandomValues(bytes);

    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

const getRoomIdFromUrl = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return new URLSearchParams(globalThis.location.search).get(ROOM_URL_PARAM);
};

const updateRoomUrlParam = (roomId: string): void => {
  if (!isBrowser()) {
    return;
  }

  const url = new URL(globalThis.location.href);
  url.searchParams.set(ROOM_URL_PARAM, roomId);

  globalThis.history.replaceState(globalThis.history.state, "", url.toString());
};

const resolveInitialRoomId = (initialRoomId?: string): string => {
  const roomIdFromUrl = getRoomIdFromUrl();

  if (roomIdFromUrl) {
    return roomIdFromUrl;
  }

  if (initialRoomId) {
    return initialRoomId;
  }

  return generateRoomId();
};

export const useRoomIdFromUrl = (initialRoomId?: string): string => {
  const [roomId] = useState<string>(() => resolveInitialRoomId(initialRoomId));

  useEffect(() => {
    const currentRoomId = getRoomIdFromUrl();

    if (currentRoomId !== roomId) {
      updateRoomUrlParam(roomId);
    }
  }, [roomId]);

  return roomId;
};

export const useUpdateRoomUrl = (): ((roomId: string) => void) => {
  return useCallback((roomId: string) => {
    updateRoomUrlParam(roomId);
  }, []);
};
