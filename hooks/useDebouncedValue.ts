import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the input value that only updates
 * after the specified delay has elapsed without further changes.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 400ms)
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
