'use client';
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
  /** Fixed column width in px, matching Figma's spec per method. */
  width?: number;
}

export interface ListHeaderProps {
  /** The input method this header belongs to (Figma `Method`), for the `AllVariants` story only. */
  method?: 'ideation' | 'common-ground' | 'proposals' | 'voting';
  columns: ListHeaderColumn[];
  onSort?: (key: string) => void;
  /** Shows the trailing "Add column" cell, e.g. for the Ideation method. */
  onAddColumn?: () => void;
  className?: string;
}

export function ListHeader({columns, onSort, onAddColumn, className}: ListHeaderProps) {
  return (
    <div className={`gv-list-header${className ? ` ${className}` : ''}`} role="row">
      <div className="gv-list-header__columns">
        {columns.map(column => (
          <div
            key={column.key}
            className="gv-list-header__cell-slot"
            style={column.width ? {width: column.width} : undefined}>
            <ListHeaderCell
              variant={column.variant}
              square={column.square}
              sorted={column.sorted}
              onPress={onSort ? () => onSort(column.key) : undefined}>
              {column.label}
            </ListHeaderCell>
          </div>
        ))}
      </div>
      {onAddColumn && <ListHeaderCell variant="add-column" onPress={onAddColumn} />}
    </div>
  );
}
