import { useState, useCallback } from "react";

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const useAsync = <T, Args extends unknown[]>(asyncFn: (...args: Args) => Promise<T>) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await asyncFn(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, isLoading: false });
        throw err;
      }
    },
    [asyncFn],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { state, execute, reset };
};
