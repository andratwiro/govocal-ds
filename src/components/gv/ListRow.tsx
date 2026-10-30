'use client';
import {TriangleAlert} from 'lucide-react';
import {Checkbox} from './Checkbox';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './ListRow.css';

/** The words List row says itself (docs/API.md rule 11). Common ground row takes the same keys. */
export interface ListRowLabels {
  /** The row checkbox's name, when its own `aria-label` isn't given. */
  select: string;
  /** The warning mark's name. */
  needsAttention: string;
}

/** List row's English words; a page passes its own over them with `labels`. */
export const listRowLabels: ListRowLabels = {select: 'Select', needsAttention: 'Needs attention'};

/** A row's checkbox in its leading 28px slot (the prototype's Manage tables). */
export interface ListRowSelect {
  /** Whether this row is selected (ticked and tinted). */
  isSelected?: boolean;
  /** Fires when the row's box is toggled, with the new state. */
  onChange?: (isSelected: boolean) => void;
  /** This row's checkbox name ("Select Bike lanes"). @default `labels.select` */
  'aria-label'?: string;
}

export interface ListRowProps extends PlacementProps {
  /** The idea/input title. Wraps up to three lines. */
  title: string;
  /** The row's status label, e.g. "Under consideration". */
  status: string;
  /** A thumbnail image URL (Figma `Image=Yes`). */
  thumbnail?: string;
  /** Shows the warning mark at the end of the title cell (Figma `Marks=Warning`). */
  hasWarning?: boolean;
  /**
   * A checkbox in the row's leading slot, shown on hover, on focus and once checked; a
   * checked row is tinted. The prototype's Manage table. Not in Figma (its leading 28 is empty).
   */
  select?: ListRowSelect;
  /** Its own words, over `listRowLabels`. */
  labels?: Partial<ListRowLabels>;
  /**
   * The row is a row of a table (`role="row"`), its checkbox, title and status each a cell: under a `ListHeader`,
   * whose heads make the list a table (`role="table"`). Left out, it is plain content (a list item's, a card's).
   *
   * @default false
   */
  isRow?: boolean;
}

/**
 * The content of one Ideation-method list row: a title cell (with an optional
 * thumbnail and warning mark) and a status cell, between a leading 28px slot
 * (checkbox) and a trailing 28px slot (under the header's add-column button).
 * Pair it with `ListHeader` (pass `selectAll` so the columns line up) and `isRow`, so each row is a row of the
 * table the header heads. A table people sort, filter and open rows of is a Data table.
 */
export function ListRow({title, status, thumbnail, hasWarning, select, labels, isRow, className, style}: ListRowProps) {
  const l = mergeLabels(listRowLabels, labels);
  const cell = isRow ? 'cell' : undefined;
  return (
    <div
      className={clsx('gv-list-row', className)} style={style}
      role={isRow ? 'row' : undefined}
      data-selectable={select ? true : undefined}
      data-selected={select?.isSelected || undefined}>
      <span className="gv-list-row__lead" role={isRow && select ? 'cell' : undefined}>
        {select && (
          <Checkbox
            isSelected={select.isSelected}
            onChange={select.onChange}
            aria-label={select['aria-label'] ?? l.select}
          />
        )}
      </span>
      <div className="gv-list-row__cells">
        <div className="gv-list-row__title-cell" role={cell}>
          {thumbnail && (
            <img className="gv-list-row__thumbnail" src={thumbnail} alt="" aria-hidden />
          )}
          <span className="gv-list-row__title">{title}</span>
          {hasWarning && (
            <span className="gv-list-row__marks">
              <TriangleAlert
                role="img"
                aria-label={l.needsAttention}
                className="gv-list-row__warning"
                size={16}
                strokeWidth={1.75}
              />
            </span>
          )}
        </div>
        <div className="gv-list-row__status-cell" role={cell}>{status}</div>
      </div>
    </div>
  );
}
