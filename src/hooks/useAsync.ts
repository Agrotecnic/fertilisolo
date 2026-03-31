/**
 * Hook customizado para gerenciar operações assíncronas
 */

import { useState, useCallback } from 'react';
import { AsyncState } from '@/types/common';
import { handleApiError } from '@/utils/errorHandler';

export function useAsync<T = unknown>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await asyncFunction();
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const appError = handleApiError(error);
        setState({ data: null, loading: false, error: appError });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

