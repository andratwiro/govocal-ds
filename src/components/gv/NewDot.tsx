import './NewDot.css';

export interface NewDotProps {
  /** Visually-hidden text for screen readers; the dot alone says nothing to them. */
  'aria-label'?: string;
}

/** A small unread/new indicator dot, next to a row or sidebar item. Display-only. */
export function NewDot({'aria-label': ariaLabel = 'New'}: NewDotProps) {
  return <span className="gv-new-dot" role="img" aria-label={ariaLabel} />;
}
