'use client';
import {useCallback, useEffect, useRef} from 'react';

/**
 * Keeps focus on the page when a part that can hold it goes away: a Selection bar when the selection clears, Filter
 * chips when the last filter goes. Put the returned `ref` on the part's root while it shows. When it leaves with focus
 * inside, focus moves to what `find` returns, looked up from where the part was; without this it falls to the page's
 * body and a keyboard user starts again from the top.
 */
export function useFocusOnLeave(isShown: boolean, find: (from: Element) => HTMLElement | null) {
  const root = useRef<HTMLElement | null>(null);
  const place = useRef<Element | null>(null);
  const hadFocus = useRef(false);
  const finder = useRef(find);
  finder.current = find;
  const ref = useCallback((el: HTMLElement | null) => {
    if (el) {
      root.current = el;
      place.current = el.parentElement;
      return;
    }
    // React lets go of the ref before it takes the element out, so focus is still inside it here.
    hadFocus.current = !!root.current?.contains(document.activeElement);
    root.current = null;
  }, []);
  useEffect(() => {
    if (isShown || !hadFocus.current) return;
    hadFocus.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return; // something else has taken focus already
    if (place.current?.isConnected) finder.current(place.current)?.focus();
  }, [isShown]);
  return ref;
}

/** The first match of `selector` in the nearest of `from` and its next few ancestors that holds one. */
export function nearest(from: Element, selector: string, levels = 5): HTMLElement | null {
  let el: Element | null = from;
  for (let i = 0; el && i <= levels; i++, el = el.parentElement) {
    const hit = el.querySelector<HTMLElement>(selector);
    if (hit) return hit;
  }
  return null;
}

/** A list or table a page's selection and filters act on. */
export const COLLECTION = '[role="grid"], [role="treegrid"], table';
