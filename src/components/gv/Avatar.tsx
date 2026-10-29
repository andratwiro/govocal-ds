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
