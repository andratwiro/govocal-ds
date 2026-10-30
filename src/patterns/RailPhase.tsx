'use client';
import {Link} from 'react-aria-components/Link';
import type {ReactNode} from 'react';
import {Trash2} from 'lucide-react';
import {IconButton} from '../components/gv/IconButton';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './RailPhase.css';

/** The words Rail phase says itself (docs/API.md rule 11). */
export interface RailPhaseLabels {
  /** "N new" at the top right. */
  new: CountLabel;
  /** The delete button's name, given the title when it is text. */
  delete: (title?: string) => string;
  /** The delete button's tooltip. */
  deletePhase: string;
}

/** Rail phase's English words; a page passes its own over them with `labels`. */
export const railPhaseLabels: RailPhaseLabels = {
  new: (count, n) => `${n} new`,
  delete: title => (title ? `Delete ${title}` : 'Delete phase'),
  deletePhase: 'Delete phase'
};

export type RailPhaseStatus = 'upcoming' | 'live' | 'completed';

export interface RailPhaseProps extends PlacementProps {
  /**
   * `phase`: a step of the timeline, its dot on the guide line. `event`: a dated event in the rail's Events section
   * (a meeting, a walk), with no dot, no guide line and no chip: its name, then "Done · 10 Sep". Not in Figma: the
   * prototype's rail.
   *
   * @default 'phase'
   */
  kind?: 'phase' | 'event';
  /** The phase name, e.g. "Collect ideas". */
  title: ReactNode;
  /**
   * The dot: upcoming (not started, grey), live (running now, light green) or
   * completed (past, green). Figma draws only the upcoming dot; the other two
   * colours are the prototype's.
   */
  status: RailPhaseStatus;
  /**
   * The status word that opens the meta line (Figma's "State"), e.g. "Upcoming",
   * "In progress", "Done". Green when the phase is completed or live.
   */
  statusLabel?: ReactNode;
  /**
   * The rest of the meta line, e.g. "29 Jul to 30 Sep · Ideation". After a
   * `statusLabel` it is joined with " · "; without one it is the whole line
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
  /** Where the row leads (a link). */
  href?: string;
  /**
   * Marks the phase being viewed (`aria-current="page"`). It draws nothing:
   * the prototype dropped the tinted card of the open phase.
   */
  isCurrent?: boolean;
  /** Fires when the row is pressed. */
  onPress?: () => void;
  /**
   * A delete button at the end of the row, shown while the row is hovered or has focus (it is always in the tab
   * order). It takes "N new"'s place while it shows. Not in Figma: the prototype's rail.
   */
  onDelete?: () => void;
  /** Its own words ("N new", the delete button's name and tooltip), over `railPhaseLabels`. */
  labels?: Partial<RailPhaseLabels>;
}

/**
 * One phase of a project in the project rail, the column of phases on the left of a project's admin screens: its dot,
 * name, count, status, dates and method, and "N new". Phases placed one after another (siblings, or each in its own
 * `<li>`) are joined by a guide line through their dots, green after a completed phase.
 */
export function RailPhase({
  kind = 'phase',
  title,
  status,
  statusLabel: state,
  meta,
  chip,
  newCount,
  href,
  isCurrent: current,
  onPress,
  onDelete,
  labels,
  className,
  style
}: RailPhaseProps) {
  const l = mergeLabels(railPhaseLabels, labels);
  const number = useNumberFormatter();
  return (
    <div
      className={clsx('gv-rail-phase', className)} style={style}
      data-status={status}
      data-kind={kind === 'event' ? 'event' : undefined}
      data-current={current || undefined}
      data-deletable={onDelete ? true : undefined}>
      <Link href={href} onPress={onPress} aria-current={current ? 'page' : undefined} className="gv-rail-phase__link">
        <span className="gv-rail-phase__dot" aria-hidden />
        <span className="gv-rail-phase__body">
          <span className="gv-rail-phase__name">{title}</span>
          {chip != null && kind === 'phase' && <span className="gv-rail-phase__chip">{chip}</span>}
          {(state != null || meta != null) && (
            <span className="gv-rail-phase__meta" data-after-chip={(chip != null && kind === 'phase') || undefined}>
              {state != null && <span className="gv-rail-phase__state">{state}</span>}
              {state != null && meta != null && ' · '}
              {meta}
            </span>
          )}
        </span>
        {newCount != null && newCount > 0 && (
          <span className="gv-rail-phase__new">
            <span className="gv-rail-phase__new-dot" aria-hidden />
            {l.new(newCount, number.format(newCount))}
          </span>
        )}
      </Link>
      {onDelete && (
        <span className="gv-rail-phase__delete">
          <TooltipTrigger>
            <IconButton aria-label={l.delete(typeof title === 'string' ? title : undefined)} onPress={onDelete}>
              <Trash2 aria-hidden size={16} />
            </IconButton>
            <Tooltip>{l.deletePhase}</Tooltip>
          </TooltipTrigger>
        </span>
      )}
    </div>
  );
}
