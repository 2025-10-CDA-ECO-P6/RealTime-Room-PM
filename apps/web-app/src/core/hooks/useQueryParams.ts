import { useMemo } from "react";

export const useQueryParams = () => {
  const params = useMemo(() => {
    return new URLSearchParams(globalThis.location.search);
  }, []);

  const get = (key: string) => params.get(key);

  return { get, params };
};
