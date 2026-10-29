import {useCallback, useState} from 'react';

/**
 * A value the caller controls (`value` + `onChange`) or leaves to the part (`defaultValue`), as React Aria's own
 * fields do. Returns the current value and a setter that always calls `onChange`.
 */
export function useControlledState<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void): [T, (next: T) => void] {
  const [own, setOwn] = useState(defaultValue);
  const isControlled = value !== undefined;
  const set = useCallback((next: T) => {
    if (!isControlled) setOwn(next);
    onChange?.(next);
  }, [isControlled, onChange]);
  return [isControlled ? value : own, set];
}
