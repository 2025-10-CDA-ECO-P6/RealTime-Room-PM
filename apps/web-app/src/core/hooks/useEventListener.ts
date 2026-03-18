import { useEffect } from "react";

type EventTargetLike = Window | Document | HTMLElement;

export const useEventListener = (event: string, handler: EventListener, element?: EventTargetLike): void => {
  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const target = element ?? globalThis;

    target.addEventListener(event, handler);

    return () => {
      target.removeEventListener(event, handler);
    };
  }, [event, handler, element]);
};
