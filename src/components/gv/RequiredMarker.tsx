import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './RequiredMarker.css';

/** The words Required marker says itself (docs/API.md rule 11). A part that draws one (Card, Title field, Date
 * range field) takes the same key in its own `labels` and hands it on. */
export interface RequiredMarkerLabels {
  required: string;
}

/** Required marker's English words; a page passes its own over them with `labels`. */
export const requiredMarkerLabels: RequiredMarkerLabels = {required: 'Required'};

export interface RequiredMarkerProps extends PlacementProps {
  /** Figma `Placement`: Card sits in a card's footer row, Field sits beside a form field. */
  placement?: 'card' | 'field';
  /** Its own words, over `requiredMarkerLabels`. */
  labels?: Partial<RequiredMarkerLabels>;
}

/** Required marker (Figma node 14:878): a small dot + "Required" label. Display-only. */
export function RequiredMarker({placement = 'field', labels, className, style}: RequiredMarkerProps) {
  return (
    <span className={clsx('gv-required', className)} style={style} data-placement={placement}>
      <span className="gv-required-dot" aria-hidden="true" />
      {mergeLabels(requiredMarkerLabels, labels).required}
    </span>
  );
}
