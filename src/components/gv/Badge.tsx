import type {ReactNode} from 'react';
import './Badge.css';

export interface BadgeProps {
  /** A small leading icon (Figma "Icon: Yes/No"), e.g. `<Lightbulb aria-hidden size={14} />`. */
  icon?: ReactNode;
  children: ReactNode;
}

/** A small rounded label, e.g. a content type or a count ("Idea", "6 questions"). Display-only. */
export function Badge({icon, children}: BadgeProps) {
  return (
    <span className="gv-pill">
      {icon}
      <span className="gv-pill__label">{children}</span>
    </span>
  );
}
