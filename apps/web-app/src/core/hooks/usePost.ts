import { useCallback, useState } from "react";
import { fetchService } from "../services/Fetchservice";
import { loggerService } from "../services/Loggerservice";

interface UsePostState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const usePost = <T = unknown, D = unknown>(url: string, context?: string) => {
  const [state, setState] = useState<UsePostState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (body?: D): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const response = await fetchService.post<T>(url, body);
        setState({ data: response.data, error: null, isLoading: false });
        return response.data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, isLoading: false });

        if (context) {
          loggerService.error(context, `POST ${url} failed`, error);
        }

        throw err;
      }
    },
    [url, context],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { state, execute, reset };
};
