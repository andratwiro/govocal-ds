'use client';
import {TriangleAlert} from 'lucide-react';
import './ListRowCommonGround.css';

export interface ListRowCommonGroundProps {
  /** The Common Ground statement text. */
  statement: string;
  /** Shows the "New" accent label next to the statement. */
  isNew?: boolean;
  /** Shows the warning mark (a flagged statement). */
  warning?: boolean;
  /**
   * The assigned reviewer. Omit for an unassigned row (empty avatar ring);
   * pass an initial for an assigned one (filled avatar).
   */
  assignee?: {initial: string} | null;
  /** Total reactions so far, or `null` before anyone has reacted ("–"). */
  reactionCount: number | null;
  /** Percent who agree, 0-100. */
  agreePercent: number;
  /** Total visible to all participants (e.g. likes). */
  visibleCount: number;
}

/**
 * The content of one Common Ground list row. Place inside a selectable
 * `Row`/`Cell` (Table) or `GridListItem` — see the `InATable` story.
 */
export function ListRowCommonGround({
  statement,
  isNew,
  warning,
  assignee,
  reactionCount,
  agreePercent,
  visibleCount
}: ListRowCommonGroundProps) {
  return (
    <div className="gv-list-row-cg" data-warning={warning || undefined}>
      <div className="gv-list-row-cg__statement-cell">
        <span className="gv-list-row-cg__statement">
          {statement}
          {warning && (
            <TriangleAlert
              aria-label="Needs attention"
              className="gv-list-row-cg__warning"
              size={14}
            />
          )}
        </span>
        {isNew && <span className="gv-list-row-cg__new">New</span>}
      </div>
      <div className="gv-list-row-cg__cell gv-list-row-cg__assignee-cell">
        {assignee !== undefined && (
          <span className="gv-list-row-cg__avatar" data-filled={Boolean(assignee?.initial)}>
            {assignee?.initial}
          </span>
        )}
      </div>
      <div className="gv-list-row-cg__cell gv-list-row-cg__number-cell">
        {reactionCount === null ? (
          <span className="gv-list-row-cg__none">–</span>
        ) : (
          reactionCount
        )}
      </div>
      <div className="gv-list-row-cg__cell gv-list-row-cg__number-cell">{agreePercent}%</div>
      <div className="gv-list-row-cg__cell gv-list-row-cg__number-cell gv-list-row-cg__number-cell--secondary">
        {visibleCount}
      </div>
    </div>
  );
}
