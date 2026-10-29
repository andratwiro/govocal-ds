'use client';
import {TriangleAlert} from 'lucide-react';
import {Checkbox} from '../components/gv/Checkbox';
import {listRowLabels, type ListRowLabels, type ListRowSelect} from '../components/gv/ListRow';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter, usePercentFormatter} from '../components/format';
import {mergeLabels} from '../components/labels';
import './CommonGroundRow.css';

/** The words Common Ground row says itself (docs/API.md rule 11): List row's, and the New label. */
export interface CommonGroundRowLabels extends ListRowLabels {
  new: string;
}

/** Common Ground row's English words; a page passes its own over them with `labels`. */
export const commonGroundRowLabels: CommonGroundRowLabels = {...listRowLabels, new: 'New'};

export interface CommonGroundRowProps extends PlacementProps {
  /** The Common Ground statement text. */
  statement: string;
  /** Shows the "New" accent label at the end of the statement cell. */
  isNew?: boolean;
  /** Shows the warning mark (a flagged statement). */
  hasWarning?: boolean;
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
  /** A checkbox in the leading slot, as on `ListRow`. Not in Figma. */
  select?: ListRowSelect;
  /** Its own words (Select, the warning's name, New), over `commonGroundRowLabels`. */
  labels?: Partial<CommonGroundRowLabels>;
}

/**
 * The content of one Common Ground list row: Statement · Assignee · Likes · Agree ·
 * Reactions, between a leading 28px checkbox slot and a trailing 28px slot, as in the
 * prototype's Manage table. Pair it with `ListHeader` (pass `selectAll`).
 */
export function CommonGroundRow({
  statement,
  isNew,
  hasWarning,
  assignee,
  likes,
  agreePercent,
  reactions,
  select,
  labels,
  className,
  style
}: CommonGroundRowProps) {
  const l = mergeLabels(commonGroundRowLabels, labels);
  const number = useNumberFormatter();
  const percent = usePercentFormatter();
  return (
    <div
      className={clsx('gv-list-row-cg', className)} style={style}
      data-selectable={select ? true : undefined}
      data-selected={select?.isSelected || undefined}>
      <span className="gv-list-row-cg__lead">
        {select && (
          <Checkbox
            isSelected={select.isSelected}
            onChange={select.onChange}
            aria-label={select['aria-label'] ?? l.select}
          />
        )}
      </span>
      <div className="gv-list-row-cg__cells">
        <div className="gv-list-row-cg__statement-cell">
          <span className="gv-list-row-cg__statement">{statement}</span>
          {hasWarning && (
            <span className="gv-list-row-cg__marks">
              <TriangleAlert
                role="img"
                aria-label={l.needsAttention}
                className="gv-list-row-cg__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
          {isNew && <span className="gv-list-row-cg__new">{l.new}</span>}
        </div>
        <div className="gv-list-row-cg__cell gv-list-row-cg__assignee-cell">
          {assignee !== undefined && (
            <span className="gv-list-row-cg__avatar" data-filled={Boolean(assignee?.initial)}>
              {assignee?.initial}
            </span>
          )}
        </div>
        <div className="gv-list-row-cg__cell" data-num data-tone="secondary">
          {likes == null ? <span className="gv-list-row-cg__none">–</span> : number.format(likes)}
        </div>
        <div className="gv-list-row-cg__cell" data-num>
          {percent(agreePercent)}
        </div>
        <div className="gv-list-row-cg__cell" data-num data-tone="secondary">
          {reactions != null && number.format(reactions)}
        </div>
      </div>
    </div>
  );
}
