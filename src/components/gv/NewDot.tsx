import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './NewDot.css';

export interface NewDotProps extends PlacementProps {
  /** Visually-hidden text for screen readers; the dot alone says nothing to them. */
  'aria-label'?: string;
}

/** A small unread/new indicator dot, next to a row or sidebar item. Display-only. */
export function NewDot({'aria-label': ariaLabel = 'New', className, style}: NewDotProps) {
  return <span className={clsx('gv-new-dot', className)} style={style} role="img" aria-label={ariaLabel} />;
}
