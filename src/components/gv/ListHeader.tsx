'use client';
import {Checkbox} from './Checkbox';
import {ListHeaderCell} from './ListHeaderCell';
import './ListHeader.css';

export interface ListHeaderColumn {
  /** A stable key, used when the list is sorted. */
  key: string;
  label: string;
  /** @default 'label' */
  variant?: 'label' | 'number';
  /** A static column (no sort affordance), e.g. Status. */
  square?: boolean;
  /** This column is the one the list is currently sorted by. */
  sorted?: boolean;
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
  /** @default 'Select all' */
  'aria-label'?: string;
}

export interface ListHeaderProps {
  /** The input method this header belongs to (Figma `Method`), for the `AllVariants` story only. */
  method?: 'ideation' | 'common-ground' | 'proposals' | 'voting';
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
  leadSlot?: boolean;
  className?: string;
}

/** The CSS grid track list for a column set: the first column fills, the rest are fixed. */
export function listColumnsTemplate(columns: ListHeaderColumn[]) {
  return columns
    .map((c, i) => (i === 0 || !c.width ? 'minmax(160px, 1fr)' : `${c.width}px`))
    .join(' ');
}

export function ListHeader({columns, onSort, onAddColumn, selectAll, leadSlot, className}: ListHeaderProps) {
  return (
    <div className={`gv-list-header${className ? ` ${className}` : ''}`}>
      {(selectAll || leadSlot) && (
        <span className="gv-list-header__lead">
          {selectAll && (
            <Checkbox
              isSelected={selectAll.isSelected}
              isIndeterminate={selectAll.isIndeterminate}
              onChange={selectAll.onChange}
              aria-label={selectAll['aria-label'] ?? 'Select all'}
            />
          )}
        </span>
      )}
      <div className="gv-list-header__columns" style={{gridTemplateColumns: listColumnsTemplate(columns)}}>
        {columns.map(column => (
          <ListHeaderCell
            key={column.key}
            variant={column.variant}
            square={column.square}
            sorted={column.sorted}
            onPress={onSort ? () => onSort(column.key) : undefined}>
            {column.label}
          </ListHeaderCell>
        ))}
      </div>
      <span className="gv-list-header__trail">
        {onAddColumn && <ListHeaderCell variant="add-column" onPress={onAddColumn} />}
      </span>
    </div>
  );
}
