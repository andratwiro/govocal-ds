'use client';
import {Link} from 'react-aria-components';
import type {ReactNode} from 'react';
import './RailPhase.css';

export type RailPhaseStatus = 'upcoming' | 'live' | 'completed';

export interface RailPhaseProps {
  /** The phase name, e.g. "Collect ideas". */
  title: ReactNode;
  /** Status dot: upcoming (not started), live (running now) or completed (past). */
  status: RailPhaseStatus;
  /** Meta line under the title, e.g. "12 Oct – 2 Nov · Ideation" or "Upcoming · Ideation". */
  meta?: ReactNode;
  href?: string;
  /** Marks the phase currently being viewed. */
  current?: boolean;
  onPress?: () => void;
}

export function RailPhase({title, status, meta, href, current, onPress}: RailPhaseProps) {
  return (
    <Link
      href={href}
      onPress={onPress}
      aria-current={current ? 'page' : undefined}
      className="gv-rail-phase"
      data-status={status}
      data-current={current || undefined}>
      <span className="gv-rail-phase__dot" aria-hidden />
      <span className="gv-rail-phase__body">
        <span className="gv-rail-phase__name">{title}</span>
        {meta && <span className="gv-rail-phase__meta">{meta}</span>}
      </span>
    </Link>
  );
}
