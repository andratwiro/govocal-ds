'use client';
import type {CSSProperties, ReactNode} from 'react';
import {clsx} from 'clsx';
import {mergeLabels} from '../labels';
import './MissingPart.css';

/** The words Missing part says itself (docs/API.md rule 11). */
export interface MissingPartLabels {
  /** The frame's label, given the missing part's name. */
  missing: (name: string) => string;
}

/** Missing part's English words; a page passes its own over them with `labels`. */
export const missingPartLabels: MissingPartLabels = {missing: name => `Missing: ${name}`};

export interface MissingPartProps {
  /** The part the system doesn't have yet, by the name it would get: "Email preview", "Sortable list". */
  name: string;
  /** A plain stand-in for it, built from what the system has. */
  children: ReactNode;
  /**
   * A dashed outline only, with no label, around something small in a row (a table cell, a toolbar, a card's
   * picture). Name it in a line the page shows near it ("Dashed outline: the system has no component yet for …").
   */
  isInline?: boolean;
  /** Its own words ("Missing: <name>"), over `missingPartLabels`. */
  labels?: Partial<MissingPartLabels>;
  /** Places the frame (a grid area, a width); never paints it. */
  className?: string;
  /** Inline placement, as `className`. */
  style?: CSSProperties;
}

/**
 * Missing part: a dashed frame, named "Missing: <name>", around a plain stand-in for a part the system doesn't have
 * yet, so a screen built from the system says what the system still lacks. Not in Figma: the back office marks its
 * gaps with it, and the system adds the part on its second use. `data-missing-part` carries the name, for tests.
 *
 * ```tsx
 * <MissingPart name="Email preview"><p>{email.body}</p></MissingPart>
 * ```
 */
export function MissingPart({name, children, isInline, labels, className, style}: MissingPartProps) {
  if (isInline) {
    return (
      <span className={clsx('gv-missing-part', className)} style={style} data-missing-part={name} data-inline>
        {children}
      </span>
    );
  }
  return (
    <div className={clsx('gv-missing-part', className)} style={style} data-missing-part={name}>
      <span className="gv-missing-part__label">{mergeLabels(missingPartLabels, labels).missing(name)}</span>
      {children}
    </div>
  );
}
