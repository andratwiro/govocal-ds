'use client';
import {TriangleAlert} from 'lucide-react';
import './ListRow.css';

export interface ListRowProps {
  /** The idea/input title. */
  title: string;
  /** The row's status label, e.g. "Under consideration". */
  status: string;
  /** A thumbnail image URL (Figma `Image=Yes`). */
  thumbnail?: string;
  /** Shows the warning mark next to the title (Figma `Marks=Warning`). */
  warning?: boolean;
}

/**
 * The content of one Ideation-method list row: a title cell (with an optional
 * thumbnail and warning mark) and a status cell. Place inside a selectable
 * `Row`/`Cell` (Table) or `GridListItem` to get checkbox selection, keyboard
 * navigation and focus for free — see the `InATable` story.
 */
export function ListRow({title, status, thumbnail, warning}: ListRowProps) {
  return (
    <div className="gv-list-row">
      <div className="gv-list-row__title-cell">
        {thumbnail && (
          <img className="gv-list-row__thumbnail" src={thumbnail} alt="" aria-hidden />
        )}
        <span className="gv-list-row__title">{title}</span>
        {warning && (
          <TriangleAlert
            aria-label="Needs attention"
            className="gv-list-row__warning"
            size={14}
          />
        )}
      </div>
      <div className="gv-list-row__status-cell">{status}</div>
    </div>
  );
}
