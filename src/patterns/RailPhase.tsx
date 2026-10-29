'use client';
import {Link} from 'react-aria-components/Link';
import type {ReactNode} from 'react';
import {Trash2} from 'lucide-react';
import {IconButton} from '../components/gv/IconButton';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './RailPhase.css';

export type RailPhaseStatus = 'upcoming' | 'live' | 'completed';

export interface RailPhaseProps extends PlacementProps {
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
  href?: string;
  /**
   * Marks the phase being viewed (`aria-current="page"`). It draws nothing:
   * the prototype dropped the tinted card of the open phase.
   */
  isCurrent?: boolean;
  onPress?: () => void;
  /**
   * A delete button at the end of the row, shown while the row is hovered or has focus (it is always in the tab
   * order). It takes "N new"'s place while it shows. Not in Figma: the prototype's rail.
   */
  onDelete?: () => void;
  /** The delete button's name. @default "Delete <title>" ("Delete phase" when the title isn't text) */
  deleteLabel?: string;
}

/**
 * A phase in the project rail. Phases placed one after another (siblings, or
 * each in its own `<li>`) are joined by a guide line through their dots, green
 * after a completed phase.
 */
export function RailPhase({
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
  deleteLabel = typeof title === 'string' ? `Delete ${title}` : 'Delete phase',
  className,
  style
}: RailPhaseProps) {
  return (
    <div
      className={clsx('gv-rail-phase', className)} style={style}
      data-status={status}
      data-current={current || undefined}
      data-deletable={onDelete ? true : undefined}>
      <Link href={href} onPress={onPress} aria-current={current ? 'page' : undefined} className="gv-rail-phase__link">
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
      {onDelete && (
        <span className="gv-rail-phase__delete">
          <TooltipTrigger>
            <IconButton aria-label={deleteLabel} onPress={onDelete}>
              <Trash2 aria-hidden size={16} />
            </IconButton>
            <Tooltip>Delete phase</Tooltip>
          </TooltipTrigger>
        </span>
      )}
    </div>
  );
}
