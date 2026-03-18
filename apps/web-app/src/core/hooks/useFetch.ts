import { useEffect, useState } from "react";
import { type FetchOptions, fetchService } from "../services/Fetchservice";

interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const useFetch = <T>(url: string, options?: FetchOptions): UseFetchState<T> => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await fetchService.get<T>(url, options);
        if (isMounted) {
          setState({ data: response.data, error: null, isLoading: false });
        }
      } catch (error) {
        if (isMounted) {
          const err = error instanceof Error ? error : new Error(String(error));
          setState({ data: null, error: err, isLoading: false });
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [url, options]);

  return state;
};
