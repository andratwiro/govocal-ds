'use client';
import {Link} from 'react-aria-components';
import type {ReactNode} from 'react';
import './RailPhase.css';

export type RailPhaseStatus = 'upcoming' | 'live' | 'completed';

export interface RailPhaseProps {
  /** The phase name, e.g. "Collect ideas". */
  title: ReactNode;
  /**
   * The dot: upcoming (not started, grey), live (running now, light green) or
   * completed (past, green). Figma draws only the upcoming dot; the other two
   * colours are the prototype's.
   */
  status: RailPhaseStatus;
  /**
   * The state word that opens the meta line (Figma's "State"), e.g. "Upcoming",
   * "In progress", "Done". Green when the phase is completed or live.
   */
  state?: ReactNode;
  /**
   * The rest of the meta line, e.g. "29 Jul to 30 Sep · Ideation". After a
   * `state` it is joined with " · "; without one it is the whole line
   * ("Upcoming · Ideation").
   */
  meta?: ReactNode;
  /**
   * A data chip on its own line under the name, e.g. "312 ideas". Not in
   * Figma: the prototype shows one on completed and live phases.
   */
  chip?: ReactNode;
  /**
   * "N new" at the top right, with a red dot. Not in Figma: the prototype
   * shows it when a phase has unread inputs. The name keeps 56 free for it.
   */
  newCount?: number;
  href?: string;
  /**
   * Marks the phase being viewed (`aria-current="page"`). It draws nothing:
   * the prototype dropped the tinted card of the open phase.
   */
  current?: boolean;
  onPress?: () => void;
}

/**
 * A phase in the project rail. Phases placed one after another (siblings, or
 * each in its own `<li>`) are joined by a guide line through their dots, green
 * after a completed phase.
 */
export function RailPhase({
  title,
  status,
  state,
  meta,
  chip,
  newCount,
  href,
  current,
  onPress
}: RailPhaseProps) {
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
        {chip != null && <span className="gv-rail-phase__chip">{chip}</span>}
        {(state != null || meta != null) && (
          <span className="gv-rail-phase__meta" data-after-chip={chip != null || undefined}>
            {state != null && <span className="gv-rail-phase__state">{state}</span>}
            {state != null && meta != null && ' · '}
            {meta}
          </span>
        )}
      </span>
      {newCount != null && newCount > 0 && (
        <span className="gv-rail-phase__new">
          <span className="gv-rail-phase__new-dot" aria-hidden />
          {newCount} new
        </span>
      )}
    </Link>
  );
}
