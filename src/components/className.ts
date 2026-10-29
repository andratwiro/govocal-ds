import clsx, {type ClassValue} from 'clsx';
import type {CSSProperties} from 'react';

/**
 * What every system part takes from the page that places it. `className` and `style` place a part (grid area,
 * width, margin, alignment); they never paint it. The part merges the class with its own.
 */
export interface PlacementProps {
  /** A class that places the part: grid area, width, margin, alignment. Never paint. */
  className?: string;
  /** Inline placement, as `className`. */
  style?: CSSProperties;
}

/** A React Aria `className`: a string, or a function of the part's render state (which also carries its default). */
type RenderClassName<T> = string | ((values: T & {defaultClassName: string | undefined}) => string) | undefined;

const resolve = <T>(className: RenderClassName<T>, values: T & {defaultClassName: string | undefined}) =>
  typeof className === 'function' ? className(values) : className;

/**
 * The className contract for a wrapper over a React Aria part: React Aria's own class (`react-aria-X`) always stays,
 * then `extra` (a Base part's own `gv-base-x`, which its stylesheet keys off: `npm run css:scope`), then the caller's.
 * A caller's function form keeps working.
 */
export function keepClass<T>(className: RenderClassName<T>, ...extra: ClassValue[]) {
  return (values: T & {defaultClassName: string | undefined}) =>
    clsx(values.defaultClassName, extra, resolve(className, values));
}

/**
 * The same for a React Aria part the system paints itself: its own class (`gv-…`) stands in for React Aria's, then
 * the caller's.
 */
export function ownClass<T>(own: ClassValue, className: RenderClassName<T>) {
  return (values: T & {defaultClassName: string | undefined}) => clsx(own, resolve(className, values));
}
