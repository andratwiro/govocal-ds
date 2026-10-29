import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './RequiredMarker.css';

export interface RequiredMarkerProps extends PlacementProps {
  /** Figma `Placement`: Card sits in a card's footer row, Field sits beside a form field. */
  placement?: 'card' | 'field';
}

/** Required marker (Figma node 14:878): a small dot + "Required" label. Display-only. */
export function RequiredMarker({placement = 'field', className, style}: RequiredMarkerProps) {
  return (
    <span className={clsx('gv-required', className)} style={style} data-placement={placement}>
      <span className="gv-required-dot" aria-hidden="true" />
      Required
    </span>
  );
}
