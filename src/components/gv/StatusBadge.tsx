import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './StatusBadge.css';

export interface StatusBadgeProps extends PlacementProps {
  /**
   * The status (Figma "State"). The prototype also uses this pill for
   * other text ("Sent", "Accepted", "Under consideration" …) — any label goes
   * through `draft` (grey) or `live` (green), whichever tone it reads as.
   */
  status: 'draft' | 'live';
  children: ReactNode;
}

/** Status badge: a small status pill ("Draft" / "Live"). Display-only. */
export function StatusBadge({status, children, className, style}: StatusBadgeProps) {
  return (
    <span className={clsx('gv-status', className)} style={style} data-status={status}>
      {children}
    </span>
  );
}
