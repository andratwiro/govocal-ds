import type {ReactNode} from 'react';
import './Avatar.css';

export interface AvatarProps {
  /** Initials to show (1–2 characters), e.g. "S" for "Sam". */
  initials?: string;
  /**
   * The avatar's size. Figma specs only 28; 16/24 are the prototype's
   * smaller stacks (assignee chips, comment avatars), carried over for parity.
   *
   * @default 28
   */
  size?: 16 | 24 | 28;
  /**
   * The dashed, fill-less "unassigned" look from the prototype
   * (`.pj-inasg--none`); no Figma variant for it.
   *
   * @default false
   */
  unassigned?: boolean;
  /** Visually-hidden text for screen readers, e.g. "Assigned to Sam". */
  'aria-label'?: string;
}

/** A small round avatar: initials on a filled circle, or an empty/unassigned ring. Display-only. */
export function Avatar({initials, size, unassigned, 'aria-label': ariaLabel}: AvatarProps) {
  return (
    <span
      className="gv-avatar"
      data-size={size || 28}
      data-unassigned={unassigned || undefined}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}>
      {!unassigned && initials}
    </span>
  );
}

export interface AvatarGroupProps {
  /** One avatar per person, by initials, each 24 and 6 over the one before. */
  initials: string[];
  /** What follows the faces, e.g. "215 participants". */
  children?: ReactNode;
}

/** Overlapping avatars before a count ("215 participants"): Spectrum's AvatarGroup. The faces are hidden from
 * assistive tech; the count says it. */
export function AvatarGroup({initials, children}: AvatarGroupProps) {
  return (
    <span className="gv-avatar-stack">
      <span className="gv-avatar-stack__faces" aria-hidden>
        {initials.map((i, n) => <Avatar key={n} initials={i} size={24} />)}
      </span>
      {children}
    </span>
  );
}
