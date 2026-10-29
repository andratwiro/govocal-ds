import type {CSSProperties} from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** Width of the placeholder (css length, e.g. '64%' or 120). */
  width?: number | string;
  /** Height of the placeholder (css length, e.g. 16). */
  height?: number | string;
  /** Shape of the placeholder — a text line, a solid block, or a circle (avatar). */
  shape?: 'line' | 'block' | 'circle';
  className?: string;
  style?: CSSProperties;
}

/**
 * Tali's grey placeholder (augur-design.html .pj-skel), used while the phone preview
 * or a list of rows is still loading. Display-only: a calm pulse, never focusable.
 */
export function Skeleton({width, height, shape = 'line', className, style}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={['gv-skeleton', `gv-skeleton--${shape}`, className].filter(Boolean).join(' ')}
      style={{width, height, ...style}}
    />
  );
}
