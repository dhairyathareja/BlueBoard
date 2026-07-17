import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to debounce a value.
 * Useful for search inputs where you want to delay API calls
 * until the user stops typing.
 *
 * @param {any} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds (default: 500ms).
 * @returns {any} The debounced value.
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
