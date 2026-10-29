'use client';
import {Checkbox} from './Checkbox';
import {ListHeaderCell} from './ListHeaderCell';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './ListHeader.css';

/** The words List header says itself (docs/API.md rule 11). It hands `addColumn` to its add-column cell. */
export interface ListHeaderLabels {
  /** The select-all checkbox's name, when its own `aria-label` isn't given. */
  selectAll: string;
  /** The add-column button's name. */
  addColumn: string;
}

/** List header's English words; a page passes its own over them with `labels`. */
export const listHeaderLabels: ListHeaderLabels = {selectAll: 'Select all', addColumn: 'Add column'};

export interface ListHeaderColumn {
  /** A stable key, used when the list is sorted. */
  key: string;
  label: string;
  /** @default 'label' */
  kind?: 'label' | 'number';
  /** A static column (no sort affordance), e.g. Status. */
  isStatic?: boolean;
  /** This column is the one the list is currently sorted by. */
  isSorted?: boolean;
  /**
   * Fixed column width in px, matching Figma's spec per method. The first column always
   * takes the room the others leave (at least 160), as in Figma and the prototype.
   */
  width?: number;
}

/** The select-all checkbox in the header's leading 28px slot (Figma's Checkbox instance). */
export interface ListHeaderSelectAll {
  isSelected?: boolean;
  isIndeterminate?: boolean;
  onChange?: (isSelected: boolean) => void;
  /** @default `labels.selectAll` */
  'aria-label'?: string;
}

export interface ListHeaderProps extends PlacementProps {
  columns: ListHeaderColumn[];
  onSort?: (key: string) => void;
  /** Shows the trailing "Add column" cell, e.g. for the Ideation method. */
  onAddColumn?: () => void;
  /**
   * The select-all checkbox (Figma `Method=Ideation` and `Common ground`). Its 28px slot lines the
   * columns up with `ListRow` and `CommonGroundRow`, which keep the same slot for their own checkbox.
   */
  selectAll?: ListHeaderSelectAll;
  /**
   * Keeps the leading 28px slot empty when there is no `selectAll`, e.g. inside a `Table` that
   * draws its own checkboxes, so the columns still line up with `ListRow`.
   *
   * @default false
   */
  hasLeadSlot?: boolean;
  /** Its own words, over `listHeaderLabels`. */
  labels?: Partial<ListHeaderLabels>;
}

/** The CSS grid track list for a column set: the first column fills, the rest are fixed. */
export function listColumnsTemplate(columns: ListHeaderColumn[]) {
  return columns
    .map((c, i) => (i === 0 || !c.width ? 'minmax(160px, 1fr)' : `${c.width}px`))
    .join(' ');
}

export function ListHeader({columns, onSort, onAddColumn, selectAll, hasLeadSlot, labels, className, style}: ListHeaderProps) {
  const l = mergeLabels(listHeaderLabels, labels);
  return (
    <div className={clsx('gv-list-header', className)} style={style}>
      {(selectAll || hasLeadSlot) && (
        <span className="gv-list-header__lead">
          {selectAll && (
            <Checkbox
              isSelected={selectAll.isSelected}
              isIndeterminate={selectAll.isIndeterminate}
              onChange={selectAll.onChange}
              aria-label={selectAll['aria-label'] ?? l.selectAll}
            />
          )}
        </span>
      )}
      <div className="gv-list-header__columns" style={{gridTemplateColumns: listColumnsTemplate(columns)}}>
        {columns.map(column => (
          <ListHeaderCell
            key={column.key}
            kind={column.kind}
            isStatic={column.isStatic}
            isSorted={column.isSorted}
            onPress={onSort ? () => onSort(column.key) : undefined}>
            {column.label}
          </ListHeaderCell>
        ))}
      </div>
      <span className="gv-list-header__trail">
        {onAddColumn && <ListHeaderCell kind="add-column" onPress={onAddColumn} aria-label={l.addColumn} />}
      </span>
    </div>
  );
}
