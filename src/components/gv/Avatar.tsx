'use client';
import {useState, type ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Avatar.css';

export interface AvatarProps extends PlacementProps {
  /** Initials to show (1–2 characters), e.g. "S" for "Sam". Also what shows while a photo loads or if it fails. */
  initials?: string;
  /**
   * A photo of the person (Not in Figma; the prototype's Audience table). It covers the circle; if it can't load,
   * the initials show instead.
   */
  src?: string;
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

/**
 * A small round avatar: initials on a filled circle, a photo over them, or an empty/unassigned ring. Display-only:
 * the photo is decorative (`alt=""`); the avatar's `aria-label`, or the name beside it, says who it is.
 */
export function Avatar({initials, src, size, unassigned, 'aria-label': ariaLabel, className, style}: AvatarProps) {
  // The photo that failed, so a new `src` gets its own try.
  const [failed, setFailed] = useState<string>();
  const photo = !unassigned && !!src && failed !== src;
  return (
    <span
      className={clsx('gv-avatar', className)} style={style}
      data-size={size || 28}
      data-unassigned={unassigned || undefined}
      data-photo={photo || undefined}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}>
      {!unassigned && initials}
      {photo && <img className="gv-avatar__photo" src={src} alt="" onError={() => setFailed(src)} />}
    </span>
  );
}

export interface AvatarGroupProps extends PlacementProps {
  /** One avatar per person, by initials, each 24 and 6 over the one before. */
  initials: string[];
  /** What follows the faces, e.g. "215 participants". */
  children?: ReactNode;
}

/** Overlapping avatars before a count ("215 participants"): Spectrum's AvatarGroup. The faces are hidden from
 * assistive tech; the count says it. */
export function AvatarGroup({initials, children, className, style}: AvatarGroupProps) {
  return (
    <span className={clsx('gv-avatar-stack', className)} style={style}>
      <span className="gv-avatar-stack__faces" aria-hidden>
        {initials.map((i, n) => <Avatar key={n} initials={i} size={24} />)}
      </span>
      {children}
    </span>
  );
}
