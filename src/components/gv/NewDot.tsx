import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './NewDot.css';

/** The words New dot says itself (docs/API.md rule 11). */
export interface NewDotLabels {
  /** What the dot means to a screen reader when no `aria-label` says it. */
  new: string;
}

/** New dot's English words; a page passes its own over them with `labels`. */
export const newDotLabels: NewDotLabels = {new: 'New'};

export interface NewDotProps extends PlacementProps {
  /** What this dot means, for screen readers ("Unread"); the dot alone says nothing to them. @default `labels.new` */
  'aria-label'?: string;
  /** Its own words, over `newDotLabels`. */
  labels?: Partial<NewDotLabels>;
}

/** A small unread/new indicator dot, next to a row or sidebar item. Display-only. */
export function NewDot({'aria-label': ariaLabel, labels, className, style}: NewDotProps) {
  return <span className={clsx('gv-new-dot', className)} style={style} role="img"
    aria-label={ariaLabel ?? mergeLabels(newDotLabels, labels).new} />;
}
