import type {ReactNode} from 'react';
import './StatusBadge.css';

export interface StatusBadgeProps {
  /**
   * The status tone (Figma "State"). The prototype also uses this pill for
   * other text ("Sent", "Accepted", "Under consideration" …) — any label goes
   * through `draft` (grey) or `live` (green), whichever tone it reads as.
   */
  state: 'draft' | 'live';
  children: ReactNode;
}

/** Status badge: a small status pill ("Draft" / "Live"). Display-only. */
export function StatusBadge({state, children}: StatusBadgeProps) {
  return (
    <span className="gv-status" data-state={state}>
      {children}
    </span>
  );
}
