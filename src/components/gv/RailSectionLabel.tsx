import type {ReactNode} from 'react';
import './RailSectionLabel.css';

export interface RailSectionLabelProps {
  /** e.g. "Timeline". */
  children: ReactNode;
}

export function RailSectionLabel({children}: RailSectionLabelProps) {
  return <div className="gv-rail-section-label">{children}</div>;
}
