/**
 * API React Hooks
 * Custom React hooks for API calls with loading, error states, and caching
 */

"use client";

import { useState, useCallback } from "react";
import type { ApiClientError } from "./client";

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
}

export interface UseApiReturn<T, TParams extends unknown[] = []>
  extends UseApiState<T> {
  execute: (...params: TParams) => Promise<T | null>;
  reset: () => void;
}

export interface UseMutationReturn<T, TData = unknown> extends UseApiState<T> {
  mutate: (data: TData) => Promise<T | null>;
  reset: () => void;
}

// ============================================================================
// Generic API Hook
// ============================================================================

/**
 * Generic hook for API calls
 * Handles loading, error states, and provides execute function
 */
export function useApi<T, TParams extends unknown[] = []>(
  apiFunction: (...params: TParams) => Promise<T>
): UseApiReturn<T, TParams> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  const execute = useCallback(
    async (...params: TParams): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...params);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err as ApiClientError;
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// ============================================================================
// Mutation Hook (for POST, PUT, PATCH, DELETE)
// ============================================================================

/**
 * Hook for mutation operations (create, update, delete)
 * Optimized for single parameter mutations
 */
export function useMutation<T, TData = unknown>(
  mutationFunction: (data: TData) => Promise<T>
): UseMutationReturn<T, TData> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  const mutate = useCallback(
    async (mutationData: TData): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFunction(mutationData);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err as ApiClientError;
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

// ============================================================================
// Error Message Utility
// ============================================================================

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(error: ApiClientError | null): string {
  if (!error) return "";

  // Check for validation errors
  if (error.apiError?.error?.validation) {
    const validationErrors = error.apiError.error.validation;
    if (validationErrors.length > 0) {
      return validationErrors.map((err) => err.message).join(", ");
    }
  }

  // Return general error message
  return error.message || "An unexpected error occurred";
}
