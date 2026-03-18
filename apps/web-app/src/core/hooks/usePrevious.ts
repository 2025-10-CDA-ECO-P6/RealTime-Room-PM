import { useState } from "react";

export const usePrevious = <T>(value: T): T | undefined => {
  const [{ current, previous }, setState] = useState<{
    current: T;
    previous: T | undefined;
  }>({
    current: value,
    previous: undefined,
  });

  if (!Object.is(value, current)) {
    setState({
      current: value,
      previous: current,
    });
  }

  return previous;
};
