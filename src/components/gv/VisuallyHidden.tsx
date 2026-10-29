'use client';
import type {ReactNode} from 'react';
import {VisuallyHidden as RACVisuallyHidden} from 'react-aria-components/VisuallyHidden';

export interface VisuallyHiddenProps {
  /** What a screen reader reads and a sighted reader doesn't need, e.g. a heading that names a tab's content. */
  children: ReactNode;
  /** The element: `span` by default, `h2`–`h6` for a heading that keeps the outline in order. */
  elementType?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  /** Shows the content while it holds keyboard focus (a "Skip to content" link). */
  isFocusable?: boolean;
  /** The element's `id`. */
  id?: string;
}

/**
 * Visually hidden: content for screen readers only, kept in the page's reading order. React Aria's VisuallyHidden,
 * which clips it to nothing without `display: none` (that would hide it from screen readers too). It takes no
 * `className` or `style`: there is nothing to place, and a style could undo the hiding.
 *
 * ```tsx
 * <VisuallyHidden elementType="h2">Inputs</VisuallyHidden>
 * ```
 */
export function VisuallyHidden({children, elementType = 'span', isFocusable, id}: VisuallyHiddenProps) {
  return (
    <RACVisuallyHidden elementType={elementType} isFocusable={isFocusable} id={id}>
      {children}
    </RACVisuallyHidden>
  );
}
