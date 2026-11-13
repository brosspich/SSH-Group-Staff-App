import { useEffect, useState } from "react";

/**
 * Global default debounce delay for all auto search inputs across the app (1s = 1000ms).
 * Configured centrally here so modifying this single value updates all search inputs (Single Source of Truth / DRY).
 */
export const DEFAULT_SEARCH_DEBOUNCE_MS = 1500;

export function useDebounce<T>(
  value: T,
  delayMs: number = DEFAULT_SEARCH_DEBOUNCE_MS,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // If text is cleared immediately, don't wait for debounce
    if (typeof value === "string" && value === "") {
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
