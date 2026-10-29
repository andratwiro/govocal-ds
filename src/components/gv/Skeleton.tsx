import type {CSSProperties} from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** Width of the placeholder (css length, e.g. '64%' or 120). */
  width?: number | string;
  /** Height of the placeholder (css length, e.g. 16). */
  height?: number | string;
  /** Its shape: a text line, a solid block, a chip (pill) or a circle (avatar). @default 'line' */
  variant?: 'line' | 'block' | 'pill' | 'circle';
  className?: string;
  style?: CSSProperties;
}

/**
 * A grey placeholder. Not in Figma: from the prototype (augur-design.html .pj-skel), used while the phone preview
 * or a list of rows is still loading. Display-only: a calm pulse, never focusable.
 */
export function Skeleton({width, height, variant = 'line', className, style}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={['gv-skeleton', `gv-skeleton--${variant}`, className].filter(Boolean).join(' ')}
      style={{width, height, ...style}}
    />
  );
}
