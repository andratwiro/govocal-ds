import type {ReactNode} from 'react';
import './Status.css';

export interface StatusProps {
  /**
   * The status tone (Figma "State"). The prototype also uses this pill for
   * other text ("Sent", "Accepted", "Under consideration" …) — any label goes
   * through `draft` (grey) or `live` (green), whichever tone it reads as.
   */
  state: 'draft' | 'live';
  children: ReactNode;
}

/** A small status pill ("Draft" / "Live"). Display-only. */
export function Status({state, children}: StatusProps) {
  return (
    <span className="gv-status" data-state={state}>
      {children}
    </span>
  );
}
