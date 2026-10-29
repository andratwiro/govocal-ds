'use client';
import {TriangleAlert} from 'lucide-react';
import {Checkbox} from './Checkbox';
import type {ListRowSelect} from './ListRow';
import './ListRowCommonGround.css';

export interface ListRowCommonGroundProps {
  /** The Common Ground statement text. */
  statement: string;
  /** Shows the "New" accent label at the end of the statement cell. */
  isNew?: boolean;
  /** Shows the warning mark (a flagged statement). */
  warning?: boolean;
  /**
   * The assigned reviewer. Omit for a row with no assignee cell content at all (Figma `Empty`,
   * a statement the project team wrote); `null` for an unassigned one (an empty dashed ring);
   * an initial for an assigned one (a filled avatar).
   */
  assignee?: {initial: string} | null;
  /** The Likes column: participants' likes, or `null` for a statement nobody can like ("–"). */
  likes?: number | null;
  /** Percent who agree, 0-100 (the Agree column). */
  agreePercent: number;
  /** The Reactions column: agree + disagree + pass so far. */
  reactions?: number;
  /** @deprecated The Likes column; use `likes`. */
  reactionCount?: number | null;
  /** @deprecated The Reactions column; use `reactions`. */
  visibleCount?: number;
  /** A checkbox in the leading slot, as on `ListRow`. Not in Figma. */
  select?: ListRowSelect;
}

/**
 * The content of one Common Ground list row: Statement · Assignee · Likes · Agree ·
 * Reactions, between a leading 28px checkbox slot and a trailing 28px slot, as in the
 * prototype's Manage table. Pair it with `ListHeader` (pass `selectAll`).
 */
export function ListRowCommonGround({
  statement,
  isNew,
  warning,
  assignee,
  likes,
  agreePercent,
  reactions,
  reactionCount,
  visibleCount,
  select
}: ListRowCommonGroundProps) {
  const likeCount = likes !== undefined ? likes : reactionCount;
  const reactionTotal = reactions ?? visibleCount;
  return (
    <div
      className="gv-list-row-cg"
      data-selectable={select ? true : undefined}
      data-selected={select?.isSelected || undefined}>
      <span className="gv-list-row-cg__lead">
        {select && (
          <Checkbox
            isSelected={select.isSelected}
            onChange={select.onChange}
            aria-label={select['aria-label'] ?? 'Select'}
          />
        )}
      </span>
      <div className="gv-list-row-cg__cells">
        <div className="gv-list-row-cg__statement-cell">
          <span className="gv-list-row-cg__statement">{statement}</span>
          {warning && (
            <span className="gv-list-row-cg__marks">
              <TriangleAlert
                role="img"
                aria-label="Needs attention"
                className="gv-list-row-cg__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
          {isNew && <span className="gv-list-row-cg__new">New</span>}
        </div>
        <div className="gv-list-row-cg__cell gv-list-row-cg__assignee-cell">
          {assignee !== undefined && (
            <span className="gv-list-row-cg__avatar" data-filled={Boolean(assignee?.initial)}>
              {assignee?.initial}
            </span>
          )}
        </div>
        <div className="gv-list-row-cg__cell" data-num data-tone="secondary">
          {likeCount == null ? <span className="gv-list-row-cg__none">–</span> : likeCount}
        </div>
        <div className="gv-list-row-cg__cell" data-num>
          {agreePercent}%
        </div>
        <div className="gv-list-row-cg__cell" data-num data-tone="secondary">
          {reactionTotal}
        </div>
      </div>
    </div>
  );
}
